<template>
  <el-form-item :label="i18nt('designer.setting.submit')">
    <el-select v-model="selectedSubmitButton" clearable>
      <el-option v-for="(item) in compButtons" :value="item.id" :label="`${item.options.label}-${item.id}`"/>
    </el-select>
  </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {traverseAllWidgets} from "@/utils/util";
import LinkWidgetUtils from "@/utils/linkWidgetUtils";

export default {
  name: "submit-editor",
  mixins: [i18n, propertyMixin],
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  data() {
    return {}
  },
  computed: {
    compButtons() {
      const buttons = []
      traverseAllWidgets(this.selectedWidget.widgetList, (widget) => {
        widget.type === 'button' && buttons.push(widget)
      })
      return buttons
    },
    selectedSubmitButton: {
      get() {
        return this.optionModel.submit
      },
      set(value) {
        this.optionModel.submit = value
      }
    }
  },
  watch: {
    ['optionModel.submit'](newValue, oldValue) {
      console.log(1, newValue);
      console.log(2, oldValue);
      const linkWidgetUtils = new LinkWidgetUtils({
        designer: this.designer,
        selectedWidget: this.selectedWidget,
        linkWidgetId: newValue,
        oldLinkWidgetId: oldValue
      })
      if (oldValue) {
        linkWidgetUtils.deleteOldLWCode()
      }
      if (newValue) {
        linkWidgetUtils.addOrUpdateLinkWidgetCode()
      }
    }
  },
  methods: {
    /*onChange(value) {
      traverseAllWidgets(this.selectedWidget.widgetList, (widget) => {
        if (widget => widget.id === value) {
          widget.options.onClick = `this.refList['${this.selectedWidget.id}'].saveDataWrapper();`
          this.optionModel.submit = value
        }
      })
    }*/
  }
}
</script>

<style scoped>

</style>