import axios from "axios";
import {ElMessage} from "element-plus";

const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API, // 超时
  timeout: 30000
})

service.interceptors.response.use(response => {

  if (response.data.Status) {
    if (response.config.showTips) {
      ElMessage({
        message: response.data.Message, type: 'success', duration: 5 * 1000
      })
    }
  } else {
    ElMessage({
      message: response.data.Message, type: 'error', duration: 5 * 1000
    })
  }
  return response
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


export function post(url, parmas, showTips = true) {
  service.defaults['showTips'] = showTips
  return service.post(url, parmas)
}

export function get(url, params, showTips) {
  service.defaults['showTips'] = showTips
  return service.get(url, {params})
}


export default service