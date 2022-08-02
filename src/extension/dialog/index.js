import DialogWidget from "@/extension/dialog/dialog-widget";
import DialogItem from "@/extension/dialog/dialog-item";
import DialogSchema from "@/extension/dialog/dialog-schema";



export default {
  install: (addWidgetSchema, app, PERegister) => {
    addWidgetSchema(DialogSchema)
    app.component(DialogWidget.name, DialogWidget)
    app.component(DialogItem.name, DialogItem)
  }
}