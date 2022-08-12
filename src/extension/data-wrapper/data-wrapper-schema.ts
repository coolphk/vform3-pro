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
import {VFormWidget} from "@/types";

const dataWrapperWidget: VFormWidget = {
  type: 'data-wrapper',
  category: 'container',
  icon: 'data-wrapper',
  widgetList: [],
  options: {
    name: '',
    label: 'data-wrapper',
    hidden: false,
    dataTarget: { //存储过程
      expandedKeys: [],
      selectedProcedures: []
    },
    submit: '',
    valueSource: { //脚本相关
      checkedNodes: [],//当前选中的节点
      expandedKeys: [],//展开的节点id
      bindMap: {},
      pageSize: 10
    },
    customClass: '',
  }
}


export default dataWrapperWidget
