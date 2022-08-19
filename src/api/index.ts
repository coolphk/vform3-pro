import axios from "axios";
import {ElMessage} from "element-plus";
import {AxiosRequestOptions} from "@/api/types";
// import store from "@/store";


let defaultOptions: AxiosRequestOptions = {
  showTips: false,
  showLoading: false
}

const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: import.meta.env.VITE_APP_BASE_API, // 超时
  baseURL: (import.meta.env.VITE_APP_BASE_HOST) as string + import.meta.env.VITE_APP_BASE_API, // 超时
  timeout: 10000
})
service.interceptors.request.use(config => {
  return config;
})
service.interceptors.response.use(response => {
  if (response.data.Status) {
    if (defaultOptions.showTips) {
      ElMessage({
        message: response.data.Message,
        type: 'success',
        duration: 3 * 1000,
        showClose: true
      })
    }
  } else {
    ElMessage({
      message: response.data.Message, type: 'error', duration: 5 * 1000, showClose: true
    })
    console.error('error', response.data.Message)
  }
  return response.data
}, (error) => {
  let {message} = error
  if (message.includes("timeout")) {
    message = "系统接口请求超时";
  }
  ElMessage({
    message: message, type: 'error', duration: 5 * 1000, showClose: true
  })
  return Promise.reject(error)
})


export function post<R>(url: string, parmas?: any, options?: AxiosRequestOptions) {
  options && (defaultOptions = options)
  console.log('post baseUrl', service.defaults.baseURL);
  return service.post<void, R>(url, parmas)
}


export function get<R>(url: string, params?: any, options?: AxiosRequestOptions) {
  options && (defaultOptions = options)
  return service.get<void, R>(url, {params})
}

export function changeServiceBaseURL(baseURL: string) {
  service.defaults.baseURL = baseURL
}

export default service