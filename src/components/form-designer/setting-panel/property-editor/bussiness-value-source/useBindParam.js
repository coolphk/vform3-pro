import {traverseAllWidgets} from "@/utils/util";
import {reactive} from "vue";

/**
 * 获取所以可以给脚本参数绑定的组件
 */
function getAllWidgetsForBindScriptParams(widgetList) {
  const paramBindWidgets = reactive([])
  traverseAllWidgets(widgetList, (widget) => {
    if (widget.formItemFlag || widget.tableFlag) {
      // bindWidgets.push(widget)
      paramBindWidgets.push({
        label: widget.options.label,
        value: widget.id,
        children: widget.tableFlag ? widget.options.tableColumns.map(column => ({
          label: column.label,
          value: column.prop
        })) : []
      })
    }
  })
  return paramBindWidgets
}

export default getAllWidgetsForBindScriptParams