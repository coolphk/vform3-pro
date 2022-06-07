import axios from "axios";
import {ElMessage} from "element-plus";

const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API, // 超时
  timeout: 10000
})

service.interceptors.response.use(config => {
  return config
}, (error) => {
  let {message} = error
  if (message.includes("timeout")) {
    message = "系统接口请求超时";
  }
  ElMessage({
    message: message, type: 'error', duration: 5 * 1000
  })
  return Promise.reject(error)
})


export function post(url, parmas) {
  return service.post(url, parmas)
}

export function get(url, params) {
  return service.get(url, {params})
}


export default service