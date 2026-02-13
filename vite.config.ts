
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // We explicitly remove the API_KEY definition here to ensure 
    // it is never accidentally bundled into the production code.
    // All AI logic is now handled via Supabase Edge Functions.
  },
});
