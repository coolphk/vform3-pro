<template>
  <div style="margin-bottom: 20px;display:flex;align-items: center;flex-flow: wrap">
    <div>选择存储过程名称：</div>
    <el-select :autofocus="false" filterable v-model="selectedProcedure" @change="onChange" style="width: 400px"
               value-key="ProcedureID">
      <el-option v-for="(item) in procedureList" :value="item" :label="item.ProcedureName"/>
    </el-select>
  </div>
</template>

<script setup>
import {getProcedureList} from "@/api/data-schema.js";
import {ref} from "vue";

const props = defineProps({
  procedureValue: Object
})
const emit = defineEmits(['onProcedureSelect'])

const procedureList = ref()
const selectedProcedure = ref()

function onChange(val) {
  emit('onProcedureSelect', val)
}


getProcedureList().then(res => {
  procedureList.value = res.data.Data.TableData
  selectedProcedure.value = props.procedureValue
})

</script>

<style scoped>

</style>