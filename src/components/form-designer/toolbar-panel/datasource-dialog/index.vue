<template>
  <div class="datasouce-container" style="">
    <datasource-head @onProcedureSelect="onProcedureSelect"/>
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
            row-key="Param_ID"
            header-class="head-cell"
            row-class="row-cell"
            :expand-column-key="expandColumnKey"
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

import {getProcedureParams} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {reactive, ref} from "vue";
import {Close, Plus} from "@element-plus/icons-vue";
import DatasourceHead from "@/components/form-designer/toolbar-panel/datasource-dialog/datasource-head.vue";

let procedureName
const props = defineProps({
  designer: Object
})

const expandColumnKey = 'Param_ID'
const fieldWidgets = getAllFieldWidgets(props.designer.widgetList);
const columns = [
  {
    key: 'Param_ID',
    dataKey: 'Param_ID',
    title: '参数ID',
    width: 300,
    type: 'expanded',
  }, {
    key: 'Param_Name',
    dataKey: 'Param_Name',
    title: '参数名称',
    width: 150,
  }, {
    key: 'Param_ObjType',
    dataKey: 'Param_ObjType',
    title: '数据类型',
    width: 120,
  }, {
    key: 'Param_VALUE',
    dataKey: 'Param_VALUE',
    title: '测试值',
    width: 300,
    cellRenderer: ({rowData, column}) => {
      return (
          <div style="height:200px;overflow: auto">
            {rowData[column.dataKey]}
          </div>
      )
    }
  }, {
    key: 'Param_TestVALUE',
    dataKey: 'Param_TestVALUE',
    title: '测试值',
    width: 300,
    cellRenderer: ({rowData, column}) => {
      return (
          <div>

          </div>
      )
    }
  }, {
    key: 'options',
    title: '操作',
    width: 300,
    cellRenderer: ({rowData, column}) => {
      return (
          <div style="display:flex">
            <el-popover
                placement="top-start"
                title="Title"
                width={200}
                trigger="hover"
                v-slots={{reference: () => <el-button type="primary" icon={Plus} circle/>}}
            >
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div>
                  <el-button>添加同级节点</el-button>
                </div>
                <div>
                  <el-button>添加子级节点</el-button>
                </div>
              </div>
            </el-popover>
            <el-button type="danger" icon={Close} circle/>
          </div>
      )
    }
  }]
const tableData = ref([])

function onProcedureSelect(val) {
  procedureName = val.ProcedureName
  getProcedureParams(val.ProcedureName).then(res => {
    tableData.value = res.data.Data.map(item => transferData(item))
  })
}

function onRowExpanded(row) {
  if (row.expanded && JSON.stringify(row.rowData.children[0]) === '{}') {
    getProcedureParams(procedureName, row.rowData.Param_ID).then(res => {
      row.rowData.children = res.data.Data.map(item => transferData(item))
    })
  }
}

function transferData(object) {
  return {
    ...object,
    children: object.HaveChild === '1' ? [{}] : undefined
  }
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
    border: var(--el-table-border);

    .el-table-v2__header-cell {
      background-color: #f5f7fa !important;
      border-right: var(--el-table-border);
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