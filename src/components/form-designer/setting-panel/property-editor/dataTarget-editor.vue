<template>

  <el-form-item :label="i18nt('designer.setting.dataTarget')">
    <!--    <el-input type="text" v-model="optionModel.dataTarget" @click="showDataTargetDialog=true"></el-input>-->
    <el-button @click="showDataTargetDialog=true">选择</el-button>
    <div style="max-height: 300px;overflow: auto">
      <el-tag round closable v-for="(tag,index) in selectedData" :key="tag.id">
        {{ tag.name_ }}
      </el-tag>
    </div>

    <el-drawer v-if="showDataTargetDialog" v-model="showDataTargetDialog" title="选择需要匹配的数据" show-close>
      <div style="height: 80vh;overflow: auto">
        <el-tree
            ref="tree$"
            :props="treeProps"
            :load="loadNode"
            lazy
            show-checkbox
            node-key="id"
            @check="checkNode"
            check-on-click-node
            :default-expanded-keys="optionModel.dataTarget.expandedNodes"
            @node-collapse="nodeCollapse"
            @node-expand="nodeExpand"
        >
        </el-tree>
        <!--        :default-checked-keys="['fb2fcba84c2702d9','a2aa0f1b3a443ad9']"-->
      </div>
      <el-button type="primary" size="large">确定</el-button>
    </el-drawer>
  </el-form-item>

</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin"
import {nextTick, reactive, ref, watch} from "vue";
import {getDataListByPid} from "@/api/data-schema";

export default {
  name: "dataTarget-editor",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    let expanded = 0
    const showDataTargetDialog = ref(false)
    const openNodeSet = reactive(new Set(props.optionModel.dataTarget.expandedNodes || []))
    const tree$ = ref("")
    const treeProps = {
      label: 'name_',
      children: 'children',
      isLeaf: 'isLeaf',
    }
    const selectedData = ref("")

    watch(openNodeSet, (newVal) => {
      props.optionModel.dataTarget["expandedNodes"] = Array.from(newVal)
    })
    watch(showDataTargetDialog, () => {
      if (showDataTargetDialog) {
        expanded = 0
      }
    })

    function loadNode(node, resolve) {
      expanded++
      const {checkedNodes, expandedNodes} = props.optionModel.dataTarget
      if (expanded - 1 === expandedNodes.length) {
        nextTick(() => {
          tree$.value.setCheckedKeys(checkedNodes.map(node => node.id))
        })
      }
      if (node.level === 0) {
        resolve(getDataListByPid('00000'))
      } else {
        resolve(getDataListByPid(node.data.id))
      }
    }

    function checkNode(data, {checkedNodes}) {
      selectedData.value = checkedNodes
      props.optionModel.dataTarget['checkedNodes'] = checkedNodes
    }

    function nodeExpand(data) {
      openNodeSet.add(data.id)
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
      openNodeSet.delete(data.id)
    }

    return {
      showDataTargetDialog,
      selectedData,
      treeProps,
      tree$,
      checkNode,
      loadNode,
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

<style scoped>

</style>
