<template>
  <div style="width: 20vw;height: 100%">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-tree-v2
            ref="tree$"
            node-key="ID"
            show-checkbox
            :height="height"
            :highlight-current="true"
            :indent="8"
            :props="{label:'NAME',children:'children',value:'ID'}"
            :data="treeData"
            :default-expanded-keys="props.valueSource['expandedKeys']"
            :default-checked-keys="props.valueSource['checkedNodes'].map(node=>node.ID)"
            @node-expand="onNodeExpand"
            @node-collapse="onNodeCollapse"
            @check-change="onCheckChange"
            @check="onCheck"

        >
        </el-tree-v2>
      </template>
    </el-auto-resizer>
  </div>
</template>

<script setup>
import {ref, watch, reactive} from "vue";
import {getScriptTree} from "@/api/bussiness-source";
import {unFlatten} from "@/utils/data-adapter";

const props = defineProps({
  valueSource: Object
})
const emits = defineEmits(['loadDataFinished', 'removePartialBussinessData'])

const tree$ = ref()
const treeData = ref([])   //数据源treeData
const openNodeSet = reactive(new Set(props.valueSource['expandedKeys']))
const checkedNodes = []
defineExpose({
  tree$
})
getScriptTree().then(res => {
  treeData.value = unFlatten(res.Data, 'ID')
  /*const scriptId = props?.optionModel?.valueSource?.currentNodeKey
  loadScriptsParams(scriptId)*/
  props.valueSource.checkedNodes.map(node => {
    if (node.type === 'Scripts') {
      emits('loadDataFinished', node)
    }
  })

})

watch(openNodeSet, (newVal) => {
  props.valueSource["expandedKeys"] = Array.from(newVal)
})

function onNodeExpand(data) {
  openNodeSet.add(data.ID)
}

function onNodeCollapse(data) {
  openNodeSet.delete(data.ID)
}

function onCheckChange(data, checked) {
  if (checked) {
    emits('loadDataFinished', data)
  } else {
    emits('removePartialBussinessData', data)
  }
}

function onCheck(data, {checkedNodes}) {
  props.valueSource.checkedNodes = checkedNodes
}
</script>

<style scoped>

</style>