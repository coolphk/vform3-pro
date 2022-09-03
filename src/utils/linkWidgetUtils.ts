import {getFieldOrWidget, getWidgetEventByType, isArray, isObj, traverseObj} from "@/utils/data-adapter.js";
import {BindMapScriptParam, BindMapScriptParams, BindMapValue} from "@/extension/data-wrapper/data-wrapper-schema";
import {ScriptParam} from "@/api/types";
import {traverseAllWidgets} from "@/utils/util.js";

type Template = {
  codeTemplate: string | undefined
  regTemplate: RegExp | null
}
type ConstructorType = {
  designer: any,
  selectedWidget: any,
  linkWidgetId?: string,
  oldLinkWidgetId?: string
}
export default class LinkWidgetUtils {
  private designer: any;
  private selectedWidget: any;
  private oldLinkWidget: any;
  private linkWidget: any;

  constructor({designer, selectedWidget, linkWidgetId, oldLinkWidgetId}: ConstructorType) {
    this.designer = designer
    this.selectedWidget = selectedWidget
    linkWidgetId && (this.linkWidget = this.getLinkWidget(linkWidgetId))
    oldLinkWidgetId && (this.oldLinkWidget = this.getLinkWidget(oldLinkWidgetId))
  }

  /**
   * 删除旧有关联组件的代码
   */
  deleteOldLWCode() {
    //获取旧组件的事件代码
    const originalLW = this.oldLinkWidget
    // debugger
    if (originalLW) {
      const oldCode = originalLW.options[getWidgetEventByType(originalLW.type)]
      const oldRes = this.getCodeTemplateWithLWTypeAndCWType(originalLW.type, this.selectedWidget.type)
      const oldMatched = oldCode?.match(oldRes.regTemplate)
      if (oldMatched) {
        originalLW.options[getWidgetEventByType(originalLW.type)] = oldCode.replace(oldRes.regTemplate, "")
      }
    }
  }

  /**
   * 添加或更新新选择的关联组件代码
   */
  addOrUpdateLinkWidgetCode() {
    //获取当前选中的关联组件
    const linkWidget = this.linkWidget
    /*if (isTable(this.selectedWidget.type) && !isTable(linkWidget.type)) {
      return
    }*/
    if (linkWidget) {
      //根据当前组件与当前关联组件获取匹配正则与代码模板
      const res = this.getCodeTemplateWithLWTypeAndCWType(linkWidget.type, this.selectedWidget.type)

      //当前关联组件的事件代码
      const linkWidgetCode = linkWidget.options[getWidgetEventByType(linkWidget.type)] ?? ""
      //当前关联组件代码是否包含
      const matched = linkWidgetCode?.match(res.regTemplate)
      if (matched) {
        linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetCode.replace(res.regTemplate, res.codeTemplate)
      } else {
        linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetCode + res.codeTemplate
      }
    }
  }


  private getLinkWidget(id: string) {
    return this.designer.formWidget.getWidgetRef(id, false)?.field ?? this.designer.formWidget.getWidgetRef(id, false)?.widget
  }

  /**
   * 根据法关联组件与当前选中组件获取需要触发的函数
   * (codeTemplate含义)当关联组件事件被触发时，用关联组件的值替换当前选中组件的scriptParams中对应的参数。
   * 然后调用当前选中组件的读取业务数据方法(loadBussiness)
   * @param LWType 关联组件
   * @param CWType 当前选中组件
   */
  private getCodeTemplateWithLWTypeAndCWType(LWType: string, CWType: string): Template {
    let selectedWidgetFunctionStr = this.getSelectedWidgetTriggerFunction(this.selectedWidget.type)
    const res: Template = {
      codeTemplate: '',
      regTemplate: null
    }
    //如果关联组件是按钮，并且当前组件是data-wrapper证明是保存
    if (LWType === 'button' && CWType === 'data-wrapper') {
      selectedWidgetFunctionStr = 'saveDataWrapper'
    }
    res.codeTemplate = `const triggerWidget = this.getWidgetRef("${this.selectedWidget.id}");\n` +
      `triggerWidget.${selectedWidgetFunctionStr}();\n`
    res.regTemplate = new RegExp(`const.*${this.selectedWidget.id}.*\\ntriggerWidget.${selectedWidgetFunctionStr}\\(\\);\\n*`)
    return res
  }

