import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        welcome: './index.html',
        exam: './exam/exam.html',       // Make sure this path is correct
        end: './end.html',
        admin: './admin.html',
        password: './password.html'
      }
    }
  }
});
