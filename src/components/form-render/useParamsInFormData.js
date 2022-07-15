import {ElMessage} from "element-plus";
import {deepClone, uuid2} from "@/utils/util";
import {buildProcedureSchema} from "@/utils/data-adapter";

/**
 * 将edittable数据转换为params格式
 * @param wi 组件
 * @param formData 表单数据
 * @returns {*[]} 执行存储过程时的参数
 */
function transferTableDataToSubmitData(wi, formData) {
  //获取绑定数据结构的列表结构array->item
  const tableData = formData[wi.id]
  const {dataTarget} = wi.options
  const submitDataParams = []
  tableData.map(row => {
    const item = deepClone(dataTarget.arraySchema)
    item.Param_ID = uuid2(16)
    submitDataParams.push(item)
    Object.keys(row).map(key => {
      const rowData = buildProcedureSchema()
      rowData.Param_Name = key
      rowData.Param_VALUE = row[key]
      rowData.Parent_ID = item.Param_ID
      rowData.Param_ObjType = 'attribute'
      submitDataParams.push(rowData)
    })
  })
  return submitDataParams
}

/**
 *
 * @param widgets 组件
 * @param formData 表单数据
 * @param scriptParams 要提交的存储过程参数
 * @returns {*[]}
 */
function judgeParamsInCheckNodes(widgets, formData, scriptParams) {
  let submitDataParams = []
  widgets.forEach(wi => {   //遍历某个存储过程下的组件
    if (wi.formItemFlag) {
      if (wi.type === 'edit-table') {
        submitDataParams = submitDataParams.concat(transferTableDataToSubmitData(wi, formData))
      } else {
        wi.options.dataTarget.checkedNodes.forEach(node => {
          //验证组件dataTarget中的节点是否存在于当前数据结构中，如果存在则应该进行赋值，否则报错
          if (scriptParams.find((data) => data.Param_ID === node.Param_ID)) {
            node.Param_VALUE = formData[wi.id]
            submitDataParams.push(node)
          } else {
            ElMessage({
              message: `参数${node.Param_Name}不存在,请检查数据`,
              type: 'error',
              duration: 3 * 1000,
              showClose: true
            })
            console.error(`参数${node.Param_Name}不存在,请检查数据`, node)
          }
        })
      }
    }
  })
  return submitDataParams
}

export default judgeParamsInCheckNodes