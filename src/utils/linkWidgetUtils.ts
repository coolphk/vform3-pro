import {getWidgetEventByType} from "@/utils/data-adapter.js";
import {VFormBussinessSource} from "@/components/form-designer/widget-panel/types";

type Template = {
  LWType: string,
  CWType: string,
  codeTemplate: string | undefined
  regTemplate: RegExp | undefined
}
type ConstructorType = {
  designer: any,
  selectedWidget: any,
  linkWidgetId: string,
  oldLinkWidgetId: string
}
export default class LinkWidgetUtils {
  private designer: any;
  private selectedWidget: any;
  private oldLinkWidget: any;
  private linkWidget: any;

  constructor({designer, selectedWidget, linkWidgetId, oldLinkWidgetId}: ConstructorType) {
    this.designer = designer
    this.selectedWidget = selectedWidget
    this.linkWidget = this.getLinkWidget(linkWidgetId)
    this.oldLinkWidget = this.getLinkWidget(oldLinkWidgetId)
  }

  /**
   * 删除旧有关联组件的代码
   */
  deleteOldLWCode() {
    //获取旧组件的事件代码
    const originalLW = this.oldLinkWidget
    debugger
    if (originalLW) {
      const oldCode = originalLW.options[getWidgetEventByType(originalLW.type)]
      const oldRes = this.getCodeTemplateWithLWTypeAndCWType(originalLW.type, this.selectedWidget.type)
      const oldMatched = oldCode.match(oldRes.regTemplate)
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
    if (linkWidget) {
      //根据当前组件与当前关联组件获取匹配正则与代码模板
      const res = this.getCodeTemplateWithLWTypeAndCWType(linkWidget.type, this.selectedWidget.type)
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
  }

  /**
   * 获取关联组件调用loadBussiness方法的组件，表格为按钮，其他组件为关联组件
   */

  /*private getLinkWidgetHandleWidget(linkWidgetId: string) {
    let handleWidget
    switch (this.selectedWidget.type) {
      /!*case 'data-table':
        // case 'tree-view':
        if (props.selectedWidget.options.refreshWidget === '') {
          ElMessage.error({
            message: '请先选择关联刷新组件'
          })
          nextTick(() => props.row.linkWidgetId = [])
          // setTimeout(() => props.row.linkWidgetId = [])
          return
        }
        handleWidget = getLinkWidget(props.selectedWidget.options.refreshWidget)
        break*!/
      default:
        handleWidget = this.getLinkWidget(linkWidgetId)
    }
    return handleWidget;
  }*/

  private getLinkWidget(id: string) {
    return this.designer.formWidget.getWidgetRef(id, false)?.field
  }

  /**
   * 根据法关联组件与当前选中组件获取需要设置的代码
   * (codeTemplate含义)当关联组件事件被触发时，用关联组件的值替换当前选中组件的scriptParams中对应的参数。
   * 然后调用当前选中组件的读取业务数据方法(loadBussiness)
   * @param LWType 关联组件
   * @param CWType 当前选中组件
   */
  private getCodeTemplateWithLWTypeAndCWType(LWType: string, CWType: string): Pick<Template, 'codeTemplate' | 'regTemplate'> {
    const selectedWidgetFunctionStr = this.getSelectedWidgetTriggerFunction(this.selectedWidget.type)
    const codeTemplates = [{
      LWType: 'select',
      CWType: 'select',
      codeTemplate: `const triggerWidget = this.getWidgetRef("${this.selectedWidget.id}");\n` +
        `triggerWidget.${selectedWidgetFunctionStr}();\n`,
      regTemplate: new RegExp(`const.*${this.selectedWidget.id}.*\\ntriggerWidget.${selectedWidgetFunctionStr}\\(\\);\\n*`)

    }, {
      LWType: 'button',
      CWType: 'data-table',
      codeTemplate: `const triggerWidget = this.getWidgetRef('${this.selectedWidget.id}');\n` +
        `triggerWidget.${selectedWidgetFunctionStr}();\n`,
      regTemplate: new RegExp(`const.*${this.selectedWidget.id}.*\\ntriggerWidget.${selectedWidgetFunctionStr}\\(\\);\\n*`)
    }]
    const foundItem = codeTemplates.find((item) => item.LWType === LWType && item.CWType === CWType)
    return {
      codeTemplate: foundItem?.codeTemplate,
      regTemplate: foundItem?.regTemplate
    }
  }

  /**
   * 获取当前组件被调用的方法(关联组件事件执行时，回调当前组件的方法)
   */
  private getSelectedWidgetTriggerFunction(type: string) {
    let strFunction = ""
    switch (type) {
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

  private getScriptParamsStrByType(type: string) {
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
}

/**
 * 用关联组件的值替换scriptParam的TestVALUE
 * @param bussinessSource
 * @param linkWidget
 */
export function setLinkWidgetValueToScriptParams(bussinessSource: VFormBussinessSource, linkWidget: any) {
  bussinessSource.scriptParams.map(param => {
    linkWidget && (param.Param_TestVALUE = linkWidget.fieldModel[linkWidget.field.options.valueKey])
  })
}