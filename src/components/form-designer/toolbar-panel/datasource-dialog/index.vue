<template>
  <div class="datasouce-container" style="">
    <div style="display: flex">
      <datasource-head @onProcedureSelect="onProcedureSelect"/>
      <el-button type="primary" @click="onSendTestData" style="margin-left: 10px">发送测试数据</el-button>
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
            @row-expand="onRowExpanded"
            :append-to-body="true"
        />
      </template>
    </el-auto-resizer>
    <el-button type="primary" @click="showData">Show Data</el-button>
  </div>
</template>

<script setup lang="jsx">

import {getProcedureParams} from "@/api/data-schema"
import {getAllFieldWidgets} from "@/utils/util";
import {ref} from "vue";
import {Delete, Select} from "@element-plus/icons-vue";
import DatasourceHead from "@/components/form-designer/toolbar-panel/datasource-dialog/datasource-head.vue";
import {transferData} from "@/utils/data-adapter";

import {editorRender} from "@/components/form-designer/toolbar-panel/datasource-dialog/cell-render-factory.jsx";

const selectedProcedure = ref()
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
    key: 'Param_isXML',
    dataKey: 'Param_isXML',
    title: 'XML',
    width: 120,
    cellRenderer: ({rowData, column}) => {
      return (
          <el-switch active-value="1" inactive-value="0" v-model={rowData.Param_isXML}></el-switch>
      )
    }
  }, {
    key: 'Param_VALUE',
    dataKey: 'Param_VALUE',
    title: '值',
    width: 150,
    cellRenderer: editorRender('xml', selectedProcedure)
  }, {
    key: 'Param_TestVALUE',
    dataKey: 'Param_TestVALUE',
    title: '测试值',
    width: 150,
    cellRenderer: ({rowData, column}) => {
      return (
          <el-input type="text" v-model={rowData[column.dataKey]}></el-input>
      )
    }
  }, {
    key: '  Param_Des',
    dataKey: '  Param_Des',
    title: '中文名',
    width: 150,
    cellRenderer: ({rowData, column}) => {
      return (
          <el-input type="text" v-model={rowData[column.dataKey]}></el-input>
      )
    }
  }, {
    key: '  Param_BusiDes',
    dataKey: '  Param_BusiDes',
    title: '业务说明',
    width: 200,
    cellRenderer: editorRender('text')
  }, {
    key: 'options',
    title: '操作',
    width: 300,
    cellRenderer: ({rowData, column}) => {
      function onSave(event) {
        console.log(event, rowData);
        // console.log(selectedProcedure);
      }

      return (
          <div style="display:flex">
            <el-tooltip content="保存" placement="top">
              <el-button type="primary" icon={Select} onClick={onSave}></el-button>
            </el-tooltip>

            <el-popconfirm
                title="确定要删除吗?"
                v-slots={{
                  reference: () =>
                      <div style="margin-left:8px">
                        <el-tooltip content="删除" placement="top">
                          <el-button type="danger" icon={Delete}></el-button>
                        </el-tooltip>
                      </div>
                }}/>
          </div>
      )
    }
  }]
const tableData = ref([])
const table$ = ref()

function onProcedureSelect(val) {
  selectedProcedure.value = val
  getProcedureParams(val.ProcedureName).then(res => {
    tableData.value = res.data.Data.map(item => transferData(item))
  })
}

function onRowExpanded(row) {
  if (row.expanded && JSON.stringify(row.rowData.children[0]) === '{}') {
    getProcedureParams(selectedProcedure.value.ProcedureName, row.rowData.Param_ID).then(res => {
      row.rowData.children = res.data.Data.map(item => transferData(item))
    })
  }
}

function onSendTestData() {
  const submitData = []
  console.log('tableData', tableData.value);
  flat(submitData, tableData.value)

  console.log('submitData', submitData);
}

function showData() {

}

function flat(submitData = [], data) {
  data.map(item => {
    submitData.push(item)
    // console.log('item', item);
    if (item.children && JSON.stringify(item?.children[0]) !== '{}') {
      flat(submitData, item.children)
    }
  })
}
</script>

<style lang="scss">
.datasouce-container {
  height: 80vh;
  width: 98vw;

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