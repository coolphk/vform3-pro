/***
 * 数据绑定关系，数据源与组件值的绑定关系
 * 数据结构"valueSource.bindMap": {
 *             "a3c04a830bc7fa5" 脚本id: {
 *               "scriptFields:{
 *                 "AAG01" 脚本参数id: {
 *                   "widgetId" 控件id: "",
 *                   "params" 存储过程参数: [
 *                     {
 *                       "Param_ID": "15",
 *                       "Param_Name": "@VBO01",
 *                       "Param_TestVALUE 脚本查询的默认值:"",
 *                       "procedureId": 1775695957,
 *                       "procedureName": "HOPatient_VAE1_Update"
 *                       defaultValue 默认值:
 *                     }
 *                   ]
 *                 },
 *               }
 *               "scriptName" 脚本名称: "获取患者信息",
 *               "scriptParams 脚本参数": { "VAA01 参数名称": { "defaultValue" 参数默认值: "13698", "linkWidget" 关联组件: []"
 *             }
 *           },
 */
import {Procedure, ScriptTreeRes} from "@/api/types";
import {VFormWidget, VFormWidgetOptions} from "@/components/form-designer/widget-panel/types";

export interface DataWrapperOptions extends VFormWidgetOptions {
  submit: string,
  valueSource: {
    dataTarget: { //存储过程
      expandedKeys: Array<string>,
      selectedProcedures: Array<Procedure>,
    },

    checkedNodes: Array<ScriptTreeRes>,
    expandedKeys: Array<string | number>,//展开的节点id
    bindMap: BindMap,
    pageSize: number,
  },
}

export interface DataWrapper extends VFormWidget {
  options: DataWrapperOptions
}

export interface BindMapFieldParams {
  Param_ID: string,
  Param_Name: string,
  Param_TestVALUE: string,
  procedureId: string,
  procedureName: string
  defaultValue: string
}

export interface BindMapScriptField {
  //脚本参数id
  widgetId?: string, //绑定控件id
  params: Array<BindMapFieldParams> //存储过程参数
}

export interface BindMapScriptParam {
  defaultValue: string, //参数默认值
  linkWidget: Array<string> //关联控件
}

export interface BindMapValue {
  scriptFields: {
    [key: string]: BindMapScriptField
  }
  scriptName: string, //脚本名称
  scriptParams: {  //脚本参数
    [key: string]: BindMapScriptParam//参数名
  }
}

export interface BindMap {
  [key: string]: BindMapValue //脚本id
}

const dataWrapperWidget: DataWrapper = {
  type: 'data-wrapper',
  category: 'container',
  icon: 'data-wrapper',
  widgetList: [],
  options: {
    name: '',
    label: 'data-wrapper',
    hidden: false,
    submit: '',
    valueSource: { //脚本相关
      dataTarget: {
        expandedKeys: [],
        selectedProcedures: []
      },
      checkedNodes: [],//当前选中的节点
      expandedKeys: [],//展开的节点id
      bindMap: {},
      pageSize: 10
    },
    customClass: '',
  }
}


export default dataWrapperWidget
