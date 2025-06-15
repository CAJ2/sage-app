// From https://github.com/genu/nuxt-codegen/blob/master/src/module.ts
// and licensed under the MIT License
import { defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, WatchEvent } from 'nuxt/schema'
import { basename } from 'pathe'

export interface ModuleOptions {
  configFile: string
  devOnly: boolean
  extensions: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-codegen',
    configKey: 'nuxtCodegen',
    compatibility: {
      nuxt: '^3.0.x',
    },
  },
  defaults: {
    configFile: 'codegen.ts',
    devOnly: true,
    extensions: ['.graphql', '.gql', '.vue'],
  },
  setup(options: ModuleOptions, nuxt: Nuxt) {
    if (options.devOnly && !nuxt.options.dev) {
      console.info('NuxtCodegen: Skipping Codegen')
      return
    }

    nuxt.hook('build:done', async () => {
      const { generate, loadCodegenConfig } = await import(
        '@graphql-codegen/cli'
      )
      const { config } = await loadCodegenConfig({
        configFilePath: options.configFile,
      })
      const start = Date.now()
      console.info('NuxtCodegen: Running GraphQl Code Generator')

      await generate({
        silent: true,
        ...config,
      })
      const time = Date.now() - start

      console.info(
        `NuxtCodegen: Finished in ${(time / 1000).toPrecision(2)} seconds `,
      )
    })

    nuxt.hook('builder:watch', (_event: WatchEvent, path: string) => {
      const modifiedConfig = basename(path) === basename(options.configFile)
      const modifiedWatchedExtension = options.extensions.some(
        (extension: string) => path.endsWith(extension),
      )

      if (!modifiedWatchedExtension && !modifiedConfig) {
        return
      }

      nuxt.callHook('build:done')
    })
  },
})
