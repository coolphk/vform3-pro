<template>
  <el-form-item :label="i18nt('designer.setting.bussinessSource')">
    <el-button @click="showDataSource=true">选择</el-button>
    <el-drawer v-model="showDataSource" title="选择需要匹配的数据" size="70%" show-close>
      <div class="bussiness-container">
        <!--        <el-tree
                    ref="tree$"
                    show-checkbox
                    node-key="Param_ID"
                    check-on-click-node
                    :props="treeProps"
                    :data="treeData"
                    :check-on-click-node="false"
                    :default-expanded-keys="optionModel.dataTarget['expandedNodes']"
                    :default-checked-keys="optionModel?.dataTarget['checkedNodes']?.map(item=>item.Param_ID)"
                    @check="checkNode"
                    @node-collapse="nodeCollapse"
                    @node-expand="nodeExpand"

                >-->
        <div class="tree_wrap">
          <el-tree
              ref="tree$"
              node-key="ID"
              check-on-click-node
              :indent="8"
              :props="{label:'NAME'}"
              :data="treeData"
              :default-expanded-keys="optionModel.bussinessSource['expandedNodes']"
              @node-expand="nodeExpand"
              @node-collapse="nodeCollapse"
              @current-change="currentChange"
          >
          </el-tree>
        </div>
        <div class="table_wrap">
          <el-table :data="tableData" border max-height="200">
            <el-table-column prop="Param_Name" label="参数名" width="150"/>
<!--            <el-table-column prop="widgetId" label="绑定组件" width="150">
              <template #default="{row}">
                <el-select v-model="optionModel.bussinessSource.bindWidgetId" value-key="id" clearable>
                  <el-option v-for="(widget,index) in designer.widgetList.filter(item=>item.id !==selectedWidget.id)"
                             :value="widget.id" :label="widget.options.label"/>
                </el-select>
              </template>

            </el-table-column>-->
            <el-table-column prop="Param_TestVALUE" label="默认值" width="150">
              <template #default="{row}">
                <el-input v-model="row.Param_VALUE"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="Param_BusiDes" label="业务说明"/>

          </el-table>
        </div>
      </div>
    </el-drawer>
  </el-form-item>
</template>

<script>
import i18n, {translate} from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {onMounted, ref, reactive, watch} from "vue";
import {getScriptsParams, getScriptTree} from "@/api/bussiness-source";

export default {
  name: "bussinessSource-editor",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const showDataSource = ref(false)
    const treeData = ref([])
    const tableData = ref([])
    const openNodeSet = reactive(new Set(props.optionModel.bussinessSource['expandedNodes']))


    watch(openNodeSet, (newVal) => {
      props.optionModel.bussinessSource["expandedNodes"] = Array.from(newVal)
    })

    getScriptTree().then(res => {
      treeData.value = unFlatten(res.Data, 'ID')
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
        getScriptsParams(node.ID).then(res => {
          tableData.value = res?.Data?.Params
        })
      }
      /**/
    }

    function nodeExpand(data) {
      console.log(333, data);
      openNodeSet.add(data.ID)
    }

    function nodeCollapse(data) {
      console.log(222, data);
      openNodeSet.delete(data.ID)
    }

    onMounted(() => {
      console.log(props.designer);
    })
    return {
      showDataSource,
      treeData,
      tableData,
      currentChange,
      nodeExpand,
      nodeCollapse
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
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
}
</style>