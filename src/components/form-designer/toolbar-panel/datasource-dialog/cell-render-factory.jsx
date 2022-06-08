import CodeEditor from "@/components/code-editor";
import {getProcedureParams, xmlToJson} from "@/api/data-schema";
import {Delete, Select} from "@element-plus/icons-vue";
import {transferData} from "@/utils/data-adapter";


export const editorRender = (type, procedureInfo) => (row) => {
  const {rowData, column} = row
  const sendXml = () => {
    xmlToJson({
      "ProcedureID": procedureInfo.value.ProcedureID,
      "ProcedureName": procedureInfo.value.ProcedureName,
      "Param_ID": rowData.Param_ID,
      "Param_Name": rowData.Param_Name,
      "pXML": rowData[column['dataKey']]
    }).then(res => {
      // console.log('xmlToJson', res, row);
      if (res.data.Status && res.data.Message === 'XML2JSON成功') {
        console.log(row);
        getProcedureParams(procedureInfo.value.ProcedureName, rowData.Param_ID).then(res => {
          console.log(res);
          rowData.children = res.data.Data.map(item => transferData({parent: rowData, ...item}))
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
    const atParentIndex = row.rowData.parent.children.findIndex(item => item.Param_ID === row.rowData.Param_ID)
    row.rowData.parent.children.splice(atParentIndex, 1)
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