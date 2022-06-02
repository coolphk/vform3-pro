<template>
  <div class="datasouce-container">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2 :expand-column-key="expandColumnKey"
                     :columns="columns"
                     :data="tableData"
                     :width="width"
                     :height="height"
                     @row-expand="onRowExpanded"
        />
      </template>
    </el-auto-resizer>
    <el-button type="primary" @click="showData">Show Data</el-button>
  </div>
</template>

<script setup lang="jsx">

import {getDataListByPid} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {reactive, ref} from "vue";

const props = defineProps({
  designer: Object
})
const expandColumnKey = 'id'
const fieldWidgets = getAllFieldWidgets(props.designer.widgetList);

// const tableData = getDataListByPid('00000')
const tableData = reactive([{
  "id": "20be53633bc80ad9",
  "name_": "Root",
  "type_": "object",
  "value_": null,
  "pid": "00000",
  "children": ['']
}])
const columns = [{
  key: 'no',
  width: 50,
  title: '序号',
  cellRenderer: ({rowIndex}) => `${rowIndex + 1}`
}, {
  key: 'id',
  dataKey: 'id',
  title: 'ID',
  width: 300,
  type: 'expanded'
}, {
  key: 'name_',
  dataKey: 'name_',
  title: '字段名',
  width: 150,
}, {
  key: 'type_',
  dataKey: 'type_',
  title: '数据类型',
  width: 120,
}, {
  key: 'value_',
  dataKey: 'value_',
  title: '值',
  width: 300,
  cellRenderer: ({rowData, column}) => {
    return (
        <div>
          <el-input v-model={rowData.value_}></el-input>
        </div>
    )
  }
}]

function onRowExpanded(row) {
  row.rowData.children = getDataListByPid(row.rowKey)
}

function showData() {
  console.log(111, tableData);
}

</script>

<style lang="scss">
.datasouce-container {
  height: 80vh;
  width: 98vw;

  .head-cell {
    background: #f5f7fa !important;
    color: #101F1C;
    font-size: large;
    font-weight: bold;
  }
}
</style>