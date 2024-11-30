// vite.config.js
export default {
  root: './', // Set the root to the project directory (or where your index.html is located)
  server: {
    open: true,
    hmr: true,
  },
  publicDir: 'public', // Ensure Vite serves the 'public' directory as static files
};
