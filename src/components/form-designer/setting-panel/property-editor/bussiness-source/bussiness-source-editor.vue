<template>
  <el-form-item :label="i18nt('designer.setting.bussinessSource')">
    <el-button @click="showDataSource=true">选择</el-button>
    <el-drawer @opened="onDrawOpened" v-model="showDataSource" title="选择需要匹配的数据" size="70%" show-close>
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
            <el-input-number v-model="optionModel.bussinessSource.pageSize"></el-input-number>
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
            <template v-if="selectedWidget.options.labelKey">
              <span class="label">控件Label：</span><span style="color:darkcyan">{{
                selectedWidget.options.labelKey
              }}</span>
              <span class="label" style="margin-left: 8px">控件Value：</span><span style="color:brown">{{
                selectedWidget.options.valueKey
              }}</span>
            </template>
            <template v-if="selectedWidget.type==='data-table'&& bussinessData.length>0">
              <div class="label">选择要显示的列</div>
              <el-checkbox-group v-model="selectedColumns" style="max-height: 100px;overflow: auto">
                <el-checkbox v-for="(item) in Object.keys(bussinessData?.[0])" :label="item"></el-checkbox>
              </el-checkbox-group>
              <!--              {{bussinessData?.[0]}}-->
            </template>
          </div>
          <el-table v-if="bussinessData.length>0"
                    ref="busTable$"
                    style="width: 800px"
                    :data="bussinessData"
                    max-height="600"
                    @row-contextmenu="onBusTableContextmenu"
          >
            <el-table-column v-for="(item) in Object.keys(bussinessData?.[0])" :prop="item" :label="item"/>
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
    const bussinessData = ref([])
    const openNodeSet = reactive(new Set(props.optionModel.bussinessSource['expandedNodes']))
    const showMenu = ref(false)
    // const selectedColumns = ref()
    const selectedColumns = computed({
      get: () => {
        return props.selectedWidget.options.tableColumns.map(item => item.prop)
      },
      set: (value) => {
        props.selectedWidget.options.tableColumns = value.map((prop, index) => ({
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
    const menuOptions = reactive({
      x: 0,
      y: 0,
      currentRow: {},
      currentColumn: {},
      currentWidget: {}
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
        loadScriptsParams(node.ID)
      }
    }

    function nodeExpand(data) {
      openNodeSet.add(data.ID)
    }

    function nodeCollapse(data) {
      openNodeSet.delete(data.ID)
    }

    function onDrawOpened() {
      getScriptTree().then(res => {
        treeData.value = unFlatten(res.Data, 'ID')
      })
      const scriptId = props?.optionModel?.bussinessSource?.currentNodeKey
      loadScriptsParams(scriptId)
    }

    function loadScriptsParams(scriptId) {
      scriptId && getScriptsParams(scriptId).then(res => {
        tableData.value = res?.Data?.Params
        props.optionModel.bussinessSource['scriptParams'] = tableData.value
        loadTableData(scriptId, tableData.value)
      })
    }

    function loadTableData(scriptId, params) {
      loadBussinessSource(assembleBussinessParams({
        scriptId,
        params,
        pageSize: props.optionModel.bussinessSource.pageSize
      })).then(res => {
        console.log('loadBussinessSource', res);
        // this.loadOptions(res.Data.TableData)
        bussinessData.value = res.Data.TableData
        props.selectedWidget.options.tableData = res.Data.TableData
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

    //给数据表控件选择要显示的列
    function selectTableColumn(value) {
      console.log(value);
    }

    return {
      showDataSource,
      treeData,
      tableData,
      bussinessData,
      tree$,
      busTable$,
      showMenu,
      menuOptions,
      selectedColumns,
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