export interface AxiosRequestOptions {
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


export interface VFormWidgetOptions {
  name: string,
  label: string,
  hidden: boolean,
  customClass: '',
}

export interface VFormWidget {
  type: string,
  category?: 'container',
  formItemFlag?: boolean,
  icon: string
  widgetList?: Array<VFormWidget>
  options: VFormWidgetOptions
}

export interface VFormBussinessSource {
  currentNodeKey: string, //选中的数据源ID
  scriptParams: Array<ScriptParam>,//脚本参数
  expandedKeys: Array<string>,//展开的节点
  pageSize?: number
}

export interface Procedure {
  ProcedureID: string
  ProcedureName: string
}

export interface ExecProcedureParam {
  procedureID: string | number
  procedureName: string
  params: [Partial<ScriptParam>]
}

export interface LoadBussinessRes {
  TableData: Array<{ [key: string]: unknown }>
  TableHeaders: Array<string>
  currentPage: number
  pageSize: number
  total: number
}
