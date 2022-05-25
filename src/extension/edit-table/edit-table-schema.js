export const editTableSchema = {
  type: 'edit-table',
  category: 'container',
  icon: 'table',
  widgetList: [],
  options: {
    name: '',
    label: 'edit-table',
    hidden: false,
    customClass: '',
    dataTarget: '',
    tableColumns: [
      {columnId: 1, prop: 'name', label: '姓名', width: '100', show: true, align: 'left', fixed: 'left', sortable: true},
    ],
    tableData: [{
      name: 'aaa',
      age: 16
    }]
  }
}