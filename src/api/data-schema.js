import {post} from "@/api/index";

const baseUrl = '/DB_Structure'

export function getProcedureList() {
  return post(`${baseUrl}/Get_ProcedureList`)
}

//查询存储过程子参数，if_recur=1包含所有子节点，=0包含1级子节点
export function getProcedureParams(procedureName, parent_ID = "", IF_recur = 0) {
  return post(`${baseUrl}/Get_ProcParams`, {procedureName, parent_ID, IF_recur})
}

export function xmlToJson(params) {
  return post(`${baseUrl}/XML2JSON`, params,{showTips:true})
}

export function delProcedureParams(params) {
  return post(`${baseUrl}/Detele_ProcParams`, params)
}

export function updateProcedureParams(params) {
  return post(`${baseUrl}/Uapdate_ProcParams`, params)
}

export function execProcedure(params) {
  return post(`${baseUrl}/Exec_Proc`, params)
}