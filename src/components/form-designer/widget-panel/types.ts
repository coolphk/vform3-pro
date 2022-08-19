import {ScriptParam} from "@/api/types";

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