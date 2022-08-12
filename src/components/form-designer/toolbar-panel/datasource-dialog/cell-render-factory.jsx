/*

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
    key: 'Param_Des',
    dataKey: 'Param_Des',
    title: '中文名',
    width: 150,
    cellRenderer: ({rowData, column}) => {
      const onBlur = (e) => {
        updateProcedureParams(mergeSubmitData(selectedProcedure.value, rowData))
      }
      return (
          <el-input type="text" v-model={rowData[column.dataKey]}></el-input>
      )
    }
  }, {
    key: 'Param_BusiDes',
    dataKey: 'Param_BusiDes',
    title: '业务说明',
    width: 200,
    cellRenderer: editorRender('text')
  }, {
    key: 'options',
    title: '操作',
    width: 300,
    cellRenderer: operationRender(selectedProcedure, tableData, expandedKeys)
  }]


import CodeEditor from "@/components/code-editor";
import {delProcedureParams, getProcedureParams, updateProcedureParams, xmlToJson} from "@/api/data-schema";
import {Delete, Plus, Select} from "@element-plus/icons-vue";
import {getChildren, transferData, unFlatten} from "@/utils/data-adapter";
import {ref} from "vue";
import {deepClone, uuid2} from "@/utils/util";
import {ElMessage} from "element-plus";


export const editorRender = (type, procedureInfo) => (row) => {
  const {rowData, column} = row
  const popover$ = ref()
  const sendXml = () => {
    xmlToJson({
      "ProcedureID": procedureInfo.value.ProcedureID,
      "ProcedureName": procedureInfo.value.ProcedureName,
      "Param_ID": rowData.Param_ID,
      "Param_Name": rowData.Param_Name,
      "pXML": rowData[column['dataKey']]
    }).then(res => {
      if (res.data.Status && res.data.Message === 'XML2JSON成功') {
        getProcedureParams(procedureInfo.value.ProcedureName, rowData.Param_ID).then(res => {
          rowData.children = res.data.Data.map(item => transferData({parent: rowData, ...item}))
          popover$.value.hide();
        })
      }
    })
  }

  const slots = {
    reference: () => <div>
      <el-button onClick={() => rowData.editorVisible = true}>编辑</el-button>
    </div>
  }
  const editXml = () => <el-popover
    ref={popover$}
    key={rowData.Param_ID}
    width={800}
    v-slots={slots}
    trigger={'click'}
    onHide={() => {
      rowData.editorVisible = false;
    }}
    append-to={'.datasouce-container'}>
    {
      rowData?.editorVisible &&
      <div>
        {<CodeEditor readonly={false} mode={type}
                     v-model={rowData[column['dataKey']]}/>
        }
        {type === 'xml' &&
          <el-button type={'success'} onClick={sendXml} style={{marginTop: '10px'}}>解析xml</el-button>}
      </div>
    }
  </el-popover>
  return (
    rowData.Param_isXML === '1' || type === 'text' ? editXml() : <el-input v-model={rowData[column['dataKey']]}/>
  )
}
let schema
export const operationRender = (selectedProcedure, tableData, expandedKeys = []) => (row) => {
  const {rowData, column} = row

  function onSave() {
    updateProcedureParams(mergeSubmitData(selectedProcedure.value, rowData))
  }

  function onDelete() {
    const parent = findParentItem(tableData.value, rowData)
    if (parent.children[0].Param_ID === rowData.Param_ID) {
      ElMessage.error('不能删除数组的第一个子元素!')
      return
    }
    delProcedureParams(mergeSubmitData(selectedProcedure.value, rowData)).then(res => {
      deleteRow(parent, rowData)
    })
  }


  async function addChild() {
    if (!schema) {
      // console.log(1);
      const res = (await getProcedureParams(selectedProcedure.value.ProcedureName, rowData.Param_ID, '1'))?.data.Data
      /!*res.forEach(item => {
        unflatten(res, item)
      })*!/
      rowData.children = unFlatten(res, 'Param_ID')
      schema = res
    }

    // console.log(3, schema);
    let copyData = deepClone(schema)
    rowData.children = rowData.children.concat(copyData)
    copyData.forEach(item => {
      traverBuildId(item)
    })

    rowData['children'] = getChildren(rowData.children, rowData.Param_ID)
    expandedKeys.value = [...expandedKeys.value, rowData.Param_ID]

    function traverBuildId(node) {
      if (node.HaveChild === "1") {
        const oldId = node.Param_ID
        node.Param_ID = uuid2(16)
        node['children'] = getChildren(copyData, oldId).map(item => ({
          ...item,
          Param_ID: uuid2(16),
          Parent_ID: node.Param_ID
        }))
      }
    }
  }

  return (
    <div style="display:flex">
      <el-tooltip content="保存" placement="top">
        <el-button type="primary" icon={Select} onClick={onSave}></el-button>
      </el-tooltip>
      {
        rowData.Param_ObjType !== 'param' &&
        <el-popconfirm
          title="确定要删除吗?"
          onConfirm={onDelete}
          v-slots={{
            reference: () =>
              <div style="margin-left:8px">
                <el-tooltip content="删除" placement="top">
                  <el-button type="danger" icon={Delete}></el-button>
                </el-tooltip>
              </div>
          }}/>
      }
      {
        rowData.Param_ObjType === 'array' &&
        <el-tooltip content="增加子节点" placement="top">
          <el-button type="success" onClick={addChild} icon={Plus} style={{marginLeft: '8px'}}></el-button>
        </el-tooltip>
      }
    </div>
  )
}

export function mergeSubmitData(procedureInfo, procedureParams) {
  return {
    ProcedureID: procedureInfo.ProcedureID,
    ProcedureName: procedureInfo.ProcedureName,
    ...procedureParams
  }
}

function findParentItem(tableData, item) {
  let parent = tableData.find(data => data.Param_ID === item.Parent_ID)
  if (!parent) {
    tableData.forEach(data => {
      data.children && (parent = findParentItem(data.children, item))
    })
  }
  return parent
}

function deleteRow(parent, item) {
  const {children} = parent
  if (children.length === 1) {

  } else {
    children.splice(children.findIndex(child => child.Param_ID === item.Param_ID), 1)
  }
}*/
