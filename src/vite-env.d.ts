/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module 'three/examples/jsm/libs/lil-gui.module.min.js' {
  import * as dat from 'dat.gui';
  export default dat;
}
