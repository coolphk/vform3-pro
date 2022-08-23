<template>
  <el-drawer @opened="onDrawOpened" v-model="showDataSource" :title="`请选择业务数据源`"
             size="70%"
             show-close>

    <div class="bussiness-container">
      <div>
          <span v-for="(node) in treeExpandedHistory" style="margin-right: 5px">
            <el-button @click="onClickExpaned(node)">{{ node.name }}</el-button>
          </span>

        <div class="tree_wrap">
          <el-tree
              ref="tree$"
              node-key="ID"
              check-on-click-node
              :highlight-current="true"
              :indent="8"
              :props="{label:'NAME'}"
              :data="treeData"
              :default-expanded-keys="optionModel.bussinessSource['expandedKeys']"
              :current-node-key="optionModel.bussinessSource['currentNodeKey']"
              @node-expand="nodeExpand"
              @node-collapse="nodeCollapse"
              @current-change="currentChange"
          >
            <template #default="{node,data}">
              {{ data.NAME }}--{{ data.ID }}
            </template>
          </el-tree>
        </div>
      </div>
      <div class="table_wrap">
        <div style="margin:10px 0 10px 8px">
          数据展示条数:
          <el-input-number v-model="compPageSize"></el-input-number>
          <el-button type="primary" style="margin-left: 8px" @click="refreshData">刷新数据</el-button>
        </div>

        <el-table :data="scriptParamTableData" border max-height="200">
          <el-table-column prop="Param_Name" label="参数名" width="150"/>
          <el-table-column prop="Param_TestVALUE" label="默认值" width="150">
            <template #default="{row}">
              <el-input v-model="row.Param_TestVALUE"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="linkWidgetId" label="关联组件" width="200">
            <template #default="{row,$index}">
              <el-select style="width: 180px"
                         clearable
                         :model-value="row.linkWidgetId"
                         @change="onScriptLinkWidgetChange(row,$index,$event)"
              >
                <el-option v-for="(item) in fieldWidgetList" :value="item.id" :label="item.label"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="Param_BusiDes" label="业务说明"/>
        </el-table>
        <div class="widget-wrapper">
          <template v-if="selectedWidget.type==='select'">
            <span class="label">控件Label：</span><span style="color:darkcyan">{{
              optionModel.labelKey
            }}</span>
            <span class="label" style="margin-left: 8px">控件Value：</span><span style="color:brown">{{
              optionModel.valueKey
            }}</span>
          </template>
          <template v-else-if="isTable(selectedWidget.type)">
            <div class="label">选择要显示的列
              <span style="margin-left: 8px">
                  <el-checkbox label="全选"
                               v-model="checkAll"
                               :indeterminate="compSelectedColumns.length < tableColumns.length && compSelectedColumns.length!==0"
                               @change="onCheckAll"/>
                </span>
            </div>
            <el-checkbox-group v-model="compSelectedColumns" style="max-height: 100px;overflow: auto">
              <el-checkbox v-for="(item) in tableColumns" :label="item"></el-checkbox>
            </el-checkbox-group>
          </template>
          <!--          <template v-else-if="">

                    </template>-->
        </div>
        <el-table
            v-if="bussinessData.length>0"
            ref="busTable$"
            style="width: 800px"
            border
            max-height="600"
            :data="bussinessData"
            :header-cell-style="headerCellStyle"
            @row-contextmenu="onBusTableContextmenu"
        >
          <el-table-column v-for="(item) in tableColumns" :prop="item" :label="item"/>
        </el-table>
      </div>
      <context-menu v-model:show="showMenu" :options="menuOptions"/>

    </div>
  </el-drawer>
</template>

<script setup lang="ts">

import {computed, reactive, ref, watch} from "vue";
import {getScriptsParams, getScriptTree, loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams, getWidgetEventByType} from "@/utils/data-adapter.js";
import ContextMenu from "@/components/context-menu/index.vue"
import {getAllFieldWidgets, isTable} from "@/utils/util.js";
import {LoadBussinessRes, ScriptParam, ScriptTreeRes} from "@/api/types";
import {TableColumnCtx} from "element-plus/lib/components/table/src/table-column/defaults";


