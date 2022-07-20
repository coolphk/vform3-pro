<template>
  <el-dialog @opened="onDrawOpened" v-model="showDataSource" :title="`请选择${i18nt('designer.setting.valueSource')}`"
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
        <!--        <div style="margin:10px 0 10px 8px">
                  数据展示条数:
                  <el-input-number v-model="compPageSize"></el-input-number>

                </div>-->
        <el-button type="primary" style="margin-left: 8px" @click="refreshData">刷新数据</el-button>
        <!--        参数列表-->
        <el-table :data="paramData" border max-height="200">
          <el-table-column prop="scriptId" label="id"/>
          <el-table-column prop="scriptName" label="脚本名称"/>
          <el-table-column prop="Param_Name" label="参数名" width="150"/>
          <el-table-column prop="Param_TestVALUE" label="测试值" width="150">
            <template #default="{row}">
              <el-input v-model="row.Param_TestVALUE"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="Param_BusiDes" label="业务说明" width="150"/>
          <el-table-column label="关联组件">
            <template #default="{row}">
              <el-cascader v-model="row.bindWidget" :options="paramBindWidgets"
                           @change="onCascaderChange(row,$event)"></el-cascader>
            </template>
          </el-table-column>
        </el-table>
        <div class="widget-wrapper">
          <template v-if="optionModel.valueSource">
            <span class="label">绑定关系表：</span><span style="color:darkcyan">{{
              optionModel.valueSource.sourceId
            }}</span>
          </template>
        </div>

        <!--        绑定列表-->
        <el-table
            ref="busTable$"
            style="width: 800px"
            max-height="600"
            border
            :data="scriptResponse.data"
        >
          <el-table-column prop="label" label="列名" width="120"/>
          <el-table-column prop="value" label="实际值" width="120"/>

          <el-table-column label="对应组件" width="150">
            <template #default="{row}">
              {{ row.label }}
              <el-select v-model="bindMap[row.label].widgetId"
                         clearable
                         style="width: 120px"
                         @clear="onClearBindWidget(row.label)"
              >
                <!--                @change="onChangeBindWidget(row)"-->
                <el-option v-for="(childWid,index) in compChildrenWidgets" :value="childWid.id"
                           :label="childWid.options.label"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="250">
            <template #default="{row}">
              <draggable
                  v-if="bindMap[row.label]"
                  class="el-card"
                  style="min-height: 22px"
                  :data-key="row.label"
                  :list="bindMap[row.label].params" item-key="Param_ID" :group="tableDragGroup"
                  @add="onDragAdd(row,$event)"
              >
                <template #item="{element,index}">
                  <div style="margin: 2px">
                    <el-button size="small" @click="removeBindParam(row['label'])">{{ element.Param_Name }}</el-button>
                  </div>
                </template>
              </draggable>
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
          <v-data-target :data-target="optionModel.dataTarget"></v-data-target>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>

import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {computed, reactive, ref, watch} from "vue";
import {getScriptsParams, getScriptTree, loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams, unFlatten} from "@/utils/data-adapter";
import ContextMenu from "@/components/context-menu/index.vue"
import {isTable, traverseFieldWidgets} from "@/utils/util";
import useBindParam from "@/components/form-designer/setting-panel/property-editor/bussiness-value-source/useBindParam";
import VDataTarget
  from "./components/v-data-target";
import VSourceTree
  from "./components/v-source-tree";
import {ElMessage} from "element-plus";

