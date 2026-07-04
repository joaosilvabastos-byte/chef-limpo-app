import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      'react-native': 'react-native-web' // Isto diz ao Vite: "quando pedirem react-native, usa a versão web"
    }
  }
})