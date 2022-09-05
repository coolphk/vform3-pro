import DataWrapperWidget from "@/extension/data-wrapper/data-wrapper-widget";
import DataWrapperItem from "@/extension/data-wrapper/data-wrapper-item";
import DataWrapperSchema from "./data-wrapper-schema"
/*import * as PERegister from "@/components/form-designer/setting-panel/propertyRegister";
import * as PEFactory from "@/components/form-designer/setting-panel/property-editor-factory";*/


export default {
  install: (addWidgetSchema, app) => {
    addWidgetSchema(DataWrapperSchema)
    app.component(DataWrapperWidget.name, DataWrapperWidget)
    app.component(DataWrapperItem.name, DataWrapperItem)

    /*PERegister.registerEPEditor(app, 'data-wrapper-onMounted', 'tree-view-onChange-editor',
      PEFactory.createEventHandlerEditor('onChange', ['data', 'node']))*/
  }
}