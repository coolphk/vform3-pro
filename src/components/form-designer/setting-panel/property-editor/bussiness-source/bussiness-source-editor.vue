<template>
  <el-form-item :label="i18nt('designer.setting.bussinessSource')">
    <el-button @click="showDataSource=true">选择</el-button>
    <el-drawer v-if="showDataSource" @opened="onDrawOpened" v-model="showDataSource" title="选择需要匹配的数据" size="70%"
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
              :default-expanded-keys="optionModel.bussinessSource['expandedNodes']"
              :current-node-key="optionModel.bussinessSource['currentNodeKey']"
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
            <template v-if="optionModel.labelKey">
              <span class="label">控件Label：</span><span style="color:darkcyan">{{
                optionModel.labelKey
              }}</span>
              <span class="label" style="margin-left: 8px">控件Value：</span><span style="color:brown">{{
                optionModel.valueKey
              }}</span>
            </template>
            <template v-if="selectedWidget.type==='data-table'">
              <div class="label">选择要显示的列</div>
              <el-checkbox-group v-model="compSelectedColumns" style="max-height: 100px;overflow: auto">
                <el-checkbox v-for="(item) in tableColumn" :label="item"></el-checkbox>
              </el-checkbox-group>
            </template>
          </div>
          <el-table v-if="bussinessData.length>0"
                    ref="busTable$"
                    style="width: 800px"
                    :data="bussinessData"
                    max-height="600"
                    @row-contextmenu="onBusTableContextmenu"
          >
            <el-table-column v-for="(item) in tableColumn" :prop="item" :label="item"/>
          </el-table>
        </div>
        <table-menu v-model:show="showMenu" :options="menuOptions"></table-menu>
      </div>
    </el-drawer>
  </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {computed, reactive, ref, watch} from "vue";
import {getScriptsParams, getScriptTree, loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams} from "@/utils/data-adapter";
import TableMenu from "@/components/table-menu/index.vue"

export default {
  name: "bussinessSource-editor",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const tree$ = ref()
    const busTable$ = ref()
    const showDataSource = ref(false)
    const treeData = ref([])
    const tableData = ref([])
    const tableColumn = ref([]) //列表列的复选框组
    const bussinessData = ref([])
    const openNodeSet = reactive(new Set(props.optionModel.bussinessSource['expandedNodes']))
    const showMenu = ref(false)
    const menuOptions = reactive({
      x: 0,
      y: 0,
      currentRow: {},
      currentColumn: {},
      currentWidget: {}
    })

    const compSelectedColumns = computed({
      get: () => {
        return props.optionModel.tableColumns.map(item => item.prop)
      },
      set: (value) => {
        props.optionModel.tableColumns = value.map((prop, index) => ({
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
        if (props.selectedWidget.type === 'data-table') {
          props.optionModel.pagination.pageSize = value
        } else {
          props.optionModel.bussinessData.pageSize = value
        }
      },
      get() {
        if (props.selectedWidget.type === 'data-table') {
          return props.optionModel.pagination.pageSize
        } else {
          return props.optionModel.bussinessData.pageSize
        }
      }
    })

    watch(openNodeSet, (newVal) => {
      props.optionModel.bussinessSource["expandedNodes"] = Array.from(newVal)
    })

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
        props.optionModel.bussinessSource['currentNodeKey'] = node.ID
        props.optionModel.tableColumns = []
        props.optionModel.tableData = []
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
      })
      console.log('onDrawOpened currentNodeKey', props?.optionModel?.bussinessSource?.currentNodeKey);
      const scriptId = props?.optionModel?.bussinessSource?.currentNodeKey
      loadScriptsParams(scriptId)
    }

    /**
     * 根据脚本ID获取脚本参数
     * @param scriptId
     */
    function loadScriptsParams(scriptId) {
      // props.optionModel.tableColumns = []
      scriptId && getScriptsParams(scriptId).then(res => {
        tableData.value = res?.Data?.Params
        props.optionModel.bussinessSource['scriptParams'] = tableData.value
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
        props.optionModel.tableData = res.Data.TableData
      })
    }

    function refreshData() {
      loadTableData(props?.optionModel?.bussinessSource?.currentNodeKey, tableData.value)
    }

    function onBusTableContextmenu(row, column, event) {
      event.preventDefault()
      showMenu.value = true
      menuOptions.x = event.x
      menuOptions.y = event.y
      menuOptions.currentColumn = column
      menuOptions.currentRow = row
      menuOptions.currentWidget = props.selectedWidget
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
      currentChange,
      nodeExpand,
      nodeCollapse,
      onDrawOpened,
      refreshData,
      onBusTableContextmenu,
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  components: {
    TableMenu
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