interface TreeExpandedHistory {
  id: string,
  name: string,
  expanedKeys: string[]
}

interface MenuOptions {
  x: number,
  y: number,
  title: string,
  handles: {
    label: string,
    handle: Function
  }[]
}

const props = defineProps<{
  designer: any,
  selectedWidget: any,
  optionModel: any
}>()
const tree$ = ref()
const busTable$ = ref()
const showDataSource = ref(false)
const fieldWidgetList = getAllFieldWidgets(props.designer.widgetList).filter((item: any) => item.id !== props.selectedWidget.id)
const expanedNodes = reactive<TreeExpandedHistory[]>([])
const treeData = ref<ScriptTreeRes[]>([])
const scriptParamTableData = ref<ScriptParam[]>([])  //存储过程参数集合
const tableColumns = ref<string[]>([]) //列表列的复选框组
const bussinessData = ref<Array<{ [key: string]: unknown }>>([])
const openNodeSet = reactive(new Set(props.optionModel?.bussinessSource['expandedKeys']))
const showMenu = ref(false)
const currentColumn = ref()
const checkAll = ref(false)
const treeExpandedHistory: TreeExpandedHistory[] = JSON.parse(localStorage.getItem('expanedNodes') ?? '[]')
const menuOptions = reactive(getMenuOptionsByWidget())

const compSelectedColumns = computed({
  get: () => {
    return props.optionModel?.tableColumns.map((item: any) => item.prop)
  },
  set: (values) => {
    //设置table的列
    props.optionModel && (props.optionModel.tableColumns = values?.map((prop: string, index: number) => ({
          columnId: ++index,
          prop,
          "label": prop,
          "width": "100",
          "show": true,
          "align": "center"
        })
    ))
  }
})

const compPageSize = computed({
  set(value: number) {
    if (isTable(props.selectedWidget?.type)) {
      props.optionModel.pagination.pageSize = value
    } else {
      props.optionModel.bussinessSource.pageSize = value
    }
  },
  get(): number {
    if (isTable(props.selectedWidget?.type)) {
      return props.optionModel?.pagination?.pageSize || 10
    } else {
      return props.optionModel.bussinessSource.pageSize as number
    }
  }
})


watch(openNodeSet, (newVal) => {
  props.optionModel.bussinessSource["expandedKeys"] = Array.from(newVal)
})

watch(expanedNodes, (newVal) => {
  localStorage.setItem("expanedNodes", JSON.stringify(newVal))
})

watch(scriptParamTableData, (newVal) => {
  props.optionModel.bussinessSource['scriptParams'] = scriptParamTableData.value
}, {
  deep: true
})

function onCheckAll(value: boolean) {
  if (value)
    compSelectedColumns.value = tableColumns.value
  else {
    compSelectedColumns.value = []
  }
}


/***
 * 将数组转换为children树形结构
 * @param arr
 * @param idKey
 * @param attr
 * @returns {(Map<any, any>|*)[]}
 */
function unFlatten(arr: any[], idKey = 'ID', attr: any = {}) {
  arr.forEach(item => {
    item['children'] = getChildren(arr, item[idKey])
    Object.keys(attr).forEach(key => {
      item[key] = attr[key]
    })
  })
  return getChildren(arr, '0000')
}

function getChildren(arr: any[], parentValue: unknown, parentKey = 'Parent_ID',) {
  return arr.filter(item => item[parentKey] === parentValue)
}

function currentChange(node: ScriptTreeRes) {
  if (node.type === 'Scripts') {
    props.optionModel.bussinessSource['currentNodeKey'] = node.ID
    props.optionModel?.tableColumns && (props.optionModel.tableColumns = [])
    props.optionModel?.tableData && (props.optionModel.tableData = [])
    //如果绑定了labelKey与valueKey则清空
    props.optionModel?.labelKey && (props.optionModel.labelKey = "")
    props.optionModel?.valueKey && (props.optionModel.valueKey = "")
    loadScriptsParams(node.ID)
  }
}

