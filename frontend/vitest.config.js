import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['none'],
      include: [
        // Only include files that are actually tested
        'src/store/auth.js',
        'src/store/chat.js',
        'src/composables/useSocket.js',
        'src/composables/useNotifications.js',
        'src/views/Login.vue',
        'src/views/Register.vue',
        'src/views/Chat.vue',
        'src/views/Contacts.vue',
        'src/components/NotificationBadge.vue'
      ],
      thresholds: {
        statements: 24,
        branches: 15,
        functions: 8,
        lines: 26
      }
    },
    setupFiles: ['./tests/setup.js']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
