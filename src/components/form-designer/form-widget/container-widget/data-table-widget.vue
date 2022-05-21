<template>

	<container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
		:index-of-parent-list="indexOfParentList">
		<div :key="widget.id" class="collapse-container data-table-container"
			:class="{'selected': selected}" @click.stop="selectWidget(widget)">

			<el-table :data="widget.options.tableData" :class="[customClass]"
								:height="widget.options.tableHeight" :style="{'width': widget.options.tableWidth}"
								:border="widget.options.border" :show-summary="widget.options.showSummary"
								:size="widgetSize" @click.native.stop="selectWidget(widget)" :stripe="widget.options.stripe"
								:cell-style="{padding: widget.options.rowSpacing + 'px 0'}">

				<el-table-column v-if="widget.options.showIndex" type="index" width="50" fixed="left"></el-table-column>
				<el-table-column v-if="widget.options.showCheckBox" type="selection"
												 :width="!widget.options.showSummary ? 42: 53" fixed="left"></el-table-column>

				<template v-for="(item, index) in widget.options.tableColumns">
					<el-table-column v-if="item.show !== false"
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
							<template v-for="(ob, idx) in widget.options.operationButtons">
								<el-button v-if="!ob.hidden" :type="ob.type" :size="ob.size" :round="ob.round" :disabled="ob.disabled"
													 :class="['data-table-' + ob.name + '-button']">
									{{ob.label}}</el-button>
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
										 @current-change="handleCurrentPageChange"
			>
			</el-pagination>

		</div>
	</container-wrapper>

</template>

<script>
	import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper"
	import emitter from '@/utils/emitter'
  import i18n from "@/utils/i18n"
	import {formatDate1, formatDate2, formatDate3, formatDate4, formatDate5,
					formatNumber1, formatNumber2, formatNumber3, formatNumber4,
					formatNumber5, formatNumber6, formatNumber7} from "@/utils/format"
	import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
	import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin"
	import refMixinDesign from "@/components/form-designer/refMixinDesign"

  export default {
    name: "DataTableWidget",
    componentName: 'DataTableWidget',
    mixins: [i18n, containerMixin, refMixinDesign],
		inject: ['refList'],
		components: {
		  ContainerWrapper,
		  ...FieldComponents,
		},
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
				}]
			}
		},
    props: {
			widget: Object,
			parentWidget: Object,
			parentList: Array,
			indexOfParentList: Number,
			designer: Object,

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
    created() {
			this.initRefList()
    },
		mounted() {
		  //
		},
    beforeDestroy() {
      //
    },
		computed: {
    	paginationLayout() {
				return !!this.widget.options.smallPagination ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
			},

			selected() {
			  return this.widget.id === this.designer.selectedId
			},

			customClass() {
			  return this.widget.options.customClass || ''
			},

			widgetSize() {
				return this.widget.options.tableSize || "default"
			},

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
				if(!!column.formatS && !!column.show) {
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

			handlePageSizeChange(pageSize) {
				//
			},

			handleCurrentPageChange(currentPage) {
				//
			},

    }
  }
</script>

<style lang="scss" scoped>
	.collapse-container {
	  //padding: 5px;
	  margin: 2px;

	  .form-widget-list {
	    min-height: 28px;
	  }
	}

	.collapse-container.selected {
	  outline: 2px solid $--color-primary !important;
	}

	.data-table-container {
		:deep(.el-scrollbar__view)  {
			overflow-x: auto !important;  /* el-table默认显示水平滚动条！！ */
			height: 100%;  /* 水平滚动条固定在表格底部显示！！ */
		}
	}

	:deep(.el-collapsed__header) {
	  padding: 10px 12px;
	}

</style>