function nodeExpand(data: ScriptTreeRes) {
  openNodeSet.add(data.ID)
  expanedNodes.push({
    id: data.ID,
    name: data.NAME,
    expanedKeys: Array.from(openNodeSet) as string[]
  })
  if (expanedNodes.length > 3) {
    expanedNodes.shift()
  }
}

function nodeCollapse(data: ScriptTreeRes) {
  openNodeSet.delete(data.ID)
  expanedNodes.splice(expanedNodes.findIndex(item => item.id === data.ID), 1)
}

/**
 * 抽屉展开时刷新左侧树,获取脚本数据源
 */
function onDrawOpened() {
  getScriptTree().then(res => {
    treeData.value = unFlatten(res.Data, 'ID')
    const scriptId = props?.optionModel?.bussinessSource?.currentNodeKey
    loadScriptsParams(scriptId)
  })
}

/**
 * 根据脚本ID获取脚本参数
 * @param scriptId
 */
function loadScriptsParams(scriptId: string) {
  // props.optionModel.tableColumns = []
  scriptId && getScriptsParams(scriptId).then(res => {
    scriptParamTableData.value = res?.Data?.Params.map(item => {
      const foundBusScriptParam = props.optionModel.bussinessSource['scriptParams'].find((bItem: ScriptParam) => item.Param_ID === bItem.Param_ID)
      if (foundBusScriptParam) {
        item.linkWidgetId = foundBusScriptParam.linkWidgetId
        item.Param_TestVALUE = foundBusScriptParam.Param_TestVALUE
      }
      return item
    })
    //将当前脚本参数值替换为bussinessSource配置中的默认值
    props.optionModel.bussinessSource['scriptParams'].map((param: ScriptParam) => {
      const tableParam = scriptParamTableData.value.find(item => item.Param_ID === param.Param_ID)
      if (!!tableParam) {
        tableParam.Param_TestVALUE = param.Param_TestVALUE
        tableParam.linkWidgetId = param.linkWidgetId!
      }
    })

    loadTableData(scriptId, scriptParamTableData.value)
  })
}

/**
 * 根据id与参数从通用接口读取数据
 * @param scriptId
 * @param params
 */
function loadTableData(scriptId: string, params: any) {
  loadBussinessSource(assembleBussinessParams({
    scriptId,
    params,
    pageSize: compPageSize.value
  })).then(res => {
    bussinessData.value = res.Data.TableData
    tableColumns.value = res.Data.TableHeaders
  })
}

function refreshData() {
  loadTableData(props?.optionModel?.bussinessSource?.currentNodeKey, scriptParamTableData.value)
}

function onBusTableContextmenu(row: LoadBussinessRes, column: TableColumnCtx<LoadBussinessRes>, event: MouseEvent) {
  if (!isTable(props.selectedWidget?.type)) {
    event.preventDefault()
    showMenu.value = true
    menuOptions.x = event.x
    menuOptions.y = event.y
    currentColumn.value = column
  }
}


function headerCellStyle({column}: {
  row: object
  column: TableColumnCtx<object>
  rowIndex: number
  columnIndex: number
}) {
  const cellStyle: {
    [key: string]: string
  } = {}
  if (column.property === props.optionModel.labelKey) {
    cellStyle['backgroundColor'] = 'darkcyan'
    cellStyle['color'] = 'white'
  }
  if (column.property === props.optionModel.valueKey) {
    cellStyle['backgroundColor'] = 'brown'
    cellStyle['color'] = 'white'
  }
  return cellStyle
}

function onClickExpaned(node: TreeExpandedHistory) {
  props.optionModel.bussinessSource['expandedKeys'] = node.expanedKeys
}


