// oxlint-disable no-console
// From https://github.com/genu/nuxt-codegen/blob/master/src/module.ts
// and licensed under the MIT License
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { defineNuxtModule, getLayerDirectories } from '@nuxt/kit'
import type { Nuxt, WatchEvent } from 'nuxt/schema'
import { basename, resolve } from 'pathe'

export interface ModuleOptions {
  configFile: string
  devOnly: boolean
  extensions: string[]
}

// Matches both gql`...` tagged templates and graphql(`...`) function calls.
const GQL_CONTENT_RE = /(?:\bgql`|graphql\(`)([\s\S]*?)`/g

function extractGqlContent(source: string): string {
  const parts: string[] = []
  let match: RegExpExecArray | null
  GQL_CONTENT_RE.lastIndex = 0
  while ((match = GQL_CONTENT_RE.exec(source)) !== null) {
    parts.push(match[1] ?? '')
  }
  return parts.join('\n')
}

// Per-file cache of the last SHA-256 hash of extracted GQL content.
// Lets us skip codegen when only non-GQL parts of a .vue file changed.
const gqlHashCache = new Map<string, string>()

async function runCodegen(_nuxt: Nuxt) {
  const { generate, loadCodegenConfig } = await import('@graphql-codegen/cli')
  const start = Date.now()
  console.info('NuxtCodegen: Running GraphQL Code Generator')

  // Run generation for any codegen.ts files from extended Nuxt layers
  const codegenFiles = getLayerDirectories().map((layer) => layer.root)
  for (const dir of codegenFiles) {
    console.info(`NuxtCodegen: Found codegen file in layer: ${dir}`)
    const { config } = await loadCodegenConfig({ configFilePath: dir })
    await generate({ silent: true, cwd: dir, ...config })
  }

  const time = Date.now() - start
  console.info(`NuxtCodegen: Finished in ${(time / 1000).toPrecision(2)} seconds`)
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-codegen',
    configKey: 'nuxtCodegen',
    compatibility: {
      nuxt: '^4.0.x',
    },
  },
  defaults: {
    configFile: 'codegen.ts',
    devOnly: false,
    extensions: ['.graphql', '.gql', '.vue'],
  },
  setup(options: ModuleOptions, nuxt: Nuxt) {
    if (options.devOnly && !nuxt.options.dev) {
      console.info('NuxtCodegen: Skipping Codegen')
      return
    }

    nuxt.hook('build:done', async () => {
      await runCodegen(nuxt)
    })

    let running = false

    nuxt.hook('builder:watch', async (_event: WatchEvent, path: string) => {
      const modifiedConfig = basename(path) === basename(options.configFile)
      const modifiedWatchedExtension = options.extensions.some((extension: string) =>
        path.endsWith(extension),
      )

      if (!modifiedWatchedExtension && !modifiedConfig) {
        return
      }

      // For .vue files, only run codegen when gql content is present and has
      // actually changed.
      if (path.endsWith('.vue')) {
        const absolutePath = resolve(nuxt.options.rootDir, path)
        let source: string
        try {
          source = await readFile(absolutePath, 'utf-8')
        } catch {
          // File temporarily inaccessible (e.g. deleted mid-watch); skip.
          return
        }

        const gqlContent = extractGqlContent(source)
        if (!gqlContent.trim()) {
          return
        }

        const hash = createHash('sha256').update(gqlContent).digest('hex')
        if (gqlHashCache.get(absolutePath) === hash) {
          return
        }
        gqlHashCache.set(absolutePath, hash)
      }

      if (running) {
        return
      }
      running = true
      try {
        await runCodegen(nuxt)
      } finally {
        running = false
      }
    })
  },
})
