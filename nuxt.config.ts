// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    routeRules: {
      '/api/remote/**': {
        proxy: 'https://down.mptext.top/api/**'
      }
    }
  },
  app: {
    head: {
      title: '微信公众号批量查询工具',
      meta: [
        { name: 'description', content: '批量获取微信公众号信息并导出 JSON' }
      ]
    }
  }
})
