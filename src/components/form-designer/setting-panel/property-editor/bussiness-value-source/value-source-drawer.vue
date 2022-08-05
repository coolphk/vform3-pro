<template>
  <el-dialog v-model="showDataSource" title="请配置数据绑定关系"
             show-close
             :append-to-body="true"
             :close-on-press-escape="false"
             fullscreen
  >
    <div class="bussiness-container">
      <div class="tree-wrapper">
        <div class="tree-title">请选择数据绑定来源</div>
        <div class="tree-body">
          <v-source-tree
              ref="vsTree$"
              :value-source="optionModel.valueSource"
              @loadDataFinished="loadDataFinished"
              @removePartialBussinessData="removePartialBussinessData"
          />
        </div>
      </div>

      <div class="table-wrapper">
        <el-button type="primary" @click="refreshData">刷新数据</el-button>
        <el-button @click="clearValueSource">清楚valueSource</el-button>
        <!--        参数列表-->
        <el-table :data="paramData" border max-height="200">
          <el-table-column prop="scriptId" label="id" width="150"/>
          <el-table-column prop="scriptName" label="脚本名称" width="150"/>
          <el-table-column prop="Param_Name" label="参数名" width="150"/>
          <el-table-column prop="Param_TestVALUE" label="参数值" width="150">
            <template #default="{row}">
              <el-input v-model="row.Param_TestVALUE"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="Param_BusiDes" label="业务说明" width="150"/>
          <el-table-column label="关联组件" width="200">
            <template #default="{row}">
              <el-cascader style="width: 160px"
                           v-model="row.bindWidget"
                           clearable
                           :options="paramBindWidgets"
                           @change="onCascaderChange(row,$event)"
              />

            </template>
          </el-table-column>
        </el-table>
        <div class="widget-wrapper">
          <template v-if="optionModel.valueSource">
            <div>
              <div class="label">绑定关系表：</div>
              <div style="display: flex">
                列名搜索:
                <el-input style="width: 120px" v-model="inputColumnValue"/>
                <el-button style="margin-left: 10px" type="primary" @click="autoBindData">自定绑定(根据字段名匹配)</el-button>
                <el-popconfirm title="确定要清除所有绑定关系吗" @confirm="removeBindMap">
                  <template #reference>
                    <el-button type="warning">清除绑定关系</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </template>
        </div>

        <!--        绑定列表-->
        <el-table
            ref="busTable$"
            style="min-width: 800px"
            max-height="600"
            border
            :data="scriptResponse.data"
        >
          <el-table-column prop="scriptName" sortable label="脚本名称" width="150"/>
          <el-table-column prop="label" sortable label="列名" width="120"/>
          <el-table-column prop="value" label="实际值" width="120"/>

          <el-table-column label="对应组件" width="150">
            <template #default="{row}">
              <el-select v-model="row.widgetId"
                         clearable
                         style="width: 120px"
                         @change="onBindWidgetChange(row)"
                         @clear="onClearBindWidget(row)"
              >
                <el-option v-for="(childWid,index) in compChildrenWidgets" :value="childWid.id"
                           :label="childWid.options.label"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column sortable width="180" label="存储过程参数">
            <template #default="{row}">
              <draggable
                  class="el-card"
                  style="min-height: 22px"
                  item-key="Param_ID"
                  :list="row.params"
                  :group="tableDragGroup"

              >
                <template #item="{element,index}">
                  <span style="margin: 2px">
                    <el-button size="small" @click="removeBindParam(row,element.Param_ID)">{{
                        element.Param_Name
                      }}
                    </el-button>
                  </span>
                </template>
              </draggable>
            </template>
          </el-table-column>
          <el-table-column label="参数默认值" width="240">
            <template #default="{row}">
              <div v-for="(param) in row.params" style="display: flex;justify-content: space-between">
                {{ param.Param_Name }}：
                <el-input style="width: 120px" v-model="param.defaultValue"
                          @input="onDefaultValueInput(row,param,$event)"></el-input>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model="scriptResponse.currentPage"
            :page-size="scriptResponse.pageSize"
            :total="scriptResponse.total"
            @current-change="onCurrentChange"
        />
        {{ optionModel.valueSource.bindMap }}
      </div>
      <div class="tree-wrapper" style="border-left: none;height: 100%;">
        <div class="tree-title">请选择要绑定的数据目标</div>
        <div class="tree-body">
          <v-data-target ref="vDataTarget$" v-model="procedureData" :data-target="optionModel.dataTarget"
                         :bind-map="compBindMap"></v-data-target>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>

