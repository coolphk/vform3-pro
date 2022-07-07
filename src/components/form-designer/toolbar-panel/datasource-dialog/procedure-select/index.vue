<template>
  <div style="margin-bottom: 20px;display:flex;align-items: center;flex-flow: wrap">
    <div>选择存储过程名称：</div>
    <el-select :autofocus="false" filterable v-model="selectedProcedure" @change="onChange"
               style="width: 400px"
               value-key="ProcedureID">
      <el-option v-for="(item) in procedureList" :value="item" :label="item.ProcedureName"/>
    </el-select>
  </div>
</template>

<script setup>
import {getProcedureList} from "@/api/data-schema.js";
import {ref} from "vue";

const props = defineProps({
  procedureValue: {
    type: Object,
    default: {}
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onProcedureSelect', 'update:modelValue'])

const procedureList = ref()
const selectedProcedure = ref()
const loading = ref(true)

function onChange(val) {
  emits('onProcedureSelect', val)
}


getProcedureList().then(res => {
  procedureList.value = res.Data.TableData
  selectedProcedure.value = props.procedureValue
}).finally(() => {
  emits('update:modelValue', false)
})

</script>

<style scoped>

</style>