import {getWidgetEventByType} from "@/utils/data-adapter.js";

export default class UseScriptParamBindLinkWidget {
  private designer: any;
  private currentWidget: any;

  constructor(designer: any, currentWidget: any) {
    this.designer = designer
    this.currentWidget = currentWidget
  }

  getLinkWidget(widgetId: string) {
    return this.designer.formWidget.getWidgetRef(widgetId, true).field
  }

  deleteCodeByWidgetId(widgetId: string, codeRegExp: RegExp): void {
    const linkWidget = this.getLinkWidget(widgetId)
    const linkWidgetEventCode = linkWidget.options[getWidgetEventByType(linkWidget.type)]
    if (linkWidgetEventCode.match(codeRegExp) !== null) {
      linkWidget.options[getWidgetEventByType(linkWidget.type)] = linkWidgetEventCode.replace(codeRegExp, '')
    }
  }
  insertCodeByWidgetId(widgetId: string, codeRegExp: RegExp){
    const linkWidget = this.getLinkWidget(widgetId)
    const linkWidgetEventCode = linkWidget.options[getWidgetEventByType(linkWidget.type)]
  }
}