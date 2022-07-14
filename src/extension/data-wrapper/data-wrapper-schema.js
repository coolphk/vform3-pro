export default {
  type: 'data-wrapper',
  category: 'container',
  icon: 'table',
  widgetList: [],
  options: {
    name: '',
    label: 'data-wrapper',
    hidden: false,
    /*bussinessSource: {
      currentNodeKey: "",//当前选中的节点
      scriptParams: [], //获取数据源时，获取脚本参数接口，每个控件自己的参数实例
      expandedNodes: [],//展开的节点
      pageSize: 10

    },*/
    valueSource: {
      currentNodeKey: "",//当前选中的节点
      scriptParams: [], //获取数据源时，获取脚本参数接口，每个控件自己的参数实例
      expandedNodes: [],//展开的节点
      originalData: {}, //原始数据，渲染时将当前dataWrapper对应的原始数据存入，会将修改的值替换originalData，然后调用exec存入存储过程.
                        // 结构为{scriptId,schema}
      bindMap: {},
      pageSize: 10
    },
    customClass: '',
  }
}
