import CodeEditor from "@/components/code-editor";
import {delProcedureParams, getProcedureParams, xmlToJson} from "@/api/data-schema";
import {Delete, Select} from "@element-plus/icons-vue";
import {transferData} from "@/utils/data-adapter";
import {ref} from "vue";
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
          ElMessage({
            message: 'XML解析成功，已生成子节点.',
            type: 'success',
          })
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

export const operationRender = (selectedProcedure) => (row) => {
  const {rowData, column} = row

  function onSave(event) {
    console.log(event, rowData);
    // console.log(selectedProcedure);
  }

  function onDelete() {
    const parent = rowData.parent
    const children = rowData.children
    delete rowData.parent
    delete rowData.children
    delProcedureParams({
      ProcedureID: selectedProcedure.value.ProcedureID,
      ProcedureName: selectedProcedure.value.ProcedureName,
      ...rowData
    }).then(res => {
      if (res.status === 200 && res?.data?.Status) {
        rowData.parent = parent
        rowData.children = children
        const atParentIndex = rowData.parent.children.findIndex(item => item.Param_ID === rowData.Param_ID)
        rowData.parent.children.splice(atParentIndex, 1)
      }
    })
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
    </div>
  )
}

function mergeSubmitData(info, params) {
  return {
    ProcedureID: info.ProcedureID,
    ProcedureName: info.ProcedureName,
    ...params
  }
}