function onScriptLinkWidgetChange(row: ScriptParam, index: number, linkWidgetId: string) {
  function getLinkWidget(id: string) {
    return props.designer.formWidget.getWidgetRef(id).field
  }

  function deleteLinkWidgetCode(id: string) {
    const linkWidget = getLinkWidget(id)
    const linkWidgetEventCode = linkWidget.options[getWidgetEventByType(linkWidget.type)]
    if (linkWidgetEventCode.match(regexp) !== null) {
      linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetEventCode.replace(regexp, '')
    }
  }

  const regexp = new RegExp(`const\\s*linkWidget\\s*.*\\("${props.selectedWidget.id}"\\);\\n(.*\\n){3}.*setValue\\(""\\);\\n?`)
  let linkWidget, codeTemplate, linkWidgetEventCode;
  //如果有linkWidgetId代表是change操作,否则为clear操作,change操作需要删除原关联组件的代码，并且判断当前选中关联组件以前是否选中过，
  //如果选中过则进行替换，否则进行添加操作
  if (linkWidgetId) {
    debugger
    linkWidget = getLinkWidget(linkWidgetId) //获取关联组件
    //要生成的代码
    codeTemplate = `const linkWidget = this.getWidgetRef("${props.selectedWidget.id}");\nconst foundParam = linkWidget.field.options.bussinessSource.scriptParams.find(item => item.linkWidgetId === this.field.id);\nfoundParam.Param_TestVALUE = value;\nlinkWidget.initOptionItems();\nlinkWidget.setValue("");\n`
    linkWidgetEventCode = linkWidget.options[getWidgetEventByType(linkWidget.type)] //关联组件原代码
    //如果关联组件源代码可以匹配到，则使用替换，否则使用增加
    if (linkWidgetEventCode.match(regexp) !== null) {
      linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetEventCode.replace(regexp, codeTemplate)
    } else {
      linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetEventCode + codeTemplate
    }
    //如果有row.linkWidgetId代表以前关联过别的组件，需要把原关联组件的代码删除掉
    if (row.linkWidgetId) {
      deleteLinkWidgetCode(row.linkWidgetId)
    }
  } else {
    deleteLinkWidgetCode(row.linkWidgetId!)
  }
  row.linkWidgetId = linkWidgetId
}

function getMenuOptionsByWidget() {


  let menuOptions: MenuOptions
  switch (props.selectedWidget.type) {
    case 'select':
      menuOptions = {
        x: 0,
        y: 0,
        title: '操作列表',
        handles: [
          {
            label: '设为label',
            handle() {
              props.optionModel && (props.optionModel[`labelKey`] = currentColumn.value?.property)
              showMenu.value = false
            }
          },
          {
            label: '设为value',
            handle() {
              props.optionModel && (props.optionModel[`valueKey`] = currentColumn.value?.property)
              showMenu.value = false
            }
          }
        ]
      }
      break;
    case 'input':
      menuOptions = {
        x: 0,
        y: 0,
        title: '操作列表',
        handles: [
          {
            label: '设为value',
            handle() {
              props.optionModel && (props.optionModel[`valueKey`] = currentColumn.value?.property)
              showMenu.value = false
            }
          }
        ]
      }
      break;
    default:
      menuOptions = {
        x: 0,
        y: 0,
        title: '操作列表',
        handles: [
          {
            label: '设为value',
            handle() {
            }
          }
        ]
      }
  }
  return menuOptions
}

/*

*/
</script>

<style scoped lang="scss">
.bussiness-container {
  height: 100%;
  display: flex;

  .tree_wrap {
    overflow-y: auto;
    border: var(--el-border);
    height: 100%;
    flex: 0 0 30%
  }

  .table_wrap {
    flex: 1;
    border: var(--el-border);
    margin-left: 10px;
  }

  .widget-wrapper {
    margin: 10px 0 10px 8px;

    .label {
      font-weight: bolder;
      font-size: 14px;
    }
  }
}
</style>