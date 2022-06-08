import CodeEditor from "@/components/code-editor";
import {xmlToJson} from "@/api/data-schema";
import {ref} from "vue";

export const editorRender = (type, procedureInfo) => (row) => {
  const {rowData, column} = row
  const visible = ref(false)
  const sendXml = () => {
    xmlToJson({
      "ProcedureID": procedureInfo.value.ProcedureID,
      "ProcedureName": procedureInfo.value.ProcedureName,
      "Param_ID": rowData.Param_ID,
      "Param_Name": rowData.Param_Name,
      "pXML": rowData[column['dataKey']]
    }).then(res => {
      // console.log('xmlToJson', res, row);
      if (res.data.Message === 'XML2JSON成功') {
        console.log(row);
      }
    })
  }
  const showCodeEditor = () => {
    visible.value = true
  }
  const slots = {
    reference: () => <el-button onClick={showCodeEditor}>编辑</el-button>,
    default: () => visible.value && <div>
      <CodeEditor readonly={false} mode={type}
                  v-model={rowData[column['dataKey']]}/>
      {type === 'xml' && <el-button type={'success'} onClick={sendXml} style={{marginTop: '10px'}}>发送xml</el-button>}
    </div>
  }
  const editXml = () => <el-popover
    key={rowData.Param_ID}
    width={800}
    v-slots={slots}
    trigger={'click'}
    append-to={'body'}/>
  return (
    rowData.Param_isXML === '1' || type === 'text' ? editXml() : <el-input v-model={rowData[column['dataKey']]}/>
  )
}
