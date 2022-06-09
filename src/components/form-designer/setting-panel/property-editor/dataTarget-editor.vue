<template>

  <el-form-item :label="i18nt('designer.setting.dataTarget')">
    <el-button @click="showDataTargetDialog=true">选择</el-button>
    <el-drawer v-model="showDataTargetDialog" title="选择需要匹配的数据" show-close>
      <div style="height: 80vh;overflow: auto">
        <procedure-select v-if="showDataTargetDialog" @onProcedureSelect="onProcedureSelect"
                         :procedureValue="optionModel.dataTarget['procedureValue']"/>
        <el-tree
            ref="tree$"
            :props="treeProps"
            :data="treeData"
            show-checkbox
            node-key="Param_ID"
            @check="checkNode"
            check-on-click-node
            @node-collapse="nodeCollapse"
            @node-expand="nodeExpand"
            :default-expanded-keys="optionModel.dataTarget['expandedNodes']"
            :default-checked-keys="optionModel.dataTarget['checkedKeys']"
        >
        </el-tree>
      </div>
      <el-button type="primary" size="large">确定</el-button>
    </el-drawer>
  </el-form-item>

</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin"
import {computed, nextTick, reactive, ref, watch} from "vue";
import {getProcedureParams} from "@/api/data-schema";
import ProcedureSelect from "@/components/form-designer/toolbar-panel/datasource-dialog/procedure-select";
import {transferData} from "@/utils/data-adapter";


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
    console.log('props.optionModel.dataTarget', props.optionModel.dataTarget);
    //目标源数据
    const treeData = computed({
      get: () => {
        return props.optionModel.dataTarget['treeData']
      },
      set: (val) => {
        props.optionModel.dataTarget['treeData'] = val
      }
    })
    watch(openNodeSet, (newVal) => {
      props.optionModel.dataTarget["expandedNodes"] = Array.from(newVal)
    })

    // 选择存储过程，通过过程名称加载存储过程参数，并设置树形组件默认展开根节点
    function onProcedureSelect(val) {
      const root = {Param_ID: val.ProcedureID, Param_Name: val.ProcedureName, isRoot: true, children: []}
      //切换存储过程时清空展开的节点
      openNodeSet.clear()
      props.optionModel.dataTarget['procedureValue'] = val
      //选择存储过程后，动态加载树形数据
      getProcedureParams(val.ProcedureName).then(res => {
        root.children = res.data.Data.map(item => transferData(item))
        treeData.value = [root]
        //加载数据完成后，默认展开树形第一层节点
        nextTick(() => {
          tree$.value.store.setDefaultExpandedKeys([val.ProcedureID + ""]);
        })
      })
    }

    function checkNode(data, {checkedKeys}) {
      props.optionModel.dataTarget['checkedKeys'] = checkedKeys
    }

    function nodeExpand(data, val) {
      openNodeSet.add(data.Param_ID)
      if (!data.isRoot && JSON.stringify(data.children[0]) === '{}') {
        getProcedureParams(treeData.value[0].Param_Name, data.Param_ID).then(res => {
          data.children = res.data.Data.map(item => transferData(item))
        })
      }
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

    return {
      showDataTargetDialog,
      treeProps,
      tree$,
      treeData,
      // procedureValue,
      checkNode,
      nodeExpand,
      nodeCollapse,
      onProcedureSelect
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
