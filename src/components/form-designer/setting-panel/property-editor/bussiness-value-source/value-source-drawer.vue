<template>
  <el-dialog v-model="showDataSource" :title="`请选择${i18nt('designer.setting.valueSource')}`"
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
          <el-table-column prop="scriptName" label="脚本名称"/>
          <el-table-column prop="label" label="列名" width="120"/>
          <el-table-column prop="value" label="实际值" width="120"/>

          <el-table-column label="对应组件" width="150">
            <template #default="{row}">
              <el-select v-model="bindMap[row.label].widgetId"
                         clearable
                         style="width: 120px"
                         @clear="onClearBindWidget(row.label)"
              >
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
import {getScriptsParams, loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams} from "@/utils/data-adapter";
import ContextMenu from "@/components/context-menu/index.vue"
import {isTable, traverseFieldWidgets} from "@/utils/util";
import useBindParam from "@/components/form-designer/setting-panel/property-editor/bussiness-value-source/useBindParam";
import VDataTarget from "./components/v-data-target";
import VSourceTree from "./components/v-source-tree";
import {ElMessage} from "element-plus";

export default {
  name: "valueSource-drawer",
  mixins: [i18n, propertyMixin],
  setup(props) {
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

      },
      pull: false
    }
    //脚本字段、组件、存储过程绑定关系
    const bindMap = reactive({})

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


    watch(bindMap, (newVal) => {
      let boundMap = {}
      //过滤出已经绑定的数据，存入组件bindMap
      Object.keys(newVal).map(key => {
        if (newVal[key].params.length > 0) {
          const params = newVal[key].params.map((
              {
                Param_ID, Param_Name, procedureId, procedureName
              }
          ) => ({
            Param_ID,
            Param_Name,
            procedureId,
            procedureName
          }))
          boundMap[key] = newVal[key]
          boundMap[key].params = params
        }
      })
      props.optionModel.valueSource.bindMap = boundMap
      boundMap = null
    })

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

    /**
     * 绑定组件清空方法
     * @param key
     */
    function onClearBindWidget(key) {
      bindMap[key].widgetId = ""
    }


    /**
     * 根据脚本ID获取脚本参数
     * @param script
     */
    function loadScriptsParams(script) {
      script && getScriptsParams(script.ID).then(res => {
        loadTableData(script, res?.Data?.Params)
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
        //标记数据在整合数据中的位置
        scriptResponse.dataRange[scriptId] ? scriptResponse.dataRange[scriptId]['start'] = bussinessData.value.length : scriptResponse.dataRange[scriptId] = {start: bussinessData.value.length}
        const columns = res.Data.TableHeaders
        //如果当前绑定数据中包含新选择的项，删除相关参数，否则才给绑定表格加薪数据
        if (bussinessDataHasRepeatParam(columns, scriptId)) {
          ElMessage.error({
            message: '当前脚本有重复的字段，无法合并'
          })
          vsTree$.value.tree$.setChecked(scriptId, false)
        } else {
          //合并参数
          paramData.value = paramData.value.concat(params.map(param => ({
            scriptName: scriptName,
            scriptId: scriptId,
            ...param
          })))

          //合并数据
          bussinessData.value = bussinessData.value.concat(columns.map(column => {
            //给绑定MAP建立初始值key

            bindMap[column] = {
              scriptId,
              scriptName,
              widgetId: "",
              params: []
            }
            return {
              label: column,
              value: res.Data.TableData?.[0]?.[column],
              scriptName
            }
          }).sort((a, b) => a.label.localeCompare(b.label)))
          scriptResponse.dataRange[scriptId]['end'] = res.Data.TableHeaders.length
          onCurrentChange(1)
        }
      })
    }

    /**
     * 判断当前数据是否包含新选中脚本的列
     * @param columns
     * @returns {*}
     */
    function bussinessDataHasRepeatParam(columns) {
      return columns.some(column => {
        if (bussinessData.value.findIndex(item => item.label === column) > -1) {
          console.log(column);
          return true
        } else {
          return false
        }
      })
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

    //脚本树勾选取消时删除相关数据，包括绑定数据、脚本参数
    function removePartialBussinessData(script) {
      //删除绑定数据中的参数
      const {start, end} = scriptResponse.dataRange[script.ID]
      const deleteBusDatas = bussinessData.value.splice(start, end)
      deleteBusDatas.map(({label: bindMapKey}) => {
        delete bindMap[bindMapKey]
      })
      removeScriptParam(script.ID)
      onCurrentChange(scriptResponse.currentPage)
    }

    /**
     * 删除脚本参数
     */
    function removeScriptParam(scriptId) {
      const start = paramData.value.findIndex(item => item.scriptId === scriptId)
      start > -1 && paramData.value.splice(start, 1)
    }

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
      busTable$,
      showDataSource,
      paramData,
      scriptResponse,
      bussinessData,
      compPageSize,
      compChildrenWidgets,
      paramBindWidgets,
      tableDragGroup,
      bindMap,
      loadDataFinished,
      removePartialBussinessData,
      onCascaderChange,
      refreshData,
      onCurrentChange,
      onClearBindWidget,
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