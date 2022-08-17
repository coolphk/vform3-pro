import {Procedure, VFormBussinessSource, VFormWidget, VFormWidgetOptions} from "@/types";

interface CellStyle {
  [key: string]: any
}

export interface EditTableOptions extends VFormWidgetOptions {
  bussinessSource: VFormBussinessSource
  cellStyle: CellStyle
  tableColumns: Array<EditTableColumn>
  tableData: Array<any>
  labelKey: string,
  valueKey: string
  pagination: { // 分页信息
    currentPage: number,
    pageSizes: number[],
    pageSize: number,
    total: number,
  },
  dataTarget: {
    expandedKeys: string[],
    bindMap: any
    selectedProcedure: Procedure
  }
}

export interface EditTable extends VFormWidget {
  options: EditTableOptions
}

export interface EditTableColumn {
  columnId: number,
  prop: string,
  label: string,
  width: string,
  show: boolean,
  align: string
}

export const editTableSchema: EditTable = {
  type: 'edit-table',
  category: 'container',
  formItemFlag: true,
  icon: 'table',
  options: {
    name: '',
    label: 'edit-table',
    hidden: false,
    labelKey: '',
    valueKey: '',
    bussinessSource: {
      currentNodeKey: "",//当前选中的节点
      scriptParams: [], //获取数据源时，获取脚本参数接口，每个控件自己的参数实例
      expandedKeys: [],//展开的节点
    },
    dataTarget: {
      expandedKeys: [],
      bindMap: {},//用来存储列和存储过程节点的绑定关系
      selectedProcedure: {
        ProcedureID: "",
        ProcedureName: "",
      }
      // arraySchema: {} //编辑表格绑定数组时数组节点的结构
    },
    customClass: '',
    cellStyle: {'height': '39px', 'cursor': 'pointer'},
    tableColumns: [],
    tableData: [],
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 10,
      pageSizes: [10, 20, 30]
    }
  }
}