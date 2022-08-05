export default {
  type: 'data-wrapper',
  category: 'container',
  icon: 'data-wrapper',
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
                    "scriptFields:{
                      "AAG01" 脚本参数id: {
                        "widgetId" 控件id: "",
                        "params" 存储过程参数: [
                          {
                            "Param_ID": "15",
                            "Param_Name": "@VBO01",
                            "Param_TestVALUE 脚本查询的默认值:"",
                            "procedureId": 1775695957,
                            "procedureName": "HOPatient_VAE1_Update"
                            defaultValue 默认值:
                          }
                        ]
                      },
                    }
                    "scriptName" 脚本名称: "获取患者信息",
                    "scriptParams 脚本参数": { "VAA01 参数名称": { "defaultValue" 参数默认值: "13698", "linkWidget" 关联组件: []"
                  }
                },*/
      pageSize: 10
    },
    customClass: '',
  }
}
