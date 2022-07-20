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
          <el-auto-resizer>
            <template #default="{ height, width }">
              <el-tree-v2
                  ref="tree$"
                  node-key="ID"
                  show-checkbox
                  :height="height"
                  :highlight-current="true"
                  :indent="8"
                  :props="{label:'NAME',children:'children',value:'ID'}"
                  :data="treeData"
                  :default-expanded-keys="optionModel.valueSource['expandedNodes']"
                  :current-node-key="optionModel.valueSource['currentNodeKey']"
                  @node-expand="nodeExpand"
                  @node-collapse="nodeCollapse"
                  @current-change="currentChange"
                  @check-change="onValueSourceCheckChange"
              >
              </el-tree-v2>
            </template>
          </el-auto-resizer>
        </div>
      </div>

      <div class="table-wrapper">
        <!--        <div style="margin:10px 0 10px 8px">
                  数据展示条数:
                  <el-input-number v-model="compPageSize"></el-input-number>

                </div>-->
        <el-button type="primary" style="margin-left: 8px" @click="refreshData">刷新数据</el-button>
        <!--        参数列表-->
        <!--        <el-table :data="paramData" border max-height="200">
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
                </el-table>-->
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
              <el-select v-model="row.bindWidgetId" :value-key="row.bindWidgetId"
                         clearable
                         style="width: 120px"
                         @change="onChangeBindWidget(row)"
                         @clear="onClearBindWidget(row)"
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
        {{ bindMap }}
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
  from "./components/v-data-target/index";

export default {
  name: "valueSource-drawer",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const tree$ = ref()
    const busTable$ = ref()
    const showDataSource = ref(false)
    const treeData = ref([])
    const paramData = ref([])  //存储过程参数集合
    const paramBindWidgets = useBindParam(props.designer.widgetList) //存储过程参数需要绑定的组件列表
    const scriptResponse = reactive({
      data: [],
      dataRange: {},
      total: 0,
      currentPage: 1,
      pageSize: 10
    }) //根据脚本参数查询的实际的数据，并进行分页
    const bussinessData = ref([])
    const openNodeSet = reactive(new Set(props.optionModel.valueSource['expandedNodes']))
    const tableDragGroup = { //绑定表格中拖拽容器
      name: 'itxst',
      put: (to, from, toEl) => {
        // console.log(to, toEl);
        console.log(33, to.el.dataset)
        console.log(bindMap[to.el.dataset.key].params)
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
    const compChildrenWidgets = computed(() => {
      const childrenWidgets = []
      traverseFieldWidgets(props.selectedWidget.widgetList, (field) => {
        childrenWidgets.push(field)
      })
      return childrenWidgets
    })

    watch(openNodeSet, (newVal) => {
      props.optionModel.valueSource["expandedNodes"] = Array.from(newVal)
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

    function onClearBindWidget(row) {
      delete props.optionModel.valueSource.bindMap[row.label]
    }

    function currentChange(node) {
      if (node.type === 'Scripts') {
        props.optionModel.valueSource['currentNodeKey'] = node.ID
        loadScriptsParams(node.ID)
      }
    }

    function nodeExpand(data) {
      console.log(111);
      openNodeSet.add(data.ID)
    }

    function nodeCollapse(data) {
      openNodeSet.delete(data.ID)
    }

    /**
     * 抽屉展开时刷新左侧树,获取脚本数据源
     */
    function onDrawOpened() {
      getScriptTree().then(res => {
        treeData.value = unFlatten(res.Data, 'ID')
        console.log(222, treeData.value);
        const scriptId = props?.optionModel?.valueSource?.currentNodeKey
        loadScriptsParams(scriptId)
      })
    }

    /**
     * 根据脚本ID获取脚本参数
     * @param scriptId
     */
    function loadScriptsParams(scriptId) {
      scriptId && getScriptsParams(scriptId).then(res => {
        paramData.value = res?.Data?.Params.map(item => ({
          ...item,
        }))
        // props.optionModel.valueSource['scriptParams'][scriptId] = paramData.value

        loadTableData(scriptId, paramData.value)
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
        scriptResponse.dataRange[scriptId] ? scriptResponse.dataRange[scriptId]['start'] = bussinessData.value.length : scriptResponse.dataRange[scriptId] = {start: bussinessData.value.length}

        bussinessData.value = bussinessData.value.concat(res.Data.TableHeaders.map(column => {
          bindMap[column] = {
            widget: {},
            params: []
          }
          return {
            label: column,
            value: res.Data.TableData?.[0]?.[column],
            bindWidgetId: "",
            dataTarget: {
              checkedNodes: [],
              expandedNodes: [],
              procedureValue: {}
            }
          }
        }))
        scriptResponse.dataRange[scriptId]['end'] = res.Data.TableHeaders.length
        onCurrentChange(1)

      })
      console.log(333, bindMap);
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

    function onValueSourceCheckChange(data, checked) {
      if (checked) {
        loadScriptsParams(data.ID)
      } else {
        const {start, end} = scriptResponse.dataRange[data.ID]
        const deleteParms = bussinessData.value.splice(start, end)
        console.log(deleteParms);
        deleteParms.map(({label: bindMapKey}) => {
          delete bindMap[bindMapKey]
        })
        onCurrentChange(scriptResponse.currentPage)
      }
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
      showDataSource,
      treeData,
      paramData,
      scriptResponse,
      bussinessData,
      tree$,
      busTable$,
      compPageSize,
      compChildrenWidgets,
      paramBindWidgets,
      tableDragGroup,
      bindMap,
      onChangeBindWidget,
      currentChange,
      nodeExpand,
      nodeCollapse,
      onDrawOpened,
      refreshData,
      onCurrentChange,
      onClearBindWidget,
      onValueSourceCheckChange,
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
    ContextMenu, VDataTarget
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