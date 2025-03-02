import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    server: {
        port: 3000,
    },
    build: {
        outDir: './',
        emptyOutDir: false,
        assetsDir: './src',
        rollupOptions: {
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name][extname]',
            },
        },
    },
    base: 'ethereumwalletgenerator.com/',
});
