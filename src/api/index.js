import axios from "axios";
import {ElMessage} from "element-plus";
// import store from "@/store";

const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: import.meta.env.VITE_APP_BASE_API, // 超时
  baseURL: 'http://42.101.11.150:15104/api', // 超时
  timeout: 10000
})
service.interceptors.request.use(config => {
  return config;
})
service.interceptors.response.use(response => {
  if (response.data.Status) {
    if (response.config.showTips) {
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

function setServiceOptions({showTips = false, showLoading = false}) {
  service.defaults['showTips'] = showTips
  service.defaults['showLoading'] = showLoading
}

export function post(url, parmas, options) {
  setServiceOptions(options || {})
  return service.post(url, parmas)
}


export function get(url, params, options) {
  setServiceOptions(options || {})
  return service.get(url, {params})
}


export default service