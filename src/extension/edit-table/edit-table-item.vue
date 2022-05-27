<template>
  <container-item-wrapper :widget="widget">
    <div :key="widget.id" class="collapse-container data-table-container"
         style="display: flex;flex-direction: column">
      <div style="display: flex" class="el-card">
        <el-button type="primary" @click="addData" style="margin-left: auto">
          添加行
        </el-button>
      </div>
      <el-table :data="widget.options.tableData" row-key="id" :ref="widget.id" border
                :cell-style="widget.options.cellStyle">
        <el-table-column :label="column.label" :prop="column.prop"
                         v-for="(column,index) in widget.options.tableColumns">
          <template #default="scope">
            <div>
              <el-input v-model="scope.row[scope.column.property]"></el-input>
            </div>
            <!--            <div>{{scope.column}}</div>-->
            <!--            <el-input v-model="scope.row"></el-input>-->
          </template>
        </el-table-column>
      </el-table>
    </div>
  </container-item-wrapper>
</template>

<script>
import ContainerItemWrapper from "@/components/form-render/container-item/container-item-wrapper";
import i18n from "@/utils/i18n";
import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin";
import refMixinDesign from "@/components/form-designer/refMixinDesign";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";

export default {
  name: "edit-table-item",
  mixins: [i18n, containerMixin, refMixinDesign],
  inject: ['refList'],
  setup(props) {
    function addData() {
      const rowData = {}
      props.widget.options.tableColumns.map((column) => {
        rowData[column.prop] = ""
      })
      props.widget.options.tableData.push(rowData)
    }

    return {
      addData
    }
  },
  components: {
    ContainerItemWrapper,
    ...FieldComponents,
    ArrowDown,
    ArrowUp
  },
  props: {
    widget: Object,
    formModel: Object
  },
  watch: {
    ['widget.options.dataTarget.checkedNodes'](newVal) {
      this.widget.options.tableColumns = newVal.map(column => {
        return {
          prop: column.name_,
          label: column.cname,
        }
      })
    }
  },
  /*computed: {
    customClass() {
      return this.widget.options.customClass || ''
    },
  },*/
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