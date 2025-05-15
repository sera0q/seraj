import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        welcome: './public/index.html',
        exam: './public/exam.html',
        end: './public/end.html',
        admin: './public/admin.html',
        password: './public/passA.html'
      }
    }
  }
});
