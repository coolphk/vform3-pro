import {post} from "@/api/index";

const baseUrl = 'DB_Structure'

export function getScriptTree() {
  return post(`${baseUrl}/Get_ScriptsTree`)
}

export function getScriptsParams(Scripts_ID) {
  return post(`${baseUrl}/Get_ScriptsParams`, {Scripts_ID})
}

export function loadBussinessSource(params) {
  return post(`${baseUrl}/General_Query`, params)
}