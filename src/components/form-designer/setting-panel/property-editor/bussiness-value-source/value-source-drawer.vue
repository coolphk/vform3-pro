<template>
  <el-drawer @opened="onDrawOpened" v-model="showDataSource" :title="`请选择${i18nt('designer.setting.valueSource')}`"
             size="70%"
             show-close>
    <div class="bussiness-container">
      <div class="tree_wrap">
        <el-tree
            ref="tree$"
            node-key="ID"
            check-on-click-node
            :highlight-current="true"
            :indent="8"
            :props="{label:'NAME'}"
            :data="treeData"
            :default-expanded-keys="optionModel.valueSource['expandedNodes']"
            :current-node-key="optionModel.valueSource['currentNodeKey']"
            @node-expand="nodeExpand"
            @node-collapse="nodeCollapse"
            @current-change="currentChange"
        >
        </el-tree>
      </div>
      <div class="table_wrap">
        <!--        <div style="margin:10px 0 10px 8px">
                  数据展示条数:
                  <el-input-number v-model="compPageSize"></el-input-number>

                </div>-->
        <el-button type="primary" style="margin-left: 8px" @click="refreshData">刷新数据</el-button>
        <el-table :data="paramData" border max-height="200">
          <el-table-column prop="Param_Name" label="参数名" width="150"/>
          <el-table-column prop="Param_TestVALUE" label="测试值" width="150">
            <template #default="{row}">
              <el-input v-model="row.Param_TestVALUE"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="Param_BusiDes" label="业务说明"/>
        </el-table>
        <div class="widget-wrapper">
          <template v-if="optionModel.valueSource">
            <span class="label">值来源：</span><span style="color:darkcyan">{{
              optionModel.valueSource.sourceId
            }}</span>
          </template>
        </div>
        <el-table
            ref="busTable$"
            style="width: 800px"
            max-height="600"
            border
            :data="scriptResponse.data"
        >
          <el-table-column prop="label" label="列名" width="120"/>
          <el-table-column prop="value" label="实际值"/>

          <el-table-column>
            <template #default="{row}">
              <el-select v-model="row.bindWidgetId" :value-key="row.bindWidgetId"
                         clearable
                         @change="onChangeBindWidget(row)"
                         @clear="onClearBindWidget(row)"
              >
                <el-option v-for="(childWid,index) in compChildrenWidgets" :value="childWid.id"
                           :label="childWid.options.label"/>
              </el-select>
              <div></div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model="scriptResponse.currentPage"
            :page-size="scriptResponse.pageSize"
            :total="scriptResponse.total"
            @current-change="onCurrentChange"
        />
        {{ selectedWidget?.options?.valueSource?.bindMap }}
      </div>
    </div>
  </el-drawer>
</template>

<script>

import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {computed, reactive, ref, watch} from "vue";
import {getScriptsParams, getScriptTree, loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams} from "@/utils/data-adapter";
import ContextMenu from "@/components/context-menu/index.vue"
import {inObject, isTable, traverseFieldWidgets} from "@/utils/util";

export default {
  name: "valueSource-drawer",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const tree$ = ref()
    const busTable$ = ref()
    const showDataSource = ref(false)
    const treeData = ref([])
    const paramData = ref([])  //存储过程参数集合
    const scriptResponse = reactive({
      data: [],
      total: 0,
      currentPage: 1,
      pageSize: 10
    }) //脚本查询后返回的数据
    const bussinessData = ref([]) //最终显示数据
    const openNodeSet = reactive(new Set(props.optionModel.valueSource['expandedNodes']))

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


    /**
     * dataWrapper绑定组件时触发
     */
    function onChangeBindWidget(row) {
      props.selectedWidget.options.valueSource.bindMap[row.label] = row.bindWidgetId
    }

    function onClearBindWidget(row) {
      delete props.optionModel.valueSource.bindMap[row.label]
    }

    /***
     * 将数组转换为children树形结构
     * @param arr
     * @param idKey
     * @param attr
     * @returns {(Map<any, any>|*)[]}
     */
    function unFlatten(arr, idKey = 'ID', attr = {}) {
      arr.forEach(item => {
        item['children'] = getChildren(arr, item[idKey])
        Object.keys(attr).forEach(key => {
          item[key] = attr[key]
        })
      })
      return getChildren(arr, '0000')
    }

    function getChildren(arr, parentValue, parentKey = 'Parent_ID',) {
      return arr.filter(item => item[parentKey] === parentValue)
    }

    function currentChange(node) {
      if (node.type === 'Scripts') {
        props.optionModel.valueSource['currentNodeKey'] = node.ID
        loadScriptsParams(node.ID)
      }
    }

    function nodeExpand(data) {
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
        paramData.value = res?.Data?.Params
        props.optionModel.valueSource['scriptParams'] = paramData.value
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
        bussinessData.value = res.Data.TableHeaders.map(column => {
          //如果已经选择子控件的dataTarget，则根据选中参数来匹配当前列，如果相等的话默认进行绑定
          const sameKeyId = compChildrenWidgets.value.find(widget => !!widget.options.dataTarget.checkedNodes.find(node => node.Param_Name === column))?.id
          sameKeyId && (props.optionModel.valueSource.bindMap[column] = sameKeyId)
          return {
            label: column,
            bindWidgetId: props.optionModel.valueSource.bindMap[column],
            value: res.Data.TableData?.[0][column]
          }
        })
        onCurrentChange(1)
        scriptResponse.total = bussinessData.value.length
      })
    }

    function onCurrentChange(currentPage) {
      scriptResponse.data = pagination(currentPage, scriptResponse.pageSize, bussinessData.value)
    }

    function pagination(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize;
      return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    function refreshData() {
      loadTableData(props?.optionModel?.valueSource?.currentNodeKey, paramData.value)
    }


    function headerCellStyle({column}) {
      const cellStyle = {}
      if (column.property === props.optionModel.valueSource.sourceId) {
        cellStyle['backgroundColor'] = 'darkcyan'
        cellStyle['color'] = 'white'
      }
      /*if (column.property === props.optionModel.valueKey) {
        cellStyle['backgroundColor'] = 'brown'
        cellStyle['color'] = 'white'
      }*/
      return cellStyle
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
      onChangeBindWidget,
      currentChange,
      nodeExpand,
      nodeCollapse,
      onDrawOpened,
      refreshData,
      headerCellStyle,
      onCurrentChange,
      onClearBindWidget
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
    showDataSource: Boolean
  },
  components: {
    ContextMenu
  }
}

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