import {traverseFieldWidgets} from "@/utils/util";
import {reactive} from "vue";

/**
 * 获取所以可以给脚本参数绑定的组件
 */
function getAllWidgetsForBindScriptParams(widgetList, currentWidget) {
  const paramBindWidgets = reactive([])
  traverseFieldWidgets(widgetList, (widget) => {
    if (widget.type === 'data-table') {
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