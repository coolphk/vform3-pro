import TreeViewWidget from "@/extension/tree-view/tree-view-widget";
import TreeViewItem from "@/extension/tree-view/tree-view-item";
import TreeViewSchema from "@/extension/tree-view/tree-view-schema"
import * as PEFactory from "@/components/form-designer/setting-panel/property-editor-factory.jsx";
import * as PERegister from "@/components/form-designer/setting-panel/propertyRegister";


export default {
  install: (addWidgetSchema, app) => {
    addWidgetSchema(TreeViewSchema)
    app.component(TreeViewWidget.name, TreeViewWidget)
    app.component(TreeViewItem.name, TreeViewItem)
    // console.log('install treeView', PEFactory.createBooleanEditor('showBorder', 'extension.setting.showBorder'));
    PERegister.registerCPEditor(app, 'tree-view-showBorder', 'tree-view-showBorder-editor',
      PEFactory.createBooleanEditor('showBorder', 'extension.setting.showBorder'))
    PERegister.registerCPEditor(app, 'tree-view-rootParentValue', 'tree-view-rootParentValue-editor',
      PEFactory.createInputTextEditor('rootParentValue', 'extension.setting.rootParentValue'))
    PERegister.registerCPEditor(app, 'tree-view-labelKey', 'tree-view-labelKey-editor',
      PEFactory.createInputTextEditor('labelKey', 'extension.setting.labelKey'))
    PERegister.registerCPEditor(app, 'tree-view-valueKey', 'tree-view-valueKey-editor',
      PEFactory.createInputTextEditor('valueKey', 'extension.setting.valueKey'))
    PERegister.registerCPEditor(app, 'tree-view-parentKey', 'tree-view-parentKey-editor',
      PEFactory.createInputTextEditor('parentKey', 'extension.setting.parentKey'))
    PERegister.registerCPEditor(app, 'tree-view-expandOnClickNode', 'tree-view-expandOnClickNode-editor',
      PEFactory.createBooleanEditor('expandOnClickNode', 'extension.setting.expandOnClickNode'))
    PERegister.registerEPEditor(app, 'tree-view-onNodeClick', 'tree-view-onNodeClick-editor',
      PEFactory.createEventHandlerEditor('onNodeClick', ['data', 'node','value']))
  }
}