import CodeEditor from "@/components/code-editor";
import {reactive, ref} from "vue";

export const editorRender = function ({rowData, column}) {
  /*const input = ref('')
  const slots = {
    reference: () => <el-button>编辑</el-button>,
    // default: () => <CodeEditor readonly={false} mode="xml" v-model={rowData[column['dataKey']]}></CodeEditor>
    default: () => <el-input type="textarea" v-model={input.value}></el-input>
  }
  const editXml = () => <el-popover width={800} trigger="click" v-slots={slots}></el-popover>*/
  let showEditorDialog = ref(false)
  const input = ref('')
  const onEditButtonClick = () => {
    showEditorDialog.value = true
    console.log(111, showEditorDialog);
  }
  const slots = {
    default: () => <el-input v-model={input.value}></el-input>
  };
  const editXml = () => <div>
    <el-button onClick={onEditButtonClick}>编辑</el-button>
    <el-dialog v-model={showEditorDialog} v-slots={slots}/>
  </div>
  return (
    rowData.Param_isXML === '1' ? editXml() : <div>sss</div>
  )
}
