import {ScriptParam} from "@/api/types";
/*HaveChild: string
Param_BusiDes: string
Param_Des: string
Param_ID: string
Param_LinkColumBusiDes: string
Param_LinkColumID: string
Param_LinkColumName: string
Param_LinkTableID: string
Param_LinkTableName: string
Param_MaxLen: string
Param_Name: string
Param_ObjType: string
Param_TestVALUE: string
Param_Type: string
Param_VALUE: string
Param_isOUT: string
Param_isXML: string
Parent_ID: string
ROWNR: string*/
/*export type PartialScriptParam = Omit<ScriptParam, 'Param_LinkColumBusiDes'
  | 'Param_LinkColumName'
  | 'Param_LinkTableID'
  | 'Param_LinkTableName'
  | 'Param_VALUE'
  | 'Param_Des'
  | 'Param_BusiDes'>*/

export type BussinessDataParam = Partial<ScriptParam>
  & { procedureId: string, procedureName: string, defaultValue?: string }

/*={
  Param_ID : string
  Param_Name : string
  Param_ObjType : string
  Param_Type : string
  Param_MaxLen : string
  Param_isOUT : "0"
  Param_isXML : "0"
  Param_TestVALUE : "6022-2"
  Parent_ID : "0000"
  HaveChild : "0"
  ROWNR : null
  procedureId : 1775695957
  procedureName : "HOPatient_VAE1_Update"
}*/
export interface BussinessData {
  label: string,
  value: unknown,
  scriptName: string,
  scriptId: string,
  widgetId: string,
  params: BussinessDataParam[],
}

export interface DataRange {
  start: number,
  end: number
}

export interface ScriptResponse {
  data: BussinessData[],
  dataRange: {
    [key: string]: DataRange
  },
  total: number,
  currentPage: number,
  pageSize: number
}

export interface ScriptParamData {
  scriptName: string,
  scriptId: string,
  linkWidgetId: string[],
  Param_TestVALUE: string
  Param_Name: string
}
