<template>
  <div class="datasouce-container" @contextmenu.prevent="onContextMenu">
    <div style="display: flex">
      <procedure-select @onProcedureSelect="onProcedureSelect"/>
      <el-button type="primary" @click="onSendTestData" style="margin-left: 10px">提交测试数据</el-button>
    </div>
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
            ref="table$"
            row-key="Param_ID"
            header-class="head-cell"
            row-class="row-cell"
            :expand-column-key="expandColumnKey"
            :columns="columns"
            :data="tableData"
            :width="width"
            :height="height"
            v-model:expanded-row-keys="expandedKeys"
            @row-expand="onRowExpanded"
            :append-to-body="true"
        />
      </template>
    </el-auto-resizer>
    <!--    <datasource-contextmenu :menu-state="menuState"></datasource-contextmenu>-->
    <el-button type="primary" @click="showData">Show Data</el-button>
  </div>
</template>

<script setup lang="jsx">

import {execProcedure, getProcedureParams} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {reactive, ref} from "vue";
import ProcedureSelect from './procedure-select/index.vue'
import {transferData} from "@/utils/data-adapter";

const menuState = reactive({show: false})
const selectedProcedure = ref()
const props = defineProps({
  designer: Object
})
const expandColumnKey = 'Param_ID'
const fieldWidgets = getAllFieldWidgets(props.designer.widgetList);
const tableData = ref([])
const table$ = ref()
const expandedKeys = ref([])

function onProcedureSelect(val) {
  selectedProcedure.value = val
  getProcedureParams(val.ProcedureName).then(res => {
    tableData.value = res.Data.map(item => transferData(item))
  })
}

function onRowExpanded(row) {
  if (row.expanded && Object.keys(row.rowData.children[0]).length === 0) {
    getProcedureParams(selectedProcedure.value.ProcedureName, row.rowData.Param_ID).then(res => {
      row.rowData.children = res.Data.map(item => transferData(item))
    })
  }
}

function onContextMenu(e) {
  menuState.x = e.pageX
  menuState.y = e.pageY
  menuState.show = !menuState.show
}

async function onSendTestData() {
  const submitData = []
  flatten(submitData, tableData.value)
  const data = {
    procedureID: selectedProcedure.value.ProcedureID,
    procedureName: selectedProcedure.value.ProcedureName,
    params: submitData
  }
  await execProcedure(data)
}

function showData() {
  console.log(tableData.value);
}

function flatten(submitData = [], data) {
  data.map(item => {
    submitData.push(item)
    if (item.children && Object.keys(item?.children[0]).length > 0) {
      flatten(submitData, item.children)
    }
  })
}
</script>

<style lang="scss">
.datasouce-container {
  height: 80vh;
  width: 98vw;
  position: absolute;

  .head-cell {
    background: #f5f7fa !important;

    border: var(--el-table-border);

    .el-table-v2__header-cell {
      background-color: #f5f7fa !important;
      border-right: var(--el-table-border);
    }

    .el-table-v2__header-cell-text {
      color: #101F1C;
      font-size: large;
      font-weight: bold;
    }
  }

  .row-cell {
    border-left: var(--el-table-border);
    border-right: var(--el-table-border);

    .el-table-v2__row-cell {
      border-right: var(--el-table-border);
    }
  }
}
</style>