import {computed, reactive, ref, watch} from "vue";
import {getScriptsParams, loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams, filterPostParam, traverseObj} from "@/utils/data-adapter";
import {isEmptyObj, isTable, traverseFieldWidgets} from "@/utils/util";
import useBindParam from "@/components/form-designer/setting-panel/property-editor/bussiness-value-source/useBindParam";
import VDataTarget from "./components/v-data-target";
import VSourceTree from "./components/v-source-tree";
import {isObj} from "@/utils/smart-vue-i18n/utils";

const props = defineProps({
  designer: Object,
  selectedWidget: Object,
  optionModel: Object,
  showDataSource: Boolean
})
/*[{
      procedureId: val.ProcedureID,
      procedureName: val.ProcedureName,
      params: res.Data
    }]*/
const procedureData = ref([])
const vsTree$ = ref()
const busTable$ = ref()
const vDataTarget$ = ref()
const showDataSource = ref(false)
const inputColumnValue = ref("")
const paramData = ref([])  //存储过程参数集合
const paramBindWidgets = useBindParam(props.designer.widgetList) //关联组件列表
const scriptResponse = reactive({
  data: [],
  dataRange: {},
  total: 0,
  currentPage: 1,
  pageSize: 10
}) //根据脚本参数查询的实际的数据，并进行分页
const bussinessData = ref([]) //绑定表格数据

const tableDragGroup = { //绑定表格中拖拽容器
  name: 'itxst',
  put: true,
  pull: false
}

//每页显示条数
const compPageSize = computed({
  set(value) {
    if (isTable(props.selectedWidget.type)) {
      props.optionModel.pagination.pageSize = value
    } else {
      props.optionModel.valueSource.pageSize = value
    }
  },
  get() {
    if (isTable(props.selectedWidget.type)) {
      return props.optionModel?.pagination?.pageSize || 10
    } else {
      return props.optionModel.valueSource.pageSize
    }
  }
})

/**
 * 获取当前dataWrapper组件的全部子组件
 * @type {ComputedRef<*[]>}
 */
const compChildrenWidgets = computed(() => {
  const childrenWidgets = []
  traverseFieldWidgets(props.selectedWidget.widgetList, (field) => {
    childrenWidgets.push(field)
  })
  return childrenWidgets
})

const compBussinessData = computed(() => {
  return bussinessData.value.filter((data) => !inputColumnValue.value || data.label.toLowerCase().includes(inputColumnValue.value.toLowerCase()))
})

const compBindMap = computed({
  set(value) {
    props.optionModel.valueSource.bindMap = value
  },
  get() {
    return props.optionModel.valueSource.bindMap
  }
})

watch(inputColumnValue, (newVal) => {
  onCurrentChange(1)
})

watch(paramData, (newValue, oldValue) => {
  console.log('watch paramData', newValue);
  newValue.map(param => {
    compBindMap.value[param.scriptId]['scriptParams'][param.Param_Name] = {
      defaultValue: compBindMap.value[param.scriptId]['scriptParams'][param.Param_Name].defaultValue ?? param.Param_TestVALUE,
      linkWidget: param.bindWidget ?? []
    }
  })
}, {deep: true})

watch(bussinessData, (newValue, oldValue) => {
  console.log(newValue);
  // clearValueSource()
  newValue.map(row => {
    row.params.length > 0 && (compBindMap.value[row.scriptId]['scriptFields'][row.label] = {
      widgetId: row.widgetId,
      params: row.params.map(item => ({
        ...filterPostParam(item),
        defaultValue: item.defaultValue,
        procedureId: item.procedureId,
        procedureName: item.procedureName
      }))
    })
  })
}, {deep: true})


function clearValueSource() {
  compBindMap.value = {}
}

