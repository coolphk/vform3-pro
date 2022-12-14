<template>

  <container-item-wrapper v-show="!widget.options.hidden" :widget="widget">

    <el-table ref="dataTable"
              :data="widget.options.tableData"
              :class="[customClass]"
              :height="widget.options.tableHeight"
              :style="{'width': widget.options.tableWidth}"
              :border="widget.options.border"
              :show-summary="widget.options.showSummary"
              :size="widgetSize" :stripe="widget.options.stripe"
              highlight-current-row
              @selection-change="handleSelectionChange"
              @sort-change="handleSortChange"
              @row-click="hanldeTableRowClick"
              @current-change="onCurrentChange"
              :cell-style="{padding: widget.options.rowSpacing + 'px 0'}">

      <el-table-column v-if="widget.options.showIndex" type="index" width="50" fixed="left"></el-table-column>
      <el-table-column v-if="widget.options.showCheckBox" type="selection"
                       :width="!widget.options.showSummary ? 42: 53" fixed="left"></el-table-column>

      <template v-for="(item, index) in widget.options.tableColumns">
        <el-table-column
            v-if="item.show !== false"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            :sortable="item.sortable"
            :fixed="!item.fixed ? false : item.fixed"
            :align="item.align ? item.align:'center'"
            :formatter="formatterValue"
            :format="item.format"
            :show-overflow-tooltip="true"
            :width="item.width">
          <template #header>{{ item.label }}</template>
        </el-table-column>
      </template>

      <template v-if="!!widget.options.showButtonsColumn">
        <el-table-column fixed="right" class-name="data-table-buttons-column" :align="'center'"
                         :label="widget.options.buttonsColumnTitle"
                         :width="widget.options.buttonsColumnWidth">
          <template #default="scope">
            <template v-for="(ob) in widget.options.operationButtons">
              <el-button v-if="!ob.hidden" :type="ob.type" :size="ob.size"
                         :round="ob.round" :disabled="ob.disabled"
                         @click="handleOperationButtonClick(ob.name, scope.$index, scope.row)"
                         :class="['data-table-' + ob.name + '-button']">{{ ob.label }}
              </el-button>
            </template>
          </template>
        </el-table-column>
      </template>

    </el-table>
    <el-pagination v-if="widget.options.showPagination"
                   :small="widget.options.smallPagination"
                   :current-page="currentPage"
                   :page-sizes="widget.options.pagination.pageSizes"
                   :page-size="widget.options.pagination.pageSize"
                   :layout="paginationLayout"
                   :total="widget.options.pagination.total"
                   @size-change="handlePageSizeChange"
                   @current-change="handleCurrentPageChange">
    </el-pagination>

  </container-item-wrapper>
</template>
<script>
import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper'
import emitter from '@/utils/emitter'
import i18n from "@/utils/i18n"
import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
import refMixin from "@/components/form-render/refMixin"
import containerItemMixin from "@/components/form-render/container-item/containerItemMixin"
import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";
import {getDSByName, overwriteObj, runDataSourceRequest} from "@/utils/util"
import {loadBussinessSource} from "@/api/bussiness-source"
import {assembleBussinessParams, traverseObj} from "@/utils/data-adapter";
import {setLinkWidgetValueToScriptParams} from "@/utils/linkWidgetUtils";


