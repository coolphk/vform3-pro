import DataWrapperWidget from "@/extension/data-wrapper/data-wrapper-widget";
import DataWrapperItem from "@/extension/data-wrapper/data-wrapper-item";
import DataWrapperSchema from "./data-wrapper-schema"


export default {
  install: (addWidgetSchema, app, PERegister) => {
    addWidgetSchema(DataWrapperSchema)
    app.component(DataWrapperWidget.name, DataWrapperWidget)
    app.component(DataWrapperItem.name, DataWrapperItem)
  }
}