/**
 * 脚本参数绑定组件选择事件
 * @param row
 * @param value
 */
function onCascaderChange(row, value) {
  //有值代表是新选中状态,否则代表取消选中状态
  if (value) {
    compBindMap.value[row.scriptId]['scriptParams'][row.Param_Name].linkWidget = value
    props.designer.formWidget.getWidgetRef(value[0]).widget.options.onOperationButtonClick =
        `this.refList['${props.selectedWidget.id}'].setFormDataWithValueSource({
            ${row.scriptId}:{
              scriptName:'${row.scriptName}',
              params:{${row.Param_Name}:row['${value[1]}']}
            }
          })`
  } else {
    delete compBindMap.value[row.scriptId]['scriptParams']
    if (isEmptyObj(compBindMap.value[row.scriptId])) {
      delete compBindMap.value[row.scriptId]
    }
  }
}

/**
 * 给绑定关系赋值
 *
 * @param row
 */
function handleBindMap(row) {
  const vsBind = compBindMap.value
  vsBind[row.scriptId][row.label] = {
    widgetId: row.widgetId,
    params: row.params.map(param => {
      param.defaultValue = param.defaultValue ?? ""
      param.Param_TestVALUE = row.value
      return {
        ...filterPostParam(param),
        defaultValue: param.defaultValue,
        "procedureId": param.procedureId,
        "procedureName": param.procedureName
      }
    })
  }
}

/**
 * 绑定组件清空方法
 * @param row
 */
function onClearBindWidget(row) {
  getBindMapValueWithRow(row) && (getBindMapValueWithRow(row).widgetId = "")
}

function onBindWidgetChange(row) {
  getBindMapValueWithRow(row) && (getBindMapValueWithRow(row).widgetId = row.widgetId)
}

/**
 * 根据脚本ID获取脚本参数
 * @param script
 */
function loadScriptsParams(script) {
  console.log('loadScriptsParams', script);
  buildBindMap(script)
  script && getScriptsParams(script.ID).then(res => {
    // setScriptParamsToBindMap(script, res.Data.Params)

    loadTableData(script, res?.Data?.Params)
  })
}

function buildBindMap(script) {
  if (isEmptyObj(compBindMap.value)) {
    compBindMap.value = {
      [script.ID]: {
        scriptName: script.NAME,
        scriptParams: {},
        scriptFields: {}
      }
    }
  }
  if (!compBindMap.value?.[script.ID]) {
    compBindMap.value[script.ID] = {
      scriptName: script.NAME,
      scriptParams: [],
      scriptFields: {}
    }
  }
}

function setScriptParamsToBindMap({ID, NAME}, scriptParams) {
  props.optionModel.valueSource.bindMap[ID] = {
    ...props.optionModel.valueSource.bindMap[ID],
    scriptName: NAME,
    scriptParams: props.optionModel.valueSource.bindMap[ID]?.['scriptParams'] ?? {}
  }
  scriptParams.map(param => {
    param.Param_TestVALUE = compBindMap.value?.[ID]?.['scriptParams']?.[param.Param_Name]?.defaultValue ?? param.Param_TestVALUE
    compBindMap.value[ID]['scriptParams'][param.Param_Name] = {
      defaultValue: param.Param_TestVALUE,
      linkWidget: compBindMap.value[ID]['scriptParams']?.[param.Param_Name]?.linkWidget ?? []
    }
  })
}

/**
 * 根据id与参数从通用接口读取数据
 * @param script
 * @param params
 */
