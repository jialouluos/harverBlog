import { defineConfig, UserConfig } from 'vite';
export default defineConfig({
    build: {
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            // external: ['vue', 'element-plus'], // 注意看这里
            output: {
                chunkFileNames: 'static/js/[name]-[hash].js',
                entryFileNames: 'static/js/[name]-[hash].js',
                assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                }
                ,
            },
        },
    },
    publicDir: "public",
    base: '/', // 开发或生产环境服务的公共基础路径 配置引入相对路径的资源时的基础路径
}) as UserConfig;