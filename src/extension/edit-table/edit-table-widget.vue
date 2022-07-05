<template>
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">
    <div :key="widget.id" class="collapse-container data-table-container"
         style="display: flex;flex-direction: column"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">
      <el-button type="primary" style="margin-left: auto">
        添加行
      </el-button>
      <el-table :data="widget.options.tableData" row-key="id" border>
        <el-table-column :label="column.label" :prop="column.prop"
                         v-for="(column,index) in widget.options.tableColumns">
        </el-table-column>
      </el-table>
    </div>
  </container-wrapper>
</template>

<script>
import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper";
import i18n from "@/utils/i18n";
import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin";
import refMixinDesign from "@/components/form-designer/refMixinDesign";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import {watch} from "vue";

export default {
  name: "edit-table-widget",
  mixins: [i18n, containerMixin, refMixinDesign],
  inject: ['refList'],
  setup(props) {

    watch(() => [...props.widget.options.tableColumns], (newVal, oldValue) => {
      if (oldValue.length > newVal.length) {
        const deletedColumn = oldValue.find(item => !newVal.find(nItem => nItem.prop === item.prop))
        const bindMap = props.widget.options.dataTarget.bindMap
        Object.keys(bindMap).map(key => {
          if (bindMap[key] === deletedColumn.prop) {
            delete bindMap[key]
          }
        })
      }
    }, {deep: true})
    return {}
  },
  components: {
    ContainerWrapper,
    ...FieldComponents,
    ArrowDown,
    ArrowUp
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
  created() {
    this.initRefList()
  },
  methods: {
    /**
     * 检查接收哪些组件拖放，如不接受某些组件拖放，则根据组件类型判断后返回false
     * @param evt
     * @returns {boolean}
     */
    checkContainerMove(evt) {
      return true
    },
  }
}
</script>

<style scoped lang="scss">


</style>