function loadTableData({ID: scriptId, NAME: scriptName}, params) {
  loadBussinessSource(assembleBussinessParams({
    scriptId,
    params,
    pageSize: compPageSize.value
  })).then(res => {
    //初始化绑定关系，如果有旧的绑定关系，则读取旧的为初始值
    const vsBindMap = compBindMap.value
    const columns = res.Data.TableHeaders
    //合并参数
    params.map(param => {
      paramData.value.push(
          {
            scriptName: scriptName,
            scriptId: scriptId,
            bindWidget: vsBindMap?.[scriptId]?.['scriptParams']?.[param.Param_Name]?.linkWidget,
            ...param,
            Param_TestVALUE: vsBindMap?.[scriptId]?.['scriptParams']?.[param.Param_Name]?.defaultValue //数据刷新时，如果绑定关系中有参数有默认值，则使用默认值
          })
    })


    //标记数据在整合数据中的位置
    scriptResponse.dataRange[scriptId] ? scriptResponse.dataRange[scriptId]['start'] = bussinessData.value.length : scriptResponse.dataRange[scriptId] = {start: bussinessData.value.length}
    bussinessData.value = bussinessData.value.concat(columns.map(column => {
      //给绑定MAP建立初始值key,如果已经存在bindmap中，则直接获取bindmap中值
      const row = {
        label: column,
        value: res.Data.TableData?.[0]?.[column],
        scriptName,
        scriptId,
        widgetId: vsBindMap?.[scriptId]?.[column]?.widgetId ?? "",
        params: vsBindMap?.[scriptId]?.[column]?.params ?? [],
      }
      //刷新数据时，重新关联绑定关系
      if (row.params.length > 0) {
        handleBindMap(row)
      }
      return row
    }))
    scriptResponse.dataRange[scriptId]['end'] = res.Data.TableHeaders.length
    onCurrentChange(1)

  })
}

function onCurrentChange(currentPage) {
  scriptResponse.data = pagination(currentPage > compBussinessData.value.length ? compBussinessData.value.length : currentPage, scriptResponse.pageSize, compBussinessData.value)
  scriptResponse.total = compBussinessData.value.length
}

function pagination(pageNo, pageSize, array) {
  const offset = (pageNo - 1) * pageSize;
  return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}


function loadDataFinished(vsData) {
  loadScriptsParams(vsData)
}

function refreshData() {
  const params = {}
  paramData.value.map(item => {
    params[item.scriptId] = {
      scriptParams: params[item.scriptId]?.['scriptParams'] ? [...params[item.scriptId]['scriptParams'], {...item}] : [{...item}],
      scriptName: item.scriptName
    }
    compBindMap.value[item.scriptId]['scriptParams'][item.Param_Name].defaultValue = item.Param_TestVALUE
  })

  paramData.value = []
  bussinessData.value = []
  traverseObj(params, (key, value) => {
    loadTableData({ID: key, NAME: value.scriptName}, value.scriptParams)
  })
}


//脚本树勾选取消时删除相关数据，包括绑定数据、脚本参数
function removePartialBussinessData(script) {
  //删除绑定关系中的存储过程参数与表格中的数据
  if (!isEmptyObj(scriptResponse.dataRange)) {
    const {start, end} = scriptResponse.dataRange[script.ID]
    const deleteBusDatas = bussinessData.value.splice(start, end)
    traverseObj(scriptResponse.dataRange, (key, item) => {
      if (item.start >= end) {
        item.start = item.start - end + start
      }
    })
    deleteBusDatas.map(({label: bindMapKey}) => {
      delete compBindMap.value[bindMapKey]
    })
    delete scriptResponse.dataRange[script.ID]
    removeScriptParam(script.ID)
    removeBindMap(script.ID)
    onCurrentChange(scriptResponse.currentPage)
  }
}

/**
 * 删除脚本参数
 */
function removeScriptParam(scriptId) {
  // console.log(paramData.value);
  for (let i = paramData.value.length - 1; i >= 0; i--) {
    const item = paramData.value[i]
    if (item.scriptId === scriptId) {
      paramData.value.splice(i, 1)
    }
  }
}


/**
 * 点击参数按钮时，删除已经绑定的存储过程参数
 * @param row
 * @param paramId
 */
function removeBindParam(row, paramId) {
  const bindMap = compBindMap.value
  const params = getBindMapValueWithRow(row).params
  const startIndex = params.findIndex(item => item.Param_ID === paramId)
  params.splice(startIndex, 1) //删除绑定关系中对应的存储过程参数
  if (params !== row.params) {
    row.params.splice(startIndex, 1) //删除绑定列表中对应的存储过程参数
  }
  if (params.length === 0) {
    //联动删除，如果参数全部被删除，则删除该键值，如果键值为空，则删除该脚本
    delete bindMap[row.scriptId][row.label]
    if (Object.keys(bindMap[row.scriptId]).length === 1 && Object.hasOwn(bindMap[row.scriptId], 'scriptName')) {
      delete compBindMap.value[row.scriptId]
    }
  }
}

