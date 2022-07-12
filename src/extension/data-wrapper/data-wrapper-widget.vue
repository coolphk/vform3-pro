<!--
/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */
-->

<template>
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">

    <div :key="widget.id" class="sub-form-container"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">
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
  name: "data-wrapper-widget",
  componentName: 'DataWrapperWidget',
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
    this.initRefList()
  },
  mounted() {
    //
  },
  methods: {

    onSubFormDragAdd(evt, subList) {
      const newIndex = evt.newIndex
      if (!!subList[newIndex]) {
        this.designer.setSelected(subList[newIndex])
      }

      this.designer.emitHistoryChange()
      console.log('test', 'onSubFormDragAdd')
      this.designer.emitEvent('field-selected', this.widget)
    },

    onSubFormDragEnd(evt) {
      console.log('sub form drag end: ', evt)
    },

  }
}
</script>

<style lang="scss" scoped>
.sub-form-container {
  //width: 100%;
  padding: 8px;
  border: 1px dashed #336699;
  min-height:68px;

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
