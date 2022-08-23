import EditTableWidget from "@/extension/tree-view/tree-view-widget";
import EditTableItem from "@/extension/tree-view/tree-view-item";

export default {
  install: (addWidgetSchema, app, PERegister) => {
    addWidgetSchema(editTableSchema)
    app.component(EditTableWidget.name, EditTableWidget)
    app.component(EditTableItem.name, EditTableItem)
  }
}