/**
 * 删除绑定关系，如果参数是对象，则代表删除全部绑定关系，但保留数据源脚本查询参数(scriptParams)
 * @param scriptId
 */
function removeBindMap(scriptId) {
  const deletedParams = []
  if (isObj(scriptId) || scriptId === undefined) {
    traverseObj(compBindMap.value, (key, value) => {
      traverseObj(value, (sk, sv) => {
        if (sk !== 'scriptParams') {
          //同步dataTarget被选中状态
          sv && sv.params && deletedParams.push(...sv.params)
          delete value[sk]
        }
      })
    })
    traverseObj(compBindMap.value, (key, value) => {
      if (isEmptyObj(value)) {
        delete compBindMap.value[key]
      }
    })
    bussinessData.value = bussinessData.value.map(item => ({
      label: item.label,
      value: item.value,
      scriptName: item.scriptName,
      scriptId: item.scriptId,
      widgetId: "",
      params: []
    }))
    onCurrentChange(scriptResponse.currentPage)
    vDataTarget$.value.removeBoundProcedureStyle(deletedParams)
  } else {
    traverseObj(compBindMap.value[scriptId], (key, value) => {
      if (value.params) {
        deletedParams.push(...value.params)
      }
    })
    vDataTarget$.value.removeBoundProcedureStyle(deletedParams)
    delete compBindMap.value[scriptId]
  }
}

function getBindMapValueWithRow(row) {
  return compBindMap.value?.[row.scriptId]?.[row.label]
}

/**
 * 根据字段名自动绑定数据,遍历存储过程参数和数据源脚本字段，找到名称相同的进行绑定
 */
function autoBindData() {
  removeBindMap()
  //遍历数据源脚本字段
  bussinessData.value.map(sp => {
    //遍历存储过程参数
    procedureData.value.map(procedure => {
      procedure.params.map(pp => {
        if (sp.label === pp.Param_Name || (pp.Param_Name.startsWith('@') && sp.label === pp.Param_Name.substr(1))) {
          sp.params = [...sp.params, filterPostParam(pp)]
          props.optionModel.valueSource.bindMap = {
            ...compBindMap.value,
            [sp.scriptId]: {
              'scriptName': sp.scriptName,
              ...compBindMap.value[sp.scriptId],
              [sp.label]: {
                params: compBindMap.value[sp.scriptId]?.[sp.label]?.['params'] ? [
                      ...compBindMap.value[sp.scriptId][sp.label]['params'],
                      {
                        ...filterPostParam(pp),
                        "procedureId": pp.procedureId,
                        "procedureName": pp.procedureName
                      }] :
                    [{
                      ...filterPostParam(pp),
                      "procedureId": pp.procedureId,
                      "procedureName": pp.procedureName
                    }]
              }
            }
          }
        }
      })
    })
  })
}

/**
 * 设置参数默认值
 */
function onDefaultValueInput(row, param, value) {
  // console.log(getBindMapValueWithRow(row), param, value);
  getBindMapValueWithRow(row).params.find(bindMapParam => bindMapParam.Param_ID === param.Param_ID).defaultValue = value
  /*if (!!!value) {
    delete getBindMapValueWithRow(row)['defaultValue']
  }*/
  /*getBindMapValueWithRow(row)['defaultValue'] = value;
  */
}

/**
 * 修改绑定参数
 * @param row
 * @param value
 */
/*function onInputParamTestValue(row, value) {
  compBindMap.value[row.scriptId]['scriptParams'][row.Param_Name].defaultValue = value
}*/
</script>

<style scoped lang="scss">
.bussiness-container {
  height: 85vh;
  display: flex;

  .tree-wrapper {
    //overflow-y: auto;
    display: flex;
    flex-direction: column;
    border: var(--el-border);
    height: 100%;

    .tree-title {
      padding-left: 10px;
      font-size: 15px !important;
      border-bottom: var(--el-border);
    }

    .tree-body {
      height: calc(100% - 30px);
    }
  }

  .table-wrapper {
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