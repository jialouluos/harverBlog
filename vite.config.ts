import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite';
import viteBaseConfig from './vite.base.config';
import viteDevConfig from './vite.dev.config';
import viteProdConfig from './vite.prod.config';



const envResolver = {
  "build": (): UserConfig => Object.assign({}, viteBaseConfig, viteProdConfig),
  "serve": (): UserConfig => Object.assign({}, viteBaseConfig, viteDevConfig),
};

export default defineConfig((Env: ConfigEnv): UserConfig => {
  console.log("process", process.env.MODE,import.meta.env.MODE);
  const { command, mode } = Env;
  const env = loadEnv(mode, process.cwd(), "");
  //客户端 环境变量储存在 import.mate.env中，如果环境变量不是VITE(通过envPrefix可以自定义)开头，就不会注入到vite.config.js中
  return envResolver[command]();
});
