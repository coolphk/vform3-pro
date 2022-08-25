<template>
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">
    <div :key="widget.id" class="sub-form-container"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">
      <el-tree
          :class="compClass"
          :data="compTreeData"
          empty-text="请点击预览查看数据"
      ></el-tree>
    </div>
  </container-wrapper>
</template>

<script>
import i18n from "@/utils/i18n";
import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin";
import refMixinDesign from "@/components/form-designer/refMixinDesign";
import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";
import {unFlatten} from "@/utils/data-adapter";

export default {
  name: "tree-view-widget",
  componentName: 'TreeViewWidget',
  mixins: [i18n, containerMixin, refMixinDesign],
  inject: ['refList'],
  components: {
    ContainerWrapper,
    ...FieldComponents,
  },
  data() {
    return {
      treeArray: []
    }
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
    compTreeData() {
      const aa = unFlatten(this.treeArray, 'BHK01', undefined, 0, 'BHK01A')
      console.log(111, aa);
      return aa
    },
    compClass() {
      return {
        'tree-border': this.widget.options.showBorder
      }
    }
  },
  watch: {
    //
  },
  created() {
    this.initRefList()
    this.loadDataFromBussiness()
  },
  mounted() {
    //
  },
  methods: {
    loadDataFromBussiness() {

    },
  }
}
</script>

<style lang="scss" scoped>
.sub-form-container {
  //width: 100%;
  padding: 8px;
  border: 1px dashed #336699;
  min-height: 68px;

  .tree-border {
    border: 1px solid #cccccc;
  }

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