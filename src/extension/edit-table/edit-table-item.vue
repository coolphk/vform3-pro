<template>
  <container-item-wrapper :widget="widget">
    <div :key="widget.id" class="collapse-container data-table-container"
         style="display: flex;flex-direction: column">
      <div style="display: flex" class="el-card">
        <el-button type="primary" @click="addData" style="margin-left: auto">
          添加行
        </el-button>
      </div>

      <el-table :data="tableData" row-key="id" :ref="widget.id" border
                :cell-style="widget.options.cellStyle">
        <el-table-column :label="column.label" :prop="column.prop"
                         v-for="(column,index) in widget.options.tableColumns">
          <template #default="scope">
            <div>
              <el-input v-model="scope.row[scope.column.property]"></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="100" fixed="right" label="操作">
          <template #default="scope">
            <el-button @click="onDeleteRow(scope.$index)">删除</el-button>
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
import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";
import emitter from "@/utils/emitter";

export default {
  name: "edit-table-item",
  mixins: [i18n, refMixinDesign, fieldMixin, emitter],
  inject: ['refList'],
  setup(props) {
    /**
     * 添加一个空行
     */
    function addData() {
      const rowData = {}
      props.widget.options.tableColumns.map((column) => {
        rowData[column.prop] = ""
      })
      props.widget.options.tableData.push(rowData)
    }

    function onDeleteRow(rowIndex) {
      props.widget.options.tableData.splice(rowIndex, 1)
    }

    return {
      addData,
      onDeleteRow
    }
  },
  components: {
    ContainerItemWrapper,
    ...FieldComponents,
    ArrowDown,
    ArrowUp
  },
  props: {
    widget: Object
  },
  computed: {
    tableData: {
      get() {
        return this.formModel[this.widget.id];
      },
      set(value) {
        this.formModel[this.widget.id] = value
      }
    },
    field: {
      get() {
        return this.widget
      },
      set(value) {
        this.widget = value
      }
    }
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