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
import {getAllFieldWidgets} from "@/utils/util.js";
import {getWidgetEventByType} from "@/utils/data-adapter.js";

type Prop = {
  row: ScriptParam,//当前选中的列
  selectedWidget: any, //当前选中的组件
  designer: any
}
type Template = {
  LWType: string,
  CWType: string,
  codeTemplate: string | undefined
  regTemplate: RegExp | undefined
}
const props = defineProps<Prop>()
const cascaderProps = {
  value: 'id',
  label: 'label'
}
const fieldWidgetList = getAllFieldWidgets(props.designer.widgetList)
    .filter((item: any) => item.id != props.selectedWidget.id)

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
  if (linkWidgetId?.[0]) {
    deleteOldLWCode()
    addOrUpdateLinkWidgetCode(linkWidgetId[0])
  } else {
    deleteOldLWCode()
  }
  props.row.linkWidgetId = linkWidgetId
}

/**
 * 添加或更新新选择的关联组件代码
 * @param linkWidgetId
 */
function addOrUpdateLinkWidgetCode(linkWidgetId: string) {
  //获取当前选中的关联组件
  const linkWidget = getLinkWidgetHandleWidget(linkWidgetId)
  //根据当前组件与当前关联组件获取匹配正则与代码模板
  const res = getCodeTemplateWithLWTypeAndCWType(linkWidget.type, props.selectedWidget.type)
  //当前关联组件的事件代码
  const linkWidgetCode = linkWidget.options[getWidgetEventByType(linkWidget.type)]

  //当前关联组件代码是否包含
  const matched = linkWidgetCode.match(res.regTemplate)
  if (matched) {
    linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetCode.replace(res.regTemplate, res.codeTemplate)
  } else {
    linkWidget.options[getWidgetEventByType(linkWidget.type)] += res.codeTemplate
  }
}

/**
 * 删除旧有关联组件的代码
 */
function deleteOldLWCode() {
  if (props.row.linkWidgetId?.[0]) {
    //获取旧组件的事件代码
    const originalLW = getLinkWidgetHandleWidget(props.row.linkWidgetId[0])
    const oldCode = originalLW.options[getWidgetEventByType(originalLW.type)]
    const oldRes = getCodeTemplateWithLWTypeAndCWType(originalLW.type, props.selectedWidget.type)
    const oldMatched = oldCode.match(oldRes.regTemplate)
    if (oldMatched) {
      originalLW.options[getWidgetEventByType(originalLW.type)] = oldCode.replace(oldRes.regTemplate, "")
    }
  }
}

/**
 * 根据法关联组件与当前选中组件获取需要设置的代码
 * (codeTemplate含义)当关联组件事件被触发时，用关联组件的值替换当前选中组件的scriptParams中对应的参数。
 * 然后调用当前选中组件的读取业务数据方法(loadBussiness)
 * @param LWType
 * @param CWType
 */
function getCodeTemplateWithLWTypeAndCWType(LWType: string, CWType: string): Pick<Template, 'codeTemplate' | 'regTemplate'> {
  const codeTemplates = [{
    LWType: 'select',
    CWType: 'select',
    codeTemplate: `const selected = this.getWidgetRef("${props.selectedWidget.id}");\n` +
        `selected.${getSelectedWidgetTriggerFunction(props.selectedWidget.type)}();\n`,
    regTemplate: new RegExp(`const.*${props.selectedWidget.id}.*\\nselected.initOptionItems\\(\\)\\n*;`)

  }, {
    LWType: 'data-table',
    CWType: 'data-wrapper',
    codeTemplate: `const selected = this.getWidgetRef("${props.selectedWidget.id}");\n` +
        `const foundParam = selected.field.options.${getScriptParamsStrByType(props.selectedWidget.type)}.find(item => item.linkWidgetId === this.field.id);\n` +
        `foundParam.Param_TestVALUE = value[this.field.options.valueKey];\n` +
        `selected.${getSelectedWidgetTriggerFunction(props.selectedWidget.type)}();\n` +
        `linkWidget.setValue("");\n`,
    regTemplate: new RegExp('')
  }]
  const foundItem = codeTemplates.find((item) => item.LWType === LWType && item.CWType === CWType)
  return {
    codeTemplate: foundItem?.codeTemplate,
    regTemplate: foundItem?.regTemplate
  }
}

function getScriptParamsStrByType(type: string) {
  let codeStr
  switch (type) {
    case 'data-wrapper': {
      codeStr = 'valueSource[row.scriptId].scriptParams'
      break
    }
    case 'select' : {
      codeStr = 'bussinessSource.scriptParams'
      break
    }
  }
  return codeStr
}

/**
 * 获取关联ID组件
 * @param id
 */
function getLinkWidget(id: string) {
  return props.designer.formWidget.getWidgetRef(id, true).field
}

/**
 * 获取当前组件被调用的方法(关联组件事件执行时，回调当前组件的方法)
 */
function getSelectedWidgetTriggerFunction(type: string) {
  let strFunction = ""
  switch (props.selectedWidget.type) {
    case 'select':
      strFunction = 'initOptionItems'
      break
    case 'data-table':
    case 'tree-view':
      strFunction = "loadDataFromBussiness"
      break
    case 'edit-table':
      break
  }
  return strFunction
}

/**
 * 获取关联组件调用loadBussiness方法的组件，表格为按钮，其他组件为关联组件
 */
function getLinkWidgetHandleWidget(linkWidgetId: string) {
  let handleWidget
  switch (props.selectedWidget.type) {
    case 'data-table':
    case 'tree-view':
      handleWidget = getLinkWidget(props.selectedWidget.refreshWidget)
      break
    default:
      handleWidget = getLinkWidget(linkWidgetId)
  }
  return handleWidget;
}

/**
 * 获取关联组件的调用方法
 */
function getLinkWidgetHandleFunction(linkWidgetType: string) {
  return getWidgetEventByType(linkWidgetType)
}


// const compLinkWidgets =
</script>

<style scoped>

</style>