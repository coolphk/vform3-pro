<template>
  <div class="datasouce-container">
    <!--  <code-editor mode="json" :readonly="false" v-model="dataSource"></code-editor>-->
    <!--    <el-table
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
          <el-table-column prop="" width="120" label="数据类型">
            <template #default="scope">
              <el-select v-model="scope.row.dataType">
                <el-option v-for="(item,index) in dataTypes" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="testValue" width="120" label="测试值">
          </el-table-column>
        </el-table>-->
    <el-auto-resizer>
      <template #default="{ height, width }">
        <!--        {{ height }}{{ width }}-->
        <el-table-v2 :expand-column-key="expandColumnKey" :columns="columns" :data="tableData" :width="width"
                     :height="height"></el-table-v2>
      </template>
    </el-auto-resizer>
    <el-button @click="showData">控制台显示数据</el-button>
  </div>
</template>

<script setup>

import {getDataListByPid} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {ref} from "vue";

const props = defineProps({
  designer: Object
})
const expandColumnKey = '2'
const fieldWidgets = getAllFieldWidgets(props.designer.widgetList);

// const tableData = getDataListByPid('00000')
const tableData = [{
  "id": "20be53633bc80ad9",
  "name_": "Root",
  "type_": "object",
  "value_": null,
  "pid": "00000",
  "children": [{
    "id": "eb742557b032d799",
    "name_": "VAM1",
    "type_": "object",
    "value_": null,
    "pid": "20be53633bc80ad9"
  }]
}]
const columns = [{
  key: '1',
  dataKey: 'id',
  title: 'ID',
  width: 300,
  parentKey: 'pid'
}, {
  key: '2',
  dataKey: 'name_',
  title: '字段名',
  width: 300,
  parentKey: 'pid'
}, {
  key: '3',
  dataKey: 'type_',
  title: '数据类型',
  width: 120,
  parentKey: 'pid'
}, {
  key: '4',
  dataKey: 'pid',
  title: '父级ID',
  width: 120
}]
// Reflect.ownKeys(tableData[0]).map((key)=>{
//   columns.push({
//     key,
//     dataKey:key,
//     title:'字段名'
//   })
// })
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
  height: 70vh;
  width: 98vw;

  .head-cell {
    background: #f5f7fa !important;
    color: #101F1C;
    font-size: large;
    font-weight: bold;
  }
}
</style>