  /**
   * 获取当前组件被调用的方法(关联组件事件执行时，回调当前组件的方法)
   */
  private getSelectedWidgetTriggerFunction(type: string) {
    // debugger
    let strFunction = ""
    switch (type) {
      case 'select':
        strFunction = 'initOptionItems'
        break
      case 'data-table':
      case 'tree-view':
      case 'data-wrapper':
        strFunction = "loadDataFromBussiness"
        break
      case 'edit-table':
        break
    }
    return strFunction
  }
}

/**
 * 用关联组件的值替换scriptParam的TestVALUE
 * @param scriptParams
 * @param getWidgetRef
 * @param callback
 */
// export function setLinkWidgetValueToScriptParams(bussinessSource: VFormBussinessSource, getWidgetRef: Function) {
export function setLinkWidgetValueToScriptParams(scriptParams: ScriptParam[] | BindMapScriptParams, getWidgetRef: Function, callback: Function = setValueTotParam) {
  if (isArray(scriptParams)) {
    scriptParams = scriptParams as ScriptParam[];
    scriptParams.map((param: ScriptParam) => {
      callback(param, getWidgetRef)
    })
  } else if (isObj(scriptParams)) {
    scriptParams = scriptParams as BindMapScriptParams
    traverseObj(scriptParams, (paramKey: string, param: BindMapScriptParam) => {
      callback(param, getWidgetRef)
    })
  }
}

/**
 * 把linkWidget的值取出设置到scriptParams中
 * @param param
 * @param getWidgetRef
 */
export function setValueTotParam(param: BindMapScriptParam | ScriptParam, getWidgetRef: Function) {
  if (param?.linkWidgetId && param.linkWidgetId.length > 0) {
    const linkWidgetRef = getWidgetRef(param.linkWidgetId?.[0])
    const linkWidget = getFieldOrWidget(linkWidgetRef)
    if (linkWidget) {
      if (param.hasOwnProperty('defaultValue')) {
        (<BindMapScriptParam>param).defaultValue = getWidgetValue(linkWidgetRef, param.linkWidgetId?.[1])
      } else {
        (<ScriptParam>param).Param_TestVALUE = getWidgetValue(linkWidgetRef, param.linkWidgetId?.[1])
      }
    }
  }
}

/**
 * 获取组件值，如果是对象并且绑定valueKey获取 obj[valueKey]
 * @param linkWidgetRef
 * @param paramLinkId1
 */
function getWidgetValue(linkWidgetRef: any, paramLinkId1: string) {
  const value = linkWidgetRef?.getValue()
  const linkWidget = getFieldOrWidget(linkWidgetRef)
  if (isObj(value)) {
    if (linkWidget?.options.valueKey) { //如果有valueKey，代表是下拉等
      return value?.[linkWidget.options.valueKey]
    } else if (paramLinkId1) { //代表是表格
      return value?.[paramLinkId1]
    }
  } else {
    return value
  }
}

/***
 * 删除组件时一起删除关联组件的代码
 * @param designer
 */
export function deleteAllLinkWidgetCode(designer: any) {
  // debugger
  const callback = (widget: any) => (param: any, getWidgetRef: Function) => {
    let lkUtils = new LinkWidgetUtils({
      designer,
      selectedWidget: widget,
      oldLinkWidgetId: param?.linkWidgetId?.[0]
    })
    lkUtils.deleteOldLWCode()
    param?.linkWidgetId && (param.linkWidgetId = [])
  }
  traverseAllWidgets(designer.widgetList, (widget: any) => {
    // debugger
    if (widget.options.bussinessSource?.scriptParams?.length > 0) {
      setLinkWidgetValueToScriptParams(widget.options.bussinessSource?.scriptParams, designer.getWidgetRef, callback(widget))
    }
    if (widget.options?.valueSource?.bindMap) {
      traverseObj(widget.options?.valueSource?.bindMap, (Scripts_ID: string, bindvalue: BindMapValue) => {
        setLinkWidgetValueToScriptParams(bindvalue.scriptParams, designer.getWidgetRef, callback(widget))
      })
    }
  })
}