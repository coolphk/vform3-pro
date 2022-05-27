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
            ref="refTree"
            :props="treeProps"
            :load="loadNode"
            lazy
            show-checkbox
            node-key="id"
            @check="checkNode"
            check-on-click-node
            :default-expanded-keys="optionModel.dataTarget.expendedNodes"
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
import {computed, nextTick, reactive, ref, watch} from "vue";
import {getDataListByPid} from "@/api/data-schema";

export default {
  name: "dataTarget-editor",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const showDataTargetDialog = ref(false)
    const openNodeSet = reactive(new Set(props.optionModel.dataTarget.expendedNodes || []))
    const refTree = ref("")
    const treeProps = {
      label: 'name_',
      children: 'children',
      isLeaf: 'isLeaf',
    }
    const selectedData = ref("")

    watch(openNodeSet, (newVal) => {
      props.optionModel.dataTarget["expendedNodes"] = Array.from(newVal)
    })

    function loadNode(node, resolve) {
      if (node.level === 0) {
        resolve(getDataListByPid('00000'))
      } else {
        resolve(getDataListByPid(node.data.id))
        // console.log(loadNum)
      }
    }

    function checkNode(data, {checkedNodes}) {
      // console.log('checkedNodes', checkedNodes);
      selectedData.value = checkedNodes
      props.optionModel.dataTarget['checkedNodes'] = checkedNodes
    }

    function nodeExpand(data) {
      openNodeSet.add(data.id)
    }

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
      refTree,
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
  },
  computed: {
    defaultCheckedKeys() {
      const keys = this.optionModel?.dataTarget?.checkedNodes?.map(item => item.id.toString())
      console.log(222, keys);
      return keys
    }
  }
}
</script>

<style scoped>

</style>
