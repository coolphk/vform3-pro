<template>
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
          :default-expanded-keys="props.valueSource['expandedNodes']"
          @node-expand="onNodeExpand"
          @node-collapse="onNodeCollapse"
          @check-change="onCheckChange"

      >
      </el-tree-v2>
    </template>
  </el-auto-resizer>
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
const openNodeSet = reactive(new Set(props.valueSource['expandedNodes']))
const checkedNodes = []
defineExpose({
  tree$
})
getScriptTree().then(res => {
  treeData.value = unFlatten(res.Data, 'ID')
  /*const scriptId = props?.optionModel?.valueSource?.currentNodeKey
  loadScriptsParams(scriptId)*/
  // emits('loadDataFinished',)
})

watch(openNodeSet, (newVal) => {
  props.valueSource["expandedNodes"] = Array.from(newVal)
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
</script>

<style scoped>

</style>