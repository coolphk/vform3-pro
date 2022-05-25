import {editTableSchema} from "@/extension/edit-table/edit-table-schema";
import EditTableWidget from "@/extension/edit-table/edit-table-widget";

export default {
  install: (addWidgetSchema, app, PERegister) => {
    addWidgetSchema(editTableSchema)
    app.component(EditTableWidget.name, EditTableWidget)
  }
}