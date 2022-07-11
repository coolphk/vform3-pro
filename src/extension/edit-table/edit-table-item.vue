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
                :cell-style="widget.options.cellStyle" @contextmenu="onContextmenu">
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
      <context-menu :show="menuOptions.show" :options="menuOptions"></context-menu>
    </div>
  </container-item-wrapper>
</template>

<script>
import ContainerItemWrapper from "@/components/form-render/container-item/container-item-wrapper";
import i18n from "@/utils/i18n";
import refMixinDesign from "@/components/form-designer/refMixinDesign";
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";
import emitter from "@/utils/emitter";
import ContextMenu from "@/components/context-menu"
import {reactive} from "vue";

export default {
  name: "edit-table-item",
  mixins: [i18n, refMixinDesign, fieldMixin, emitter],
  inject: ['refList'],
  setup(props, {attrs}) {
    const menuOptions = reactive({
      show: false,
      x: 0,
      y: 0,
      title: '操作表格',
      handles: [{
        label: '添加新行',
        handle: ""
      }]
    })

    function onDeleteRow(rowIndex) {
      // props.widget.options.tableData.splice(rowIndex, 1)
      attrs['form-model'][props.widget.id].splice(rowIndex, 1)
    }

    function onContextmenu(e) {

    }

    return {
      menuOptions,
      onDeleteRow
    }
  },
  components: {
    ContextMenu,
    ContainerItemWrapper,
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
    addData() {
      const rowData = {}
      this.widget.options.tableColumns.map((column) => {
        rowData[column.prop] = ""
      })
      if (this.formModel[this.widget.id] === undefined) {
        this.formModel[this.widget.id] = [rowData]
      } else {
        this.formModel[this.widget.id].push(rowData)
      }
      this.menuOptions.show = false
    },
    onContextmenu(e) {
      e.preventDefault()
      this.menuOptions.x = e.x
      this.menuOptions.y = e.y
      this.menuOptions.show = true
      this.menuOptions.handles[0].handle = this.addData
    }
  }
}
</script>

<style scoped lang="scss">

</style>