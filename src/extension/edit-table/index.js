import {editTableSchema} from "@/extension/edit-table/edit-table-schema";
import EditTableWidget from "@/extension/edit-table/edit-table-widget";
import EditTableItem from "@/extension/edit-table/edit-table-item";

export default {
  install: (addWidgetSchema, app, PERegister) => {
    addWidgetSchema(editTableSchema)
    app.component(EditTableWidget.name, EditTableWidget)
    app.component(EditTableItem.name, EditTableItem)
  }
}