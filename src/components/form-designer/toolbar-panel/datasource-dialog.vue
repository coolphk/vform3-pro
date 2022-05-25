<template>
  <div class="datasouce-container">
    <!--  <code-editor mode="json" :readonly="false" v-model="dataSource"></code-editor>-->
    <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        border
        stripe
        lazy
        header-cell-class-name="head-cell"
        height="80vh"
        :load="loadData"
    >
      <el-table-column type="index" width="120" label="序列"/>
      <el-table-column prop="id" width="300" label="ID"/>
      <el-table-column prop="name_" width="200" label="字段名"/>
      <el-table-column prop="value" width="200" label="值"/>
      <el-table-column prop="require" width="120" label="是否必填">
        <template #default="scope">
          <el-switch v-model="scope.row.require">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="level" width="120" label="层级"/>
      <el-table-column prop="path" width="200" label="路径"/>

      <!--    <el-table-column prop="component" label="绑定组件">
            <template #default="scope">
              <div>
                <el-select v-if="scope.row.label.startsWith('@')" v-model="bindComponent">
                  <el-option v-for="(field,index) in fieldWidgets" :key="field.name" :label="field.name" :value="field.name"/>
                </el-select>
              </div>
            </template>
          </el-table-column>-->
    </el-table>
    <el-button @click="showData">控制台显示数据</el-button>
  </div>
</template>

<script setup>
// import {transformDataToELTSchema} from "@/utils/data-adapter";
import {getDataListByPid} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {ref} from "vue";

const props = defineProps({
  designer: Object
})
const fieldWidgets = getAllFieldWidgets(props.designer.widgetList);

const tableData = getDataListByPid('00000')
// console.log(111,tableData);
const bindComponent = ref("")

function loadData(row, node, resolve) {
  resolve(getDataListByPid(row.id))
}

function showData() {

}
</script>

<style lang="scss">
.datasouce-container {
  .head-cell {
    background: #f5f7fa !important;
    color: #101F1C;
    font-size: large;
    font-weight: bold;
  }
}
</style>