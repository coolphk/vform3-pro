export const editTableSchema = {
  type: 'edit-table',
  category: 'container',
  formItemFlag: true,
  icon: 'table',
  widgetList: [],
  options: {
    name: '',
    label: 'edit-table',
    hidden: false,
    bussinessSource: {
      currentNodeKey: "",//当前选中的节点
      scriptParams: [], //获取数据源时，获取脚本参数接口，每个控件自己的参数实例
      expandedNodes: [],//展开的节点
      pageSize: 10

    },
    dataTarget: {
      bindMap: {},//用来存储列和存储过程节点的绑定关系
      arraySchema: {} //编辑表格绑定数组时数组节点的结构
    },
    customClass: '',
    column: '',
    cellStyle: {'height': '39px', 'cursor': 'pointer'},
    tableColumns: [],
    tableData: []
  }
}