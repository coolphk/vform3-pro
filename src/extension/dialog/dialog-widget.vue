<template>
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">

    <div :key="widget.id" class="sub-form-container"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">
      <div class="contianer-title">
        弹出窗体{{ widget.id }}
      </div>
      <draggable :list="widget.widgetList" item-key="id"
                 v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 200}"
                 tag="transition-group" :component-data="{name: 'fade'}"
                 handle=".drag-handler" :move="checkContainerMove">
        <template #item="{ element: subWidget, index: swIdx }">
          <div class="form-widget-list">
            <template v-if="'container' === subWidget.category">
              <component :is="subWidget.type + '-widget'" :widget="subWidget" :designer="designer" :key="subWidget.id"
                         :parent-list="widget.widgetList"
                         :index-of-parent-list="swIdx" :parent-widget="widget"></component>
            </template>
            <template v-else>
              <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="designer" :key="subWidget.id"
                         :parent-list="widget.widgetList"
                         :index-of-parent-list="swIdx" :parent-widget="widget" :design-state="true"></component>
            </template>
          </div>
        </template>
      </draggable>
    </div>

  </container-wrapper>
</template>

<script>
import i18n from "@/utils/i18n"
import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin"
import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper"
import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
import refMixinDesign from "@/components/form-designer/refMixinDesign"

export default {
  name: "dialog-widget",
  componentName: 'DialogWidget',
  mixins: [i18n, containerMixin, refMixinDesign],
  inject: ['refList'],
  components: {
    ContainerWrapper,
    ...FieldComponents,
  },
  props: {
    widget: Object,
    parentWidget: Object,
    parentList: Array,
    indexOfParentList: Number,
    designer: Object,
  },
  computed: {
    selected() {
      return this.widget.id === this.designer.selectedId
    },

    customClass() {
      return this.widget.options.customClass || ''
    },

  },
  watch: {
    //
  },
  created() {

  },
  mounted() {
    //
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.sub-form-container {
  //width: 100%;
  padding: 8px;
  border: 1px dashed #336699;
  min-height: 68px;

  :deep(.ghost) {
    content: '';
    font-size: 0;
    //height: 3px;
    height: 74px;
    width: 1px;
    box-sizing: border-box;
    display: inline-block;
    background: $--color-primary;
    border: 2px solid $--color-primary;
    outline-width: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }
}

.sub-form-container.selected {
  outline: 2px solid $--color-primary !important;
}

</style>
