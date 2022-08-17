/// <reference types="vite/client" />


declare module '*.vue' {
  import type {DefineComponent} from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}


// declare module '@/utils/i18n.js'
declare module '*.js'

/*declare module 'axios' {
  export interface AxiosRequestConfig{
    showLoading?: boolean;
    showTips?: boolean;
    // [自定义属性声明]
  }
}*/
