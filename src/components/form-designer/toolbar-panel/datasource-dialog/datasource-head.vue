<template>
  <div style="margin-bottom: 20px">
    <el-select filterable v-model="selectedProcedure" @change="onChange" style="width: 400px" value-key="ProcedureID">
      <el-option v-for="(item) in procedureList" :value="item" :label="item.ProcedureName"/>
    </el-select>
  </div>
</template>

<script setup>
import {getProcedureList} from "@/api/data-schema";
import {ref} from "vue";

const emit = defineEmits(['onProcedureSelect'])
const selectedProcedure = ref()

function onChange(val) {
  emit('onProcedureSelect', val)
}

const procedureList = ref()
getProcedureList().then(res => {
  procedureList.value = res.data.Data.TableData
})

</script>

<style scoped>

</style>