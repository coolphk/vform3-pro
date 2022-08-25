<template>
  <div style=" width:20vw;margin:8px 8px 0 8px;display: flex;flex-direction: column;height: 100%">
    <div>
      <el-select
          ref="select$"
          v-model="selectedProcedures"
          multiple
          filterable
          value-key="ProcedureID"
          :teleported="true"
          :fit-input-width="true"
      >
        <el-option v-for="(item,index) in procedureList" :value="item.value" :label="item.label"></el-option>
      </el-select>
    </div>

    <div style="flex:1; margin-top: 8px;" class="el-card">
      <el-tree
          v-loading="treeLoading"
          node-key="Param_ID"
          style="height: 100%;overflow: auto;"
          :indent="8"
          :data="treeData"
          :props="treeProps"
          :default-expanded-keys="dataTarget.expandedKeys"
          @node-expand="onNodeExpand"
      >
        <template #default="{node,data}">
          <draggable :list="[data]" :group="treeDragGroup" item-key="Param_ID">
            <template #item="{element,index}">
              <div :style="{color:data.isBound?'red':'#606266'}">
                {{ element.Param_Name }}{{ element.Param_Des ? `【${element.Param_Des}】` : '' }}
              </div>
            </template>
          </draggable>
        </template>
      </el-tree>
    </div>
  </div>

</template>

<script setup>
import {reactive, ref, watch} from "vue";
import {getProcedureList, getProcedureParams} from "@/api/data-schema";
import {traverseTreeData, unFlatten} from "@/utils/data-adapter";

const props = defineProps({
  dataTarget: Object,
  modelValue: Object
})
const treeLoading = ref(false)
const emits = defineEmits(['update:modelValue'])

const putList = reactive([])
const showLoading = ref(false)
const showProcedureListLoading = ref(true)
//展开的节点
const openNodeSet = reactive(new Set(props?.dataTarget['expandedKeys']))
const select$ = ref()
//树组件引用
const tree$ = ref("")
const treeProps = {
  label: 'Param_Name',
  children: 'children',
}
const treeDragGroup = {
  name: 'itxst',
  put: false,
  pull: 'clone'
}

const treeData = ref([]) //存储过程具体内容树
const originalTreeData = ref([])
//存储过程下拉列表
const procedureList = ref([])
const selectedProcedures = ref(props.dataTarget.selectedProcedures)

watch(openNodeSet, (newVal) => {
  props.dataTarget["expandedKeys"] = Array.from(newVal)
})

watch(selectedProcedures, (newVal, oldVal) => {
  //如果new length> old length代表是添加数据，取出新选择的脚本，然后读取脚本参数,
  //否则是取消选择脚本，则删除掉树里面相应的数据
  if (newVal && oldVal) {
    if (newVal.length > oldVal.length) {
      newVal.map(nv => {
        if (oldVal.findIndex((ov) => nv.ProcedureID === ov.ProcedureID) === -1) {
          loadTreeData(nv)
        }
      })
    } else {
      oldVal.map(ov => {
        if (newVal.findIndex((nv) => nv.ProcedureID === ov.ProcedureID) === -1) {
          treeData.value.splice(treeData.value.findIndex(param => param.Param_ID === ov.ProcedureID), 1)
          originalTreeData.value.splice(originalTreeData.value.findIndex(param => param.Param_ID === ov.ProcedureID), 1)
        }
      })
    }
    props.dataTarget.selectedProcedures = newVal
  }
})


function changeBoundProcedureStyle(param, flag) {
  traverseTreeData(treeData.value, (treeItem) => {
    if (treeItem.Param_Name == param.Param_Name && treeItem.procedureName === param.procedureName) {
      treeItem.isBound = flag
    }
  })
}


function onDragAdd(evt) {
  console.log(putList[evt.newIndex]);
}

function onNodeExpand(data, val) {
  openNodeSet.add(data.Param_ID)
}

function loadProcedureList() {
  getProcedureList().then(res => {
    procedureList.value = res.Data.TableData.map(item => ({
      label: item.ProcedureName,
      value: item
    }))
  })
}

function loadTreeData(val) {
  treeLoading.value = true
  getProcedureParams(val.ProcedureName, "", 1).then((res) => {
    originalTreeData.value.push(res.Data)
    const tree = unFlatten(res.Data, 'Param_ID', {
      procedureId: val.ProcedureID,
      procedureName: val.ProcedureName
    })
    treeData.value.push({
      Param_ID: val.ProcedureID,
      Param_Name: val.ProcedureName,
      children: tree
    })
    emits('update:modelValue', [
      ...props.modelValue,
      {
        procedureId: val.ProcedureID,
        procedureName: val.ProcedureName,
        params: res.Data
      }])
    treeLoading.value = false
  })
}

(function initData() {
  loadProcedureList()
  props.dataTarget.selectedProcedures.map(({ProcedureID, ProcedureName}) => {
    loadTreeData({ProcedureID, ProcedureName})
  })
})()

function removeAllBoundStyle() {
  traverseTreeData(treeData.value, item => {
    item.isBound = false
  })
}


defineExpose({
  changeBoundProcedureStyle,
  removeAllBoundStyle
})

</script>

<style lang="scss">
.bussiness-container {
  .el-input__wrapper {
    width: 300px;
  }

  .pop-class {
    width: 300px;
  }
}
</style>