<template>
  <el-form-item :label="i18nt('designer.setting.submit')">
    <el-select v-model="selectedSubmitButton" value-key="id" @change="onChange">
      <el-option v-for="(item) in compButtons" :value="item.id" :label="item.options.label"/>
    </el-select>
  </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {traverseAllWidgets} from "@/utils/util";

export default {
  name: "submit-editor",
  mixins: [i18n, propertyMixin],
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  data() {
    return {
      selectedSubmitButton: this.optionModel.submit
    }
  },
  computed: {
    compButtons() {
      const buttons = []
      traverseAllWidgets(this.selectedWidget.widgetList, (widget) => {
        widget.type === 'button' && buttons.push(widget)
      })
      return buttons
    }
  },
  methods: {
    onChange(value) {
      const button = this.selectedWidget.widgetList.find(w => w.id === value)
      button.options.onClick = `this.refList['${this.selectedWidget.id}'].saveDataWrapper();`
      this.optionModel.submit = value
    }
  }
}
</script>

<style scoped>

</style>