export default {
  name: "valueSource-drawer",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const vsTree$ = ref()
    const busTable$ = ref()
    const showDataSource = ref(false)

    const paramData = ref([])  //存储过程参数集合
    const paramBindWidgets = useBindParam(props.designer.widgetList) //存储过程参数需要绑定的组件列表
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
      put: (to, from, toEl) => {
        return bindMap[to.el.dataset.key].params.length === 0
        // return true
      },
      pull: false
    }
    const bindMap = reactive({})
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


    watch(bindMap, (newVal) => {
      const boundMap = {}
      Object.keys(newVal).map(key => {
        if (newVal[key].params.length > 0) {
          boundMap[key] = newVal[key]
        }
      })
      props.optionModel.valueSource.bindMap = boundMap
    })

    /**
     * dataWrapper绑定组件时触发
     */
    function onChangeBindWidget(row) {
      props.selectedWidget.options.valueSource.bindMap[row.prop] = row.bindWidgetId
    }

    /**
     * 脚本参数绑定组件选择事件
     * @param row
     * @param value
     */
    function onCascaderChange(row, value) {
      console.log(props.designer);
      console.log(row);
      console.log(value);

      props.designer.formWidget.getWidgetRef(value[0]).widget.options.onOperationButtonClick =
          `this.refList['${props.selectedWidget.id}'].setFormDataWithValueSource({${row.Param_Name}:row['${value[1]}']})`
    }

    function onClearBindWidget(key) {
      bindMap[key].widgetId = ""
    }

    function currentChange(node) {
      if (node.type === 'Scripts') {
        props.optionModel.valueSource['currentNodeKey'] = node.ID
        loadScriptsParams(node.ID)
      }
    }


    /**
     * 抽屉展开时刷新左侧树,获取脚本数据源
     */
    function onDrawOpened() {
      /*getScriptTree().then(res => {
        treeData.value = unFlatten(res.Data, 'ID')
        const scriptId = props?.optionModel?.valueSource?.currentNodeKey
        loadScriptsParams(scriptId)
      })*/
    }

    /**
     * 根据脚本ID获取脚本参数
     * @param script
     */
    function loadScriptsParams(script) {
      script && getScriptsParams(script.ID).then(res => {
        res?.Data?.Params.map(item => {
          paramData.value.push({
            scriptName: script.NAME,
            scriptId: script.ID,
            ...item
          })
        })
        loadTableData(script.ID, res?.Data?.Params)
      })
    }


    /**
     * 根据id与参数从通用接口读取数据
     * @param scriptId
     * @param params
     */
    function loadTableData(scriptId, params) {
      loadBussinessSource(assembleBussinessParams({
        scriptId,
        params,
        pageSize: compPageSize.value
      })).then(res => {
        //标记数据在整合数据中的位置
        scriptResponse.dataRange[scriptId] ? scriptResponse.dataRange[scriptId]['start'] = bussinessData.value.length : scriptResponse.dataRange[scriptId] = {start: bussinessData.value.length}
        const columns = res.Data.TableHeaders
        if (bussinessDataHasRepeatParam(columns, scriptId)) {
          ElMessage.error({
            message: '当前脚本有重复的字段，无法合并'
          })
          vsTree$.value.tree$.setChecked(scriptId, false)
          removeScriptParam(scriptId)
        } else {
          bussinessData.value = bussinessData.value.concat(columns.map(column => {
            //给绑定MAP建立初始值key
            bindMap[column] = {
              widgetId: "",
              params: []
            }
            return {
              label: column,
              value: res.Data.TableData?.[0]?.[column],
            }
          }))
          scriptResponse.dataRange[scriptId]['end'] = res.Data.TableHeaders.length
          onCurrentChange(1)
        }
      })
    }

    function bussinessDataHasRepeatParam(columns) {
      return columns.some(column => bussinessData.value.findIndex(item => item.label === column) > -1)
      /*if () {

        return true
      }
    })*/
    }

    function onCurrentChange(currentPage) {
      scriptResponse.data = pagination(currentPage > bussinessData.value.length ? bussinessData.value.length : currentPage, scriptResponse.pageSize, bussinessData.value)
      scriptResponse.total = bussinessData.value.length
    }

    function pagination(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize;
      return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    function refreshData() {
      loadTableData(props?.optionModel?.valueSource?.currentNodeKey, paramData.value)
    }

    function loadDataFinished(vsData) {
      loadScriptsParams(vsData)
    }

    function removePartialBussinessData(script) {
      //删除绑定数据中的参数
      const {start, end} = scriptResponse.dataRange[script.ID]
      const deleteBusDatas = bussinessData.value.splice(start, end)
      deleteBusDatas.map(({label: bindMapKey}) => {
        delete bindMap[bindMapKey]
      })
      console.log(22, bussinessData.value);
      removeScriptParam(script.ID)
      onCurrentChange(scriptResponse.currentPage)
    }

    /**
     * 删除脚本参数
     */
    function removeScriptParam(scriptId) {
      /*paramData.value.map(item => {
        if (item.scriptId === scriptId) {
          paramData.value.splice(item, 1)
        }
      })*/
      const start = paramData.value.findIndex(item => item.scriptId === scriptId)
      start > -1 && paramData.value.splice(start, 1)
    }

    /*function onValueSourceCheckChange(data, checked) {
      if (checked) {
        loadScriptsParams(data.ID)
      } else {

      }
    }*/

    /**
     * 将存储过程参数拖拽至绑定表格时触发
     * @param row
     * @param evt
     */
    function onDragAdd(row, evt) {
      // console.log(row, evt);
    }

    /**
     * 删除已经绑定的存储过程参数
     * @param bindMapKey
     */
    function removeBindParam(bindMapKey) {
      bindMap[bindMapKey].params = []
    }

    return {
      vsTree$,
      showDataSource,
      // treeData,
      paramData,
      scriptResponse,
      bussinessData,

      busTable$,
      compPageSize,
      compChildrenWidgets,
      paramBindWidgets,
      tableDragGroup,
      bindMap,
      loadDataFinished,
      removePartialBussinessData,
      onChangeBindWidget,
      onCascaderChange,
      currentChange,
      // nodeExpand,
      // nodeCollapse,
      onDrawOpened,
      refreshData,
      onCurrentChange,
      onClearBindWidget,
      // onValueSourceCheckChange,
      onDragAdd,
      removeBindParam
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
    showDataSource: Boolean
  },
  components: {
    ContextMenu, VDataTarget, VSourceTree
  },
}

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
    flex: 0 0 20%;

    .tree-title {
      padding-left: 10px;
      font-size: 15px !important;
      border-bottom: var(--el-border);
    }

    .tree-body {
      flex: 1 1 80%
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