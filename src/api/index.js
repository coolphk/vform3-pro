import axios from "axios";

const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
})

export function post(url, parmas) {
  return service.post(url, parmas)
}

export function get(url, params) {
  return service.get(url, {params})
}

export default service