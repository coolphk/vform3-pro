import {post} from "@/api/index";
import {APIResponse, BussinessSourceParamRes, LoadBussinessRes, ScriptParamRes, ScriptTreeRes} from "@/types";

const baseUrl = 'DB_Structure'


export function getScriptTree() {
  return post<APIResponse<[ScriptTreeRes]>>(`${baseUrl}/Get_ScriptsTree`)
}

export function getScriptsParams(Scripts_ID: string) {
  return post<APIResponse<ScriptParamRes>>(`${baseUrl}/Get_ScriptsParams`, {Scripts_ID})
}

export function loadBussinessSource(params: BussinessSourceParamRes) {
  return post<APIResponse<LoadBussinessRes>>(`${baseUrl}/General_Query`, params)
}