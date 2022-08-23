import {VFormWidget, VFormWidgetOptions} from "@/components/form-designer/widget-panel/types";

interface Tree {
  label: string,
  children?: Tree[]
}

export interface TreeViewOptions extends VFormWidgetOptions {
  treeData: Tree[]
}

export interface TreeView extends VFormWidget {
  options: TreeViewOptions
}

const treeData = [
  {
    "BHK01": 1,
    "BHK02": "1",
    "BHK03": "电子显微镜（ES）",
    "BHK01A": 0,
    "ABBRP": "dzxwjES",
    "ABBRW": "jbjtqES"
  },
  {
    "BHK01": 2,
    "BHK02": "2",
    "BHK03": "彩色B超(US)",
    "BHK01A": 0,
    "ABBRP": "csBcUS",
    "ABBRW": "eqBfUS"
  },
  {
    "BHK01": 3,
    "BHK02": "3",
    "BHK03": "胃镜(LP)",
    "BHK01A": 0,
    "ABBRP": "wjLP",
    "ABBRW": "lqLP"
  },
  {
    "BHK01": 6,
    "BHK02": "6",
    "BHK03": "病理",
    "BHK01A": 1,
    "ABBRP": "bl",
    "ABBRW": "ug"
  },
  {
    "BHK01": 7,
    "BHK02": "7",
    "BHK03": "液基",
    "BHK01A": 1,
    "ABBRP": "yj",
    "ABBRW": "ia"
  },
  {
    "BHK01": 8,
    "BHK02": "8",
    "BHK03": "腹部",
    "BHK01A": 2,
    "ABBRP": "fb",
    "ABBRW": "eu"
  },
  {
    "BHK01": 9,
    "BHK02": "9",
    "BHK03": "泌尿系",
    "BHK01A": 2,
    "ABBRP": "mnx",
    "ABBRW": "int"
  },
  {
    "BHK01": 11,
    "BHK02": "11",
    "BHK03": "妇产科",
    "BHK01A": 2,
    "ABBRP": "fck",
    "ABBRW": "vut"
  },
  {
    "BHK01": 14,
    "BHK02": "14",
    "BHK03": "浅表",
    "BHK01A": 2,
    "ABBRP": "qb",
    "ABBRW": "ig"
  },
  {
    "BHK01": 15,
    "BHK02": "15",
    "BHK03": "心脏",
    "BHK01A": 2,
    "ABBRP": "xz",
    "ABBRW": "ne"
  }
]

export const treeViewSchema: TreeView = {
  formItemFlag: false, icon: "",
  type: 'tree-view',
  options: {
    name: '',
    label: 'tree-view',
    hidden: false,
    customClass: '',
    treeData: []
    // props:
  }
}