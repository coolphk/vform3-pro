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
      <el-table-column prop="cname" width="200" label="中文名">
        <template #default="scope">
          <el-input v-if="scope.row.isEditing" v-model="scope.row.cname" type="text"></el-input>
          <div v-else>{{ scope.row.cname }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="value" width="400" label="值">
        <template #default="scope">
          <el-input v-if="scope.row.isEditing" v-model="scope.row.value_" type="textarea" clearable></el-input>
          <div v-else>{{ scope.row.value_ }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="require" width="120" label="是否必填">
        <template #default="scope">
          <el-switch
              :disabled="!scope.row.isEditing"
              size="large"
              v-model="scope.row.require"
              inline-prompt
              active-text="是"
              inactive-text="否"
          />
        </template>
      </el-table-column>
      <el-table-column prop="type_" width="120" label="数据类型">
        <template #default="scope">
          <el-select v-model="scope.row.type_" v-if="scope.row.isEditing">
            <el-option v-for="(item,index) in dataTypes" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button v-if="!scope.row.isEditing" type="primary" :icon="Edit" @click="scope.row.isEditing=true" circle/>
          <el-button v-else type="warning" :icon="Check" @click="scope.row.isEditing=false" circle/>
          <el-button type="success" :icon="Plus" circle/>
          <el-button type="danger" :icon="Delete" circle/>
        </template>
      </el-table-column>
    </el-table>
    <el-button @click="showData">控制台显示数据</el-button>
  </div>
</template>

<script setup>

import {getDataListByPid} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {
  Check,
  Delete,
  Edit,
  Plus,
} from '@element-plus/icons-vue'
import {ref} from "vue";

const props = defineProps({
  designer: Object
})
const dataTypes = [
  {
    label: "Object",
    value: "object"
  }, {
    label: "Array",
    value: "array"
  },
  {
    label: "Arrtibute",
    value: "arrtibute"
  }
]
const fieldWidgets = getAllFieldWidgets(props.designer.widgetList);
const tableData = getDataListByPid('00000')

function loadData(row, node, resolve) {
  resolve(getDataListByPid(row.id))
}

function showData() {
  console.log(tableData);
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