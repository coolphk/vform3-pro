<template>

	<container-item-wrapper v-show="!widget.options.hidden" :widget="widget">

			<el-table ref="dataTable" :data="widget.options.tableData" :class="[customClass]"
								:height="widget.options.tableHeight" :style="{'width': widget.options.tableWidth}"
								:border="widget.options.border" :show-summary="widget.options.showSummary"
								:size="widgetSize" :stripe="widget.options.stripe"
								@selection-change="handleSelectionChange"
								@sort-change="handleSortChange"
								:cell-style="{padding: widget.options.rowSpacing + 'px 0'}" >

				<el-table-column v-if="widget.options.showIndex" type="index" width="50" fixed="left"></el-table-column>
				<el-table-column v-if="widget.options.showCheckBox" type="selection"
												 :width="!widget.options.showSummary ? 42: 53"  fixed="left"></el-table-column>

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
						<template #header>{{item.label}}</template>
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
													 :class="['data-table-' + ob.name + '-button']">{{ob.label}}</el-button>
							</template>
						</template>
					</el-table-column>
				</template>

			</el-table>
			<el-pagination v-if="widget.options.showPagination"
										 :small="widget.options.smallPagination"
										 :current-page="widget.options.pagination.currentPage"
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
	import {formatDate1, formatDate2, formatDate3, formatDate4, formatDate5,
					formatNumber1, formatNumber2, formatNumber3, formatNumber4,
					formatNumber5, formatNumber6, formatNumber7} from "@/utils/format"
	import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
	import refMixin from "@/components/form-render/refMixin"
	import containerItemMixin from "@/components/form-render/container-item/containerItemMixin"
	import {getDSByName, overwriteObj, runDataSourceRequest} from "@/utils/util"

  export default {
    name: "DataTableItem",
    componentName: 'ContainerItem',  //必须固定为ContainerItem，用于接收父级组件的broadcast事件
    mixins: [emitter, i18n, refMixin, containerItemMixin],
		components: {
		  ContainerItemWrapper,
		  ...FieldComponents,
		},
		props: {
			widget: Object,
			parentWidget: Object,
			parentList: Array,
			indexOfParentList: Number,

			subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
				type: Number,
				default: -1
			},
			subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
				type: Number,
				default: -1
			},
			subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
				type: String,
				default: ''
			},

		},
		inject: ['refList', 'sfRefList', 'globalModel', 'getFormConfig', 'getGlobalDsv'],
		data() {
			return {
				tableData: [{
					date: '2016-05-02',
					name: '王小虎1',
					address: '上海市普陀区金沙江路 1518 弄'
				}, {
					date: '2016-05-04',
					name: '王小虎2',
					address: '上海市普陀区金沙江路 1517 弄'
				}, {
					date: '2016-05-01',
					name: '王小虎3',
					address: '上海市普陀区金沙江路 1519 弄'
				}, {
					date: '2016-05-03',
					name: '王小虎4',
					address: '上海市普陀区金沙江路 1516 弄'
				}],

				selectedIndices: [],
				pageSize: this.widget.options.pagination.pageSize,
				currentPage: this.widget.options.pagination.currentPage,

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

			if (!!this.widget.options.dsEnabled) {
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

			renderHeader(h, { column, $index }) {//debugger
				//console.log('column=====', column)
				let colCount = 0;
				if(this.widget.options.showIndex){
					colCount++;
				}
				if(this.widget.options.showCheckBox){
					colCount++;
				}

				//this.$set(column, "formatS", this.widget.options.tableColumns[$index-colCount].formatS)
				column.formatS = this.widget.options.tableColumns[$index-colCount].formatS
			  return column.label;
			},

			formatter(row, column, cellValue) {
			  return cellValue;
			},

			formatterValue(row, column, cellValue) {
				if(!!column.formatS) {
					switch(column.formatS) {
						case 'd1':
								return formatDate1(cellValue);
						case 'd2':
								return formatDate2(cellValue);
						case 'd3':
								return formatDate3(cellValue);
						case 'd4':
								return formatDate4(cellValue);
						case 'd5':
								return formatDate5(cellValue);
						case 'n1':
								return formatNumber1(cellValue);
						case 'n2':
								return formatNumber2(cellValue);
						case 'n3':
								return formatNumber3(cellValue);
						case 'n4':
								return formatNumber4(cellValue);
						case 'n5':
								return formatNumber5(cellValue);
						case 'n6':
								return formatNumber6(cellValue);
						case 'n7':
								return formatNumber7(cellValue);
					}
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
					/* 必须调用mixins中的dispatch方法逐级向父组件发送消息！！ */
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

			handleCurrentPageChange(currentPage) {
				this.currentPage = currentPage
				if (!!this.widget.options.dsEnabled && !!this.widget.options.dsName) {
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

			//--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
			/* 提示：用户可自行扩充这些方法！！！ */

			/**
			 * 设置表格列
			 * @param tableColumns
			 */
			setTableColumns(tableColumns) {
				this.widget.options.tableColumns = tableColumns
				this.$nextTick(() => {
					this.$refs.dataTable.doLayout()  //防止行列显示错位！！
				})
			},

			/**
			 * 设置表格列（为了兼容文档错误，setTableColumn应为setTableColumns）
			 * @param tableColumns
			 */
			setTableColumn(tableColumns) {
				this.setTableColumns(tableColumns)
			},

			/**
			 * 从数据源加载表格列
			 * @param localDsv 本地数据源变量DSV
			 * @param dsName 数据源名称
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
			 * 动态设置表格列的隐藏或显示
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
						this.$refs.dataTable.doLayout()  //防止行列显示错位！！
					})
				}
			},

			/**
			 * 获取表格数据
			 */
			getTableData() {
				return this.widget.options.tableData
			},

			/**
			 * 设置表格数据
			 * @param tableData
			 */
			setTableData(tableData) {
				this.widget.options.tableData = tableData
			},

			/**
			 * 从数据源加载表格数据
			 * @param localDsv 本地数据源变量DSV
			 * @param dsName 数据源名称，不传此值，则使用dsName属性绑定的数据源
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
			 * 设置表格分页
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
			 * 获取选中行数据，格式为对象数组
			 * @returns {[]}
			 */
			getSelectedRow() {
				return this.$refs.dataTable.selection
			},

			/**
			 * 获取选中行索引，格式为数组
			 * @returns {[]}
			 */
			getSelectedIndex() {
				return this.selectedIndices
			},

			//--------------------- 以上为组件支持外部调用的API方法 end ------------------//

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
