import {AxiosRequestConfig} from "axios";

export interface AxiosRequestOptions extends AxiosRequestConfig{
  showTips?: boolean,
  showLoading?: boolean
}

export interface APIResponse<T> {
  Code: string,
  Data: T,
  Message: string,
  Status: boolean,
}

export interface ScriptTreeRes {
  ID: string
  NAME: string
  Parent_ID: string
  ROWNR: number
  type: string
}

export interface ScriptParam {
  HaveChild: string
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
  ROWNR: string
  procedureId: string,
  procedureName: string,
  linkWidgetId?: string[]
}


export interface ScriptParamRes {
  Params: [ScriptParam],
  Public_Params: [
    {
      NAME: string,
      DES: string
    }
  ],
  SQL_TEXT: string,
  Scripts_ID: string
}

export interface BussinessSourceParamRes {
  "Scripts_ID": string,
  "currentPage": number,
  "pageSize": number,

  [key: string]: any
}


export interface Procedure {
  ProcedureID: string
  ProcedureName: string
}

export interface ExecProcedureParam extends Procedure {
  params: ScriptParam[]
}

export interface LoadBussinessRes {
  TableData: Array<{ [key: string]: unknown }>
  TableHeaders: Array<string>
  currentPage: number
  pageSize: number
  total: number
}
