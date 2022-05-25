<template>
  <el-form-item :label="i18nt('designer.setting.dataTarget')">
        <el-input  type="text" v-model="optionModel.dataTarget" @click="showDataTargetDialog=true"></el-input>

    <el-drawer v-if="showDataTargetDialog" v-model="showDataTargetDialog" title="选择需要匹配的数据" show-close
               style="width: 30vw">
      <div style="height: 80vh;overflow: auto">
        <el-tree :props="treeProps"
                 :load="loadNode"
                 lazy node-key="id"
                 @check="checkNode"
                 check-on-click-node
                 show-checkbox>
        </el-tree>
      </div>
      <el-button type="primary" size="large">确定</el-button>
    </el-drawer>
  </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin"
import {ref} from "vue";
import {getDataListByPid} from "@/api/data-schema";

export default {
  name: "dataTarget-editor",
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const options = ref("")
    const showDataTargetDialog = ref(false)
    const treeProps = {
      label: 'name_',
      children: 'children',
      isLeaf: 'isLeaf',
    }


    function loadNode(node, resolve) {
      if (node.level == 0) {
        resolve(getDataListByPid('00000'))
      } else {
        resolve(getDataListByPid(node.data.id))
      }
    }

    function checkNode(data, {checkedNodes, checkedKeys}) {
      // console.log('checkedKeys', checkedKeys.join(','));
      props.optionModel.dataTarget = checkedKeys.join(',')
      console.log(checkedNodes);
      // options.value =
    }

    return {
      showDataTargetDialog,
      checkNode,
      treeProps,
      loadNode
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
}
</script>

<style scoped>

</style>
