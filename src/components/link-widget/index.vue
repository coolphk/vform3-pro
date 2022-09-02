<template>
  <!--  <el-select style="width: 180px"
               clearable
               :model-value="row.linkWidgetId"
                 @change="onScriptLinkWidgetChange(row,$index,$event)"
    >-->
  <el-cascader style="width: 180px"
               clearable
               :props="cascaderProps"
               :model-value="row.linkWidgetId"
               :options="fieldWidgetList"
               @change="onScriptLinkWidgetChange"

  />
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import {ScriptParam} from "@/api/types";
import {getAllFieldWidgets, isTable} from "@/utils/util.js";
import LinkWidgetUtils from "@/utils/linkWidgetUtils";
import {getFieldOrWidget} from "@/utils/data-adapter.js";

type Prop = {
  row: ScriptParam,//当前选中的列
  selectedWidget: any, //当前选中的组件
  designer: any
}

const props = defineProps<Prop>()
const cascaderProps = {
  value: 'id',
  label: 'label'
}
const fieldWidgetList = getAllFieldWidgets(props.designer.widgetList)
    .filter((item: any) => item.id != props.selectedWidget.id)
    .map((item: any) => {
      const widget = getFieldOrWidget(item)
      return {
        ...item,
        label: item.label + '-' + item.id,
        children: isTable(widget.type) ? widget.options.tableColumns.map((column: any) => {
          return {
            label: column.label,
            id: column.prop
          }
        }) : []
      }
    })

/**
 * 根据当前组件与所选关联组件的类型设置代码
 * 1、如果有值代表关联组件变更
 * 1.1、删除原关联组件的代码
 * 1.2、判断当前选中组件中是否存在代码，如果存在则进行替换，如果不存在则进行增加
 * 2、如果没有值代表删除关联组件
 * 2.1、删除原关联组件中的代码
 *
 * @param linkWidgetId
 */
function onScriptLinkWidgetChange(linkWidgetId: string[]) {
  const lwUtils = new LinkWidgetUtils({
    designer: props.designer,
    selectedWidget: props.selectedWidget,
    linkWidgetId: linkWidgetId?.[0],
    oldLinkWidgetId: props.row?.linkWidgetId?.[0]
  })
  if (props.row.linkWidgetId?.[0]) {
    lwUtils.deleteOldLWCode()
  }
  if (linkWidgetId?.[0]) {
    lwUtils.addOrUpdateLinkWidgetCode()
  }
  props.row.linkWidgetId = linkWidgetId
}

</script>

<style scoped>

</style>