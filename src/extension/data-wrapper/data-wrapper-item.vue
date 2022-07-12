<template>
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">
    <div :key="widget.id" class="collapse-container data-table-container"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">

    </div>
  </container-wrapper>
</template>

<script>
import i18n from "@/utils/i18n";
import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin";
import refMixinDesign from "@/components/form-designer/refMixinDesign";
import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";

export default {
  name: "data-wrapper-item",
  mixins: [i18n, containerMixin, refMixinDesign],
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
  }
}
</script>

<style scoped>

</style>