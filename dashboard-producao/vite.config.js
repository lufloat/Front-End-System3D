export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.148.19:18080',
        changeOrigin: true,
      }
    }
  }
}
