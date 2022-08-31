<template>
  <container-item-wrapper v-show="!widget.options.hidden" :widget="widget">
    <div :key="widget.id" style="padding-top: 5px">
      <!--      <div style="height: 100px">-->
      <el-tree
          :style="{maxHeight: widget.options.height,height:widget.options.height,overflow: 'auto'}"
          :expand-on-click-node="compOptionModal.expandOnClickNode"
          :class="compClass"
          :data="compOptionModal.treeData"
          :props="compProp"
          @node-click="handleOnNodeClick"
      ></el-tree>
    </div>
    <!--    </div>-->
  </container-item-wrapper>
</template>

<script lang="ts">
import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper.vue'
import {loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams, unFlatten} from "@/utils/data-adapter.js";
import ContainerItemMixin from "@/components/form-render/container-item/containerItemMixin.js";
import refMixin from "@/components/form-render/refMixin.js";
import {TreeView, TreeViewOptions} from "@/extension/tree-view/tree-view-schema";
import {defineComponent, PropType} from "vue";
import Node from "element-plus/lib/components/tree/src/model/node";

export default defineComponent({
  name: 'tree-view-item',
  components: {
    ContainerItemWrapper
  },
  mixins: [ContainerItemMixin, refMixin],
  inject: ['refList', 'sfRefList', 'globalModel', 'getFormConfig', 'getGlobalDsv'],
  props: {
    widget: {
      type: Object as PropType<TreeView>,
      require: true
    }
  },
  computed: {
    compClass() {
      return {
        'tree-border': this.compOptionModal.showBorder
      }
    },
    compOptionModal(): TreeViewOptions {
      return this.widget!.options
    },
    compProp() {
      return {label: this.compOptionModal.labelKey, children: 'children'}
    }
  },
  created() {
    this.loadDataFromBussiness()
  },
  methods: {
    handleOnNodeClick(data: any, node: Node) {
      new Function('data', 'node', 'value', this.widget!.options.onNodeClick).call(this, data, node, data[this.widget!.options.valueKey])
    },
    loadDataFromBussiness() {
      if (this.compOptionModal.bussinessSource?.currentNodeKey) {
        loadBussinessSource(assembleBussinessParams({
          scriptId: this.widget!.options.bussinessSource!.currentNodeKey,
          pageSize: this.widget!.options.bussinessSource!.pageSize,
          currentPage: this.currentPage,
          params: this.widget!.options.bussinessSource!.scriptParams
        })).then((res => {
          this.widget!.options.treeData = unFlatten(res.Data.TableData, this.widget!.options.valueKey, undefined, this.widget!.options.rootParentValue, this.widget!.options.parentKey)
        }))
      }
    },
  }
})


</script>

<style scoped lang="scss">
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