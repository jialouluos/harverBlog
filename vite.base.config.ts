import { defineConfig, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'path';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Inspect from 'vite-plugin-inspect';
//引入
import viteCompression from 'vite-plugin-compression';
//在plugins配置数组里添加gzip插件

export default defineConfig({


    cacheDir: 'node_modules/.vite', // 存储缓存文件的目录
    root: process.cwd(), // 项目根目录（index.html 文件所在的位置）,
    plugins: [vue(),
    AutoImport({
        include: [
            /\.[tj]sx?$/,
            /\.vue$/,
            /\.vue\?vue/,
            /\.md$/,
        ],
        imports: ['vue', 'vue-router', 'pinia'],
        eslintrc: {
            enabled: false,
            filepath: './.eslintrc-auto-import.json',
            globalsPropValue: true,
        },
        // dts: './src/auto-imports.d.ts',
        resolvers: [ElementPlusResolver(), IconsResolver({
            prefix: 'I',
        }),],
    }),
    Components({
        resolvers: [IconsResolver({
            enabledCollections: ['ep'],
        }), ElementPlusResolver()],
        // dts: './src/components.d.ts',
    }),
    Icons({
        autoInstall: true,
    }),
    // Inspect(),
    viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
    })
    ],
    optimizeDeps: {
        exclude: [],//排除不优化的模块(依赖预构建)
    },
    envPrefix: "ENV_",//环境变量前缀
    server: {
        proxy: {
            '/ee': {
                target: 'http://8.217.49.181:3000',
                // target: 'http://localhost:3000',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/ee/, '')
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    },
    css: {
        // css预处理器
        preprocessorOptions: {
            less: {
                // charset: false,
                // additionalData: `@import "${path.resolve(__dirname, 'src/index.module.less')}";`,
                javascriptEnabled: true,
            },
        },
    }


}) as UserConfig;