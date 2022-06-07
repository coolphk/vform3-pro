import {post} from "@/api/index";

const baseUrl = '/DB_Structure'

export function getProcedureList() {
  return post(`${baseUrl}/Get_ProcedureList`)
}

export function getProcedureParams(procedureName, parent_ID = "") {
  return post(`${baseUrl}/Get_ProcParams`, {procedureName, parent_ID})
}

export function updateParams(params) {
  return post(`${baseUrl}/Uapdate_ProcParams`, params)
}

function transferToData(item) {
  return {
    ...item,
  }
}

function transferToDataV2(item) {
  const hasChildren = ['object', 'array'].some((str) => str === item.type_)
  return {
    ...item,
    children: hasChildren ? [''] : undefined
  }
}