export default {
  name: "DataTableItem",
  componentName: 'ContainerItem',  //???????????????ContainerItem??????????????????????????????broadcast??????
  mixins: [emitter, i18n, refMixin, containerItemMixin, fieldMixin],
  components: {
    ContainerItemWrapper,
    ...FieldComponents,
  },
  props: {
    widget: Object,
    parentWidget: Object,
    parentList: Array,
    indexOfParentList: Number,

    subFormRowIndex: { /* ??????????????????????????????0???????????? */
      type: Number,
      default: -1
    },
    subFormColIndex: { /* ??????????????????????????????0???????????? */
      type: Number,
      default: -1
    },
    subFormRowId: { /* ??????????????????Id?????????id???????????? */
      type: String,
      default: ''
    },

  },
  inject: ['refList', 'sfRefList', 'globalModel', 'getFormConfig', 'getGlobalDsv'],
  data() {
    return {
      tableData: [],
      selectedIndices: [],
      pageSize: this.widget.options.pagination.pageSize,
      currentPage: this.widget.options.pagination.currentPage,
      fieldModel: {}
    }
  },
  computed: {
    formConfig() {
      return this.getFormConfig()
    },

    paginationLayout() {
      return !!this.widget.options.smallPagination ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
    },

    customClass() {
      return this.widget.options.customClass || ''
    },

    widgetSize() {
      return this.widget.options.tableSize || "default"
    },

  },
  created() {
    this.initRefList()
  },
  mounted() {
    // this.handleOnMounted()

    if (!!this.widget.options.bussinessSource.currentNodeKey) {
      this.loadDataFromBussiness()
    } else if (!!this.widget.options.dsEnabled) {
      this.loadDataFromDS({})
    }
  },
  beforeDestroy() {
    this.unregisterFromRefList()
  },
  methods: {
    selectWidget(widget) {
      this.designer.setSelected(widget)
    },


    formatter(row, column, cellValue) {
      return cellValue;
    },

    formatterValue(row, column, cellValue, rowIndex) {
      const formatter = this.widget.options.tableColumns.find(item => item.prop === column.property)
      if (!!formatter.formatS) {
        const func = new Function('row', 'column', 'cellValue', 'rowIndex', formatter.formatS)
        return func(row, column, cellValue, rowIndex)
      }
      return cellValue;
    },

    getRowIndex(row) {
      return this.widget.options.tableData.lastIndexOf(row)
    },

    findColumnAndSetHidden(columnName, hiddenFlag) {
      this.widget.options.tableColumns.forEach(tc => {
        if (tc.prop === columnName) {
          tc.show = !hiddenFlag
        }
      })
    },

    handleSelectionChange(selection) {
      this.selectedIndices.length = 0
      selection.map((row) => {
        let rowIndex = this.getRowIndex(row)
        if (rowIndex >= 0) {
          this.selectedIndices.push(rowIndex)
        }
      })

      if (!!this.widget.options.onSelectionChange) {
        let customFn = new Function('selection', 'selectedIndices', this.widget.options.onSelectionChange)
        customFn.call(this, selection, this.selectedIndices)
      } else {
        /* ????????????mixins??????dispatch?????????????????????????????????????????? */
        this.dispatch('VFormRender', 'dataTableSelectionChange', [this, selection, this.selectedIndices])
      }
    },

    handleSortChange({column, prop, order}) {
      // this.dispatch('VFormRender', 'dataTableSortChange',
      // 				[this, column, prop, order, this.pageSize, this.currentPage])
      //
      // console.log('test====', prop)
    },

    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize
      if (!!this.widget.options.dsEnabled && !!this.widget.options.dsName) {
        this.loadDataFromDS()
      }

      if (!!this.widget.options.onPageSizeChange) {
        let customFn = new Function('pageSize', 'currentPage', this.widget.options.onPageSizeChange)
        customFn.call(this, pageSize, this.currentPage)
      } else {
        this.dispatch('VFormRender', 'dataTablePageSizeChange', [this, pageSize, this.currentPage])
      }
    },
    /**
     * ??????????????????????????????
     */
    loadDataFromBussiness() {
      /* ????????????????????????????????? */
      const bussinessSource = this.widget.options.bussinessSource
      // ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
      if (!!bussinessSource?.currentNodeKey) {
        /**
         * ???????????????????????????scriptParam???TestVALUE
         */
        setLinkWidgetValueToScriptParams(bussinessSource.scriptParams, this.getWidgetRef)
      }
      loadBussinessSource(assembleBussinessParams({
        scriptId: this.widget.options.bussinessSource.currentNodeKey,
        currentPage: this.currentPage,
        params: this.widget.options.bussinessSource.scriptParams
      })).then((res => {
        this.widget.options.tableData = res.Data.TableData
      }))
    },
    handleCurrentPageChange(currentPage) {
      this.currentPage = currentPage
      if (!!this.widget.options.bussinessSource.currentNodeKey) {
        this.loadDataFromBussiness()
      } else if (!!this.widget.options.dsEnabled && !!this.widget.options.dsName) {
        this.loadDataFromDS()
      }

      if (!!this.widget.options.onCurrentPageChange) {
        let customFn = new Function('pageSize', 'currentPage', this.widget.options.onCurrentPageChange)
        customFn.call(this, this.pageSize, currentPage)
      } else {
        this.dispatch('VFormRender', 'dataTablePageChange', [this, this.pageSize, currentPage])
      }
    },

    handleOperationButtonClick(btnName, rowIndex, row) {
      if (!!this.widget.options.onOperationButtonClick) {
        let customFn = new Function('buttonName', 'rowIndex', 'row', this.widget.options.onOperationButtonClick)
        customFn.call(this, btnName, rowIndex, row)
      }
    },
    hanldeTableRowClick(row, column, rowIndex) {
      try {
        if (!!this.widget.options.onTableRowClick) {
          let customFn = new Function('data', 'column', 'rowIndex', this.widget.options.onTableRowClick)
          customFn.call(this, row, column, rowIndex)
        }
      } catch (error) {
        console.error(`${this.widget.id}--hanldeTableRowClick????????????`)
        throw error
      }
    },
    //--------------------- ????????????????????????????????????API?????? begin ------------------//
    /* ??????????????????????????????????????????????????? */

    /**
     * ???????????????
     * @param tableColumns
     */
    setTableColumns(tableColumns) {
      this.widget.options.tableColumns = tableColumns
      this.$nextTick(() => {
        this.$refs.dataTable.doLayout()  //??????????????????????????????
      })
    },

    /**
     * ?????????????????????????????????????????????setTableColumn??????setTableColumns???
     * @param tableColumns
     */
    setTableColumn(tableColumns) {
      this.setTableColumns(tableColumns)
    },

    /**
     * ???????????????????????????
     * @param localDsv ?????????????????????DSV
     * @param dsName ???????????????
     */
    loadColumnsFromDS(localDsv = {}, dsName) {
      let curDS = getDSByName(this.formConfig, dsName)
      if (!!curDS) {
        let gDsv = this.getGlobalDsv() || {}
        let newDsv = new Object({})
        overwriteObj(newDsv, gDsv)
        overwriteObj(newDsv, localDsv)
        newDsv.widgetName = this.widget.options.name
        runDataSourceRequest(curDS, newDsv, false, this.$message).then(res => {
          this.setTableColumns(res)
        }).catch(err => {
          this.$message.error(err.message)
        })
      }
    },

    /**
     * ???????????????????????????????????????
     * @param columnNames
     * @param hiddenFlag
     */
    setTableColumnsHidden(columnNames, hiddenFlag) {
      if (!!columnNames) {
        if (typeof columnNames === 'string') {
          this.findColumnAndSetHidden(columnNames, hiddenFlag)
        } else if (Array.isArray(columnNames)) {
          columnNames.forEach(cn => {
            this.findColumnAndSetHidden(cn, hiddenFlag)
          })
        }

        this.$nextTick(() => {
          this.$refs.dataTable.doLayout()  //??????????????????????????????
        })
      }
    },

    /**
     * ??????????????????
     */
    getTableData() {
      return this.widget.options.tableData
    },

    /**
     * ??????????????????
     * @param tableData
     */
    setTableData(tableData) {
      this.widget.options.tableData = tableData
    },

    /**
     * ??????????????????????????????
     * @param localDsv ?????????????????????DSV
     * @param dsName ??????????????????????????????????????????dsName????????????????????????
     */
    loadDataFromDS(localDsv = {}, dsName = '') {
      let curDSName = dsName || this.widget.options.dsName
      let curDS = getDSByName(this.formConfig, curDSName)
      if (!!curDS) {
        let gDsv = this.getGlobalDsv() || {}
        let newDsv = new Object({})
        overwriteObj(newDsv, gDsv)
        overwriteObj(newDsv, localDsv)
        newDsv.widgetName = this.widget.options.name
        newDsv.pageSize = this.pageSize
        newDsv.currentPage = this.currentPage
        runDataSourceRequest(curDS, newDsv, false, this.$message).then(res => {
          this.setTableData(res)
        }).catch(err => {
          this.$message.error(err.message)
        })
      }
    },

    /**
     * ??????????????????
     * @param pagination
     */
    setPagination(pagination) {
      if (pagination.currentPage !== undefined) {
        this.widget.options.pagination.currentPage = pagination.currentPage
      }
      if (pagination.pageSize !== undefined) {
        this.widget.options.pagination.pageSize = pagination.pageSize
      }
      if (pagination.total !== undefined) {
        this.widget.options.pagination.total = pagination.total
      }
    },

    /**
     * ?????????????????????????????????????????????
     * @returns {[]}
     */
    getSelectedRow() {
      return this.$refs.dataTable.selection
    },

    /**
     * ???????????????????????????????????????
     * @returns {[]}
     */
    getSelectedIndex() {
      return this.selectedIndices
    },

    setBindMapScriptParams(row, triggerWidget) {
      traverseObj(triggerWidget.options.valueSource.bindMap, (key, value) => {

      })
    },
    //--------------------- ????????????????????????????????????API?????? end ------------------//
    onCurrentChange(currentRow) {
      this.fieldModel = currentRow
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse-container {
  margin: 2px;

  .form-widget-list {
    min-height: 28px;
  }
}

:deep(.el-collapsed__header) {
  padding: 10px 12px;
}
</style>
