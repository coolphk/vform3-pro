<template>
  <el-drawer @opened="onDrawOpened" v-model="showDataSource" :title="`请选择${i18nt('designer.setting.valueSource')}`" size="70%"
             show-close @close="close">
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
        <div style="margin:10px 0 10px 8px">
          数据展示条数:
          <el-input-number v-model="compPageSize"></el-input-number>
          <el-button type="primary" style="margin-left: 8px" @click="refreshData">刷新数据</el-button>
        </div>

        <el-table :data="tableData" border max-height="200">
          <el-table-column prop="Param_Name" label="参数名" width="150"/>
          <el-table-column prop="Param_TestVALUE" label="默认值" width="150">
            <template #default="{row}">
              <el-input v-model="row.Param_VALUE"></el-input>
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
          <!--          <template v-if="isTable(selectedWidget.type)">
                      <div class="label">选择要显示的列
                        <span style="margin-left: 8px">
                            <el-checkbox label="全选"
                                         v-model="checkAll"
                                         :indeterminate="compSelectedColumns.length<tableColumn.length && compSelectedColumns.length!==0"
                                         @change="onCheckAll"/>
                          </span>
                      </div>
                      <el-checkbox-group v-model="compSelectedColumns" style="max-height: 100px;overflow: auto">
                        <el-checkbox v-for="(item) in tableColumn" :label="item"></el-checkbox>
                      </el-checkbox-group>
                    </template>-->
        </div>
        <el-table
            v-if="bussinessData.length>0"
            ref="busTable$"
            style="width: 800px"
            :data="bussinessData"
            :header-cell-style="headerCellStyle"
            max-height="600"
            @row-contextmenu="onBusTableContextmenu"
        >
          <el-table-column v-for="(item) in tableColumn" :prop="item" :label="item"/>
        </el-table>
      </div>
      <context-menu v-model:show="showMenu" :options="menuOptions"></context-menu>
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
import {isTable} from "@/utils/util";

export default {
  name: "valueSource-drawer",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const tree$ = ref()
    const busTable$ = ref()
    const showDataSource = ref(false)
    const treeData = ref([])
    const tableData = ref([])  //存储过程参数集合
    const tableColumn = ref([]) //列表列的复选框组
    const bussinessData = ref([])
    const openNodeSet = reactive(new Set(props.optionModel.valueSource['expandedNodes']))
    const showMenu = ref(false)
    const currentColumn = ref({})
    const checkAll = ref(false)
    const menuOptions = reactive({
      x: 0,
      y: 0,
      title: '操作列表',
      handles: [
        {
          label: '设为控件值来源',
          handle() {
            props.optionModel.valueSource.sourceId = currentColumn.value?.property
            showMenu.value = false
          }
        }
      ]
    })

    const compSelectedColumns = computed({
      get: () => {
        return props.optionModel.tableColumns.map(item => item.prop)
      },
      set: (values) => {

        //设置table的列
        props.optionModel.tableColumns = values.map((prop, index) => ({
              columnId: ++index,
              prop,
              "label": prop,
              "width": "100",
              "show": true,
              "align": "center"
            })
        )
      }
    })

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

    watch(openNodeSet, (newVal) => {
      props.optionModel.valueSource["expandedNodes"] = Array.from(newVal)
    })

    function onCheckAll(value) {
      if (value)
        compSelectedColumns.value = tableColumn.value
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
        props.optionModel.tableColumns && (props.optionModel.tableColumns = [])
        props.optionModel.tableData && (props.optionModel.tableData = [])
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
      // props.optionModel.tableColumns = []
      scriptId && getScriptsParams(scriptId).then(res => {
        tableData.value = res?.Data?.Params
        //将当前控件的默认值替换脚本配置页的默认值
        props.optionModel.valueSource['scriptParams'].map(param => {
          const defaultValue = tableData.value.find(item => item.Param_ID === param.Param_ID)
          if (!!param.Param_VALUE && !!defaultValue) {
            defaultValue.Param_VALUE = param.Param_VALUE
          }
        })
        props.optionModel.valueSource['scriptParams'] = tableData.value
        loadTableData(scriptId, tableData.value)
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
        bussinessData.value = res.Data.TableData
        tableColumn.value = res.Data.TableHeaders
        /*console.log(tableColumn.value);
        if (isTable(props.selectedWidget.type)) {
          props.optionModel.tableData = res.Data.TableData
        }*/
      })
    }

    function refreshData() {
      loadTableData(props?.optionModel?.valueSource?.currentNodeKey, tableData.value)
    }

    function onBusTableContextmenu(row, column, event) {
      if (!isTable(props.selectedWidget.type)) {
        event.preventDefault()
        showMenu.value = true
        menuOptions.x = event.x
        menuOptions.y = event.y
        currentColumn.value = column
      }
    }

    function close() {
      console.log(22, showDataSource.value = false);
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
      tableData,
      tableColumn,
      bussinessData,
      tree$,
      busTable$,
      showMenu,
      menuOptions,
      compSelectedColumns,
      compPageSize,
      checkAll,
      isTable,
      currentChange,
      nodeExpand,
      nodeCollapse,
      onDrawOpened,
      refreshData,
      onBusTableContextmenu,
      onCheckAll,
      close,
      headerCellStyle
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