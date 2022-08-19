import {post} from "@/api/index";
import {APIResponse, ExecProcedureParam, Procedure, ScriptParam} from "@/api/types";

const baseUrl = '/DB_Structure'

export function getProcedureList() {
  return post<APIResponse<{ TableData: Procedure[] }>>(`${baseUrl}/Get_ProcedureList`)
}

/**
 * 查询存储过程子参数，if_recur=1包含所有子节点，=0包含1级子节点
 * 返回结构 [{
 *     "Param_ID": "1",
 *     "Param_Name": "@XML",
 *     "Param_ObjType": "param",
 *     "Param_Type": "ntext",
 *     "Param_MaxLen": "16",
 *     "Param_isOUT": "0",
 *     "Param_isXML": "1",
 *     "Param_TestVALUE": "",
 *     "Param_Des": "修改患者信息",
 *     "Param_BusiDes": "",
 *     "Param_LinkTableID": "",
 *     "Param_LinkTableName": "",
 *     "Param_LinkColumID": "",
 *     "Param_LinkColumName": "",
 *     "Param_LinkColumBusiDes": "",
 *     "Parent_ID": "0000",
 *     "HaveChild": "1",
 *     "ROWNR": null
 * }]
 */
export function getProcedureParams(procedureName: string, parent_ID = "", IF_recur = 0) {
  return post<APIResponse<[ScriptParam]>>(`${baseUrl}/Get_ProcParams`, {procedureName, parent_ID, IF_recur})
}

/*export function xmlToJson(params) {
  return post(`${baseUrl}/XML2JSON`, params, {showTips: true})
}

export function delProcedureParams(params) {
  return post(`${baseUrl}/Detele_ProcParams`, params)
}

export function updateProcedureParams(params) {
  return post(`${baseUrl}/Uapdate_ProcParams`, params)
}
 */


export function execProcedure(params: ExecProcedureParam) {
  return post(`${baseUrl}/Exec_Proc`, params)
}