export default {
  type: 'data-wrapper',
  category: 'container',
  icon: 'table',
  widgetList: [],
  options: {
    name: '',
    label: 'data-wrapper',
    hidden: false,
    dataTarget: {
      expandedKeys: [],
      selectedProcedures: []
    },
    valueSource: {
      checkedNodes: [],//当前选中的节点
      scriptParams: {}, //获取数据源时，获取脚本参数接口，每个控件自己的参数实例
      expandedKeys: [],//展开的节点id
      originalData: {}, //原始数据，渲染时将当前dataWrapper对应的原始数据存入，会将修改的值替换originalData，然后调用exec存入存储过程.
                        // 结构为{scriptId,schema}
      bindMap: {},
      /*数据绑定关系，数据源与组件值的绑定关系
      数据结构"bindMap": {
                  "a3c04a830bc7fa5" 脚本id: {
                    "AAG01" 脚本参数id: {
                      "widgetId" 控件id: "",
                      "params" 存储过程参数: [
                        {
                          "Param_ID": "15",
                          "Param_Name": "@VBO01",
                          "procedureId": 1775695957,
                          "procedureName": "HOPatient_VAE1_Update"
                        }
                      ]
                    },
                    "scriptName": "获取患者信息",
                    "AAT02": {
                      "widgetId": "",
                      "params": [
                        {
                          "Param_ID": "8",
                          "Param_Name": "@EmpCode",
                          "procedureId": 1775695957,
                          "procedureName": "HOPatient_VAE1_Update"
                        }
                      ]
                    }
                  }
                },*/
      pageSize: 10
    },
    customClass: '',
  }
}
