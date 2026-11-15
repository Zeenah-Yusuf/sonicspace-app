import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log("Vite config loaded. React plugin enabled.");
export default defineConfig({
  plugins: [react()],
})