<template>

  <el-form-item :label="i18nt('designer.setting.dataTarget')">
    <el-button @click="showDataTargetDialog=true">选择</el-button>
    <el-drawer @open="onDrawOpen" v-model="showDataTargetDialog" title="选择需要匹配的数据" show-close>
      <div style="height: 80vh;overflow: auto">
        <procedure-select v-if="showDataTargetDialog" @onProcedureSelect="onProcedureSelect"
                          :procedureValue="optionModel.dataTarget['procedureValue']"/>
        <el-tree
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

        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span style="color:darkcyan">({{ data.Param_ObjType }})</span>
              <span v-if="data.Param_Des" style="color: #2c91ff">-[{{
                  data.Param_Des
                }}]</span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-drawer>
  </el-form-item>

</template>

<script>
import i18n, {translate} from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin"
import {computed, nextTick, reactive, ref, watch} from "vue";
import {getProcedureParams} from "@/api/data-schema";
import ProcedureSelect from "@/components/form-designer/toolbar-panel/datasource-dialog/procedure-select/index";
import {getChildren, transferData, unflatten} from "@/utils/data-adapter";
import {ElMessage} from "element-plus";
import {isEmptyObj} from "@/utils/util";


export default {
  name: "dataTarget-editor",
  components: {ProcedureSelect},
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    //存储过程值
    // const procedureValue = ref(props.optionModel.dataTarget['procedureValue'])
    const showDataTargetDialog = ref(false)
    const openNodeSet = reactive(new Set(props.optionModel.dataTarget['expandedNodes']))
    const tree$ = ref("")
    const treeProps = {
      label: 'Param_Name',
      children: 'children',
      isLeaf: 'isLeaf',
    }
    const treeData = ref([])

    watch(openNodeSet, (newVal) => {
      props.optionModel.dataTarget["expandedNodes"] = Array.from(newVal)
    })

    // 选择存储过程，通过过程名称加载存储过程参数，并设置树形组件默认展开根节点
    function onProcedureSelect(val) {
      //切换存储过程时清空展开的节点
      openNodeSet.clear()
      props.optionModel.dataTarget['procedureValue'] = val
      props.optionModel.dataTarget.checkedNodes = []
      loadTreeData(val)
    }

    function checkNode(data, {checkedNodes}) {

      // console.log('selectedWidget', props.selectedWidget);
      if (props.selectedWidget.type === 'edit-table') {
        if (!_isArrayChild(data)) {
          ElMessage.error(`${translate('extension.widgetLabel.' + props.selectedWidget.type)}只能选择数组子节点!`)
          tree$.value.setChecked(data, false, true)
          return;

        }
      } else {
        if (data?.Param_ObjType !== 'attribute') {
          ElMessage.error('您选择的不是叶节点')
          tree$.value.setChecked(data, false, true)
          return
        }
      }
      props.optionModel.dataTarget['checkedNodes'] = checkedNodes.filter(node => node.Param_ObjType === 'attribute')
      // console.log(props.optionModel.dataTarget['checkedNodes']);
    }

    function nodeExpand(data, val) {
      console.log('nodeExpand_data', data);
      openNodeSet.add(data.Param_ID)
    }

    /**
     * 递归移除关闭节点，如果某节点关闭，则将移除改节点下的子节点
     * @param data
     * @param node
     */
    function nodeCollapse(data, node) {
      const traverse = (node) => {
        const nodes = node.childNodes.filter(item => item.expanded)
        nodes.map(item => {
          openNodeSet.delete(item.key)
          traverse(item)
        })
      }
      traverse(node)
      openNodeSet.delete(data.Param_ID)
    }

    function _isArrayChild(data) {
      const node = tree$.value.store.nodesMap[data.Param_ID]
      return node?.parent?.data.Param_ObjType === 'array' || node?.parent?.parent?.data.Param_ObjType === 'array';
    }

    function onDrawOpen() {

      const val = props.optionModel.dataTarget['procedureValue']
      if(!isEmptyObj(val)) {
        loadTreeData(val)
      }
    }

    function loadTreeData(val) {
      getProcedureParams(val.ProcedureName, "", 1).then((res) => {
        // treeData.value = res.data.Data
        res.Data.map(item => {
          unflatten(res.Data, item)
        })

        treeData.value = [{
          Param_ID: val.ProcedureID,
          Param_Name: val.ProcedureName,
          children: getChildren(res.Data, '0000')
        }]
      })
    }

    return {
      showDataTargetDialog,
      treeProps,
      tree$,
      treeData,
      // procedureValue,
      checkNode,
      nodeExpand,
      nodeCollapse,
      onProcedureSelect,
      onDrawOpen
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  }
}
</script>

<style scoped>

</style>
