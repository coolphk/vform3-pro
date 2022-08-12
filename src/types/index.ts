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


interface BindMapFieldParams {
  Param_ID: string,
  Param_Name: string,
  Param_TestVALUE: string,
  procedureId: string | number,
  procedureName: string
  defaultValue?: "string"
}

export interface BindMap {
  [key: string]: { //脚本id
    scriptFields?: {
      [key: string]: { //脚本参数id
        widgetId?: string, //绑定控件id
        params: Array<BindMapFieldParams> //存储过程参数
      }
    }
    scriptName: string, //脚本名称
    scriptParams: {  //脚本参数
      [key: string]: //参数名
        {
          defaultValue: string, //参数默认值
          linkWidget: Array<string> //关联控件
        }
    }
  }
}

interface VFormWidgetOptions {
  name: string,
  label: string,
  hidden: boolean,
  dataTarget: { //存储过程
    expandedKeys: [],
    selectedProcedures: Array<Procedure>,
  },
  submit: string,
  valueSource: {
    checkedNodes: Array<{
      "ID": string,
      "NAME": string,
      "type": string,
      "Parent_ID": string,
      "ROWNR": string | number,
    }>,
    expandedKeys: Array<string | number>,//展开的节点id
    bindMap: BindMap,
    pageSize: 10
  },
  customClass: '',
}

export interface VFormWidget {
  type: string,
  category: string,
  icon: string
  widgetList: Array<VFormWidget>
  options: VFormWidgetOptions
}

export interface Procedure {
  ProcedureID: string | number
  ProcedureName: string
}

