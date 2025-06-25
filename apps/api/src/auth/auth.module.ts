import { MikroOrmModule } from '@mikro-orm/nestjs'
import { MikroORM } from '@mikro-orm/postgresql'
import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  Provider,
  RequestMethod,
} from '@nestjs/common'
import {
  APP_FILTER,
  DiscoveryModule,
  DiscoveryService,
  HttpAdapterHost,
  MetadataScanner,
} from '@nestjs/core'
import { createAuthMiddleware } from 'better-auth/api'
import { toNodeHandler } from 'better-auth/node'
import { APIErrorExceptionFilter } from './api-error-exception-filter'
import { configureAuth } from './auth'
import { AuthGuard } from './auth.guard'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { AuthUserService } from './authuser.service'
import { SkipBodyParsingMiddleware } from './middlewares'
import {
  AFTER_HOOK_KEY,
  AUTH_INSTANCE_KEY,
  AUTH_MODULE_OPTIONS_KEY,
  BEFORE_HOOK_KEY,
  HOOK_KEY,
} from './symbols'
import type { Auth } from 'better-auth'

/**
 * Configuration options for the AuthModule
 */
interface AuthModuleOptions {
  disableExceptionFilter?: boolean
  disableTrustedOriginsCors?: boolean
  disableBodyParser?: boolean
}

const HOOKS = [
  { metadataKey: BEFORE_HOOK_KEY, hookType: 'before' as const },
  { metadataKey: AFTER_HOOK_KEY, hookType: 'after' as const },
]

/**
 * NestJS module that integrates the Auth library with NestJS applications.
 * Provides authentication middleware, hooks, and exception handling.
 */
@Module({
  imports: [MikroOrmModule, DiscoveryModule],
  providers: [AuthService, AuthResolver, AuthGuard],
})
export class AuthModule implements NestModule, OnModuleInit {
  constructor(
    private readonly orm: MikroORM,
    @Inject(AUTH_INSTANCE_KEY) private readonly auth: Auth,
    @Inject(DiscoveryService)
    private discoveryService: DiscoveryService,
    @Inject(MetadataScanner)
    private metadataScanner: MetadataScanner,
    @Inject(HttpAdapterHost)
    private readonly adapter: HttpAdapterHost,
    @Inject(AUTH_MODULE_OPTIONS_KEY)
    private readonly options: AuthModuleOptions,
  ) {}

  onModuleInit() {
    // Setup hooks
    if (!this.auth.options.hooks) return

    const providers = this.discoveryService
      .getProviders()
      .filter(
        ({ metatype }) => metatype && Reflect.getMetadata(HOOK_KEY, metatype),
      )

    for (const provider of providers) {
      const providerPrototype = Object.getPrototypeOf(provider.instance)
      const methods = this.metadataScanner.getAllMethodNames(providerPrototype)

      for (const method of methods) {
        const providerMethod = providerPrototype[method]
        this.setupHooks(providerMethod)
      }
    }
  }

  configure(consumer: MiddlewareConsumer) {
    const conf = configureAuth(this.orm)
    this.auth.handler = conf.handler
    this.auth.api = conf.api as any
    this.auth.options = {
      ...conf.options,
    }
    this.auth.$context = conf.$context
    this.auth.$ERROR_CODES = conf.$ERROR_CODES
    const trustedOrigins = this.auth.options.trustedOrigins
    // function-based trustedOrigins requires a Request (from web-apis) object to evaluate, which is not available in NestJS (we only have a express Request object)
    // if we ever need this, take a look at better-call which show an implementation for this
    const isNotFunctionBased = trustedOrigins && Array.isArray(trustedOrigins)

    if (!this.options.disableTrustedOriginsCors && isNotFunctionBased) {
      this.adapter.httpAdapter.enableCors({
        origin: trustedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      })
    } else
      throw new Error(
        'Function-based trustedOrigins not supported in NestJS. Use string array or disable CORS with disableTrustedOriginsCors: true.',
      )

    if (!this.options.disableBodyParser)
      consumer.apply(SkipBodyParsingMiddleware).forRoutes('*')

    const handler = toNodeHandler(this.auth)
    consumer.apply(handler).forRoutes({
      path: '/auth/*path',
      method: RequestMethod.ALL,
    })
  }

  private setupHooks(providerMethod: Function) {
    if (!this.auth.options.hooks) return

    for (const { metadataKey, hookType } of HOOKS) {
      const hookPath = Reflect.getMetadata(metadataKey, providerMethod)
      if (!hookPath) continue

      const originalHook = this.auth.options.hooks[hookType]
      this.auth.options.hooks[hookType] = createAuthMiddleware(async (ctx) => {
        if (originalHook) {
          await originalHook(ctx)
        }

        if (hookPath === ctx.path) {
          await providerMethod(ctx)
        }
      })
    }
  }

  /**
   * Static factory method to create and configure the AuthModule.
   * @param auth - The Auth instance to use
   * @param options - Configuration options for the module
   */
  static async registerAsync(options: AuthModuleOptions = {}) {
    const auth = { options: { hooks: {} } }

    // Initialize hooks with an empty object if undefined
    // Without this initialization, the setupHook method won't be able to properly override hooks
    // It won't throw an error, but any hook functions we try to add won't be called
    auth.options.hooks = {
      ...auth.options.hooks,
    }

    const providers: Provider[] = [
      {
        provide: AUTH_INSTANCE_KEY,
        useValue: auth,
      },
      {
        provide: AUTH_MODULE_OPTIONS_KEY,
        useValue: options,
      },
      AuthService,
      AuthUserService,
    ]

    if (!options.disableExceptionFilter) {
      providers.push({
        provide: APP_FILTER,
        useClass: APIErrorExceptionFilter,
      })
    }

    return {
      module: AuthModule,
      providers,
      exports: [
        {
          provide: AUTH_INSTANCE_KEY,
          useValue: auth,
        },
        {
          provide: AUTH_MODULE_OPTIONS_KEY,
          useValue: options,
        },
        AuthService,
        AuthUserService,
      ],
    }
  }
}
