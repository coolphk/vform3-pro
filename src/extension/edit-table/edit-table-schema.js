export const editTableSchema = {
  type: 'edit-table',
  category: 'container',
  icon: 'table',
  widgetList: [],
  options: {
    name: '',
    label: 'edit-table',
    hidden: false,
    bussinessSource: {
      currentNodeKey: "",
      scriptParams: [],
      expandedNodes: [],
      pageSize: 10
    },
    dataTarget: {
      bindMap: {}
    },
    customClass: '',
    column: '',
    cellStyle: {'height': '39px', 'cursor': 'pointer'},
    tableColumns: [],
    tableData: []
  }
}