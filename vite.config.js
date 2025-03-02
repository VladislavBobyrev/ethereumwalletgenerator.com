import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    server: {
        port: 3000,
    },
    build: {
        outDir: './',
        emptyOutDir: false,
        assetsDir: './',
        rollupOptions: {
            output: {
                entryFileNames: 'build-[name].js',
                chunkFileNames: 'build-[name].js',
                assetFileNames: 'build-[name][extname]',
            },
        },
    },
});
