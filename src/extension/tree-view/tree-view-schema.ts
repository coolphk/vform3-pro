import {VFormWidget, VFormWidgetOptions} from "@/components/form-designer/widget-panel/types";

interface Tree {
  label: string,
  children?: Tree[]
}

export interface TreeViewOptions extends VFormWidgetOptions {
  treeData: Tree[],
  showBorder: boolean,
  labelKey: string,
  valueKey: string,
  parentKey: string, //父子关系节点名
  rootParentValue: unknown  //根节点的parentId值
  expandOnClickNode: boolean
  onNodeClick: string
  height: string
}

export interface TreeView extends VFormWidget {
  options: TreeViewOptions
}

const treeView: TreeView = {
  formItemFlag: true,
  category: 'container',
  icon: "tree-view",
  type: 'tree-view',
  options: {
    name: '',
    label: 'tree-view',
    hidden: false,
    customClass: '',
    treeData: [],
    showBorder: true,
    labelKey: 'label',
    valueKey: 'value',
    parentKey: '',
    rootParentValue: '',
    expandOnClickNode: false,
    onNodeClick: '',
    height: '',
    bussinessSource: {
      currentNodeKey: "",//当前选中的节点
      scriptParams: [], //获取数据源时，获取脚本参数接口，每个控件自己的参数实例
      expandedKeys: [],//展开的节点
      pageSize: 10
    },
  }
}
export default treeView