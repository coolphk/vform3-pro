import {post} from "@/api/index";

const baseUrl = '/DB_Structure'

export function getProcedureList() {
  return post(`${baseUrl}/Get_ProcedureList`, undefined, false)
}

export function getProcedureParams(procedureName, parent_ID = "") {
  return post(`${baseUrl}/Get_ProcParams`, {procedureName, parent_ID}, false)
}

export function xmlToJson(params) {
  return post(`${baseUrl}/XML2JSON`, params)
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

export function transferToSubmitData(data) {
  data.map(item => {
    const parent = item?.parent
    const children = item?.children
    delete item?.parent
    delete item?.children
    parent && (item.parent = parent)
    children && (item.children = children)
    // console.log('item', item);
    if (item.children && Object.keys(item?.children[0]).length > 0) {
      flatten(submitData, item.children)
    }
  })
}