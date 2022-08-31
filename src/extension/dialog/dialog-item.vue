<template>
  <container-item-wrapper :widget="widget">
    <el-dialog v-if="widget.options.visible" :key="widget.id" v-model="widget.options.visible" append-to-body>
      <!--    <div :key="widget.id" v-show="!widget.options.hidden" class="sub-form-container">-->
      <template v-if="!!widget.widgetList && (widget.widgetList.length > 0)">
        <template v-for="(subWidget, swIdx) in widget.widgetList">
          <template v-if="'container' === subWidget.category">
            <component :is="subWidget.type + '-item'" :widget="subWidget" :key="swIdx" :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget">
              <!-- 递归传递插槽！！！ -->
              <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
              </template>
            </component>
          </template>
          <template v-else>
            <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="null" :key="swIdx"
                       :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget">
              <!-- 递归传递插槽！！！ -->
              <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
              </template>
            </component>
          </template>
        </template>
      </template>
      <!--    </div>-->
    </el-dialog>
  </container-item-wrapper>
</template>

<script>
import ContainerItemWrapper from "@/components/form-render/container-item/container-item-wrapper";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";
import i18n from "@/utils/i18n";
import containerItemMixin from "@/components/form-render/container-item/containerItemMixin";
import refMixin from "@/components/form-render/refMixin";
import emitter from "@/utils/emitter";

export default {
  name: "dialog-item",
  componentName: "DialogItem",
  mixins: [i18n, containerItemMixin, refMixin, emitter],
  inject: ['refList'],
  components: {
    ContainerItemWrapper,
    ...FieldComponents,
  },
  props: {
    widget: Object,
  },
  created() {
    this.initRefList()
  },
  methods: {
    show() {
      this.widget.options.visible = true
    },
    close() {
      this.widget.options.visible = false
    }
  }
}
</script>

<style scoped>

</style>