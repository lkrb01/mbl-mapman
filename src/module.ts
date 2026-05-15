import { defineNuxtModule, addComponentsDir, addImportsDir, createResolver } from '@nuxt/kit'

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'mbl-mapman',
    configKey: 'mapman',
  },
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    addComponentsDir({ path: resolver.resolve('./runtime/components') })
    addImportsDir(resolver.resolve('./runtime/composables'))
  },
})
