import {isEmptyObj} from "@/utils/util";

/**
 * 将表单组件按照存储过程分组
 * @param procedureMap
 * @param widget
 * 最终结构
 * {
 *  procedureName:{
 *    procedureId,
 *    widgets
 *  }
 * }
 */
function widgetsGroupByProcedure(procedureMap, widget) {
  if (!isEmptyObj(widget?.options?.dataTarget?.procedureValue)) {
    //获取当前被遍历组件所对应的存储过程信息
    const {
      ProcedureName: procedureName,
      ProcedureID: procedureID
    } = widget.options?.dataTarget?.procedureValue
    if (!procedureMap.has(procedureName)) {
      procedureMap.set(procedureName, {
        id: procedureID,
        widgets: [widget]
      })
    } else {
      const widgets = procedureMap.get(procedureName)?.widgets
      if (Array.isArray(widgets)) {
        widgets.push(widget)
      }
    }
    procedureMap.forEach((value, key) => {
      value.widgets = Array.from(new Set(value.widgets))
    })
  }
}

export default widgetsGroupByProcedure