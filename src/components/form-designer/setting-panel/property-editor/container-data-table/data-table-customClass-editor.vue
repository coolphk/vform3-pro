<template>
  <div>
    <el-form-item :label="i18nt('designer.setting.tableWidth')">
      <el-input v-model="optionModel.tableWidth"></el-input>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.tableHeight')">
      <el-input v-model="optionModel.tableHeight"></el-input>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.customClass')">
      <el-select v-model="optionModel.customClass" multiple filterable allow-create
                 default-first-option>
        <el-option v-for="(item, idx) in cssClassList" :key="idx" :label="item" :value="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.showIndex')">
      <el-switch v-model="optionModel.showIndex"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.showCheckBox')">
      <el-switch v-model="optionModel.showCheckBox"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.showPagination')">
      <el-switch v-model="optionModel.showPagination"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.smallPagination')" v-if="!!optionModel.showPagination">
      <el-switch v-model="optionModel.smallPagination"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.showSummary')">
      <el-switch v-model="optionModel.showSummary"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.stripe')">
      <el-switch v-model="optionModel.stripe"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.rowSpacing')">
      <el-input-number v-model="optionModel.rowSpacing" controls-position="right" :min="0" :max="20"
                       style="width: 100%">
      </el-input-number>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.widgetSize')">
      <el-select v-model="optionModel.tableSize">
        <el-option v-for="item in widgetSizes" :key="item.value" :label="item.label"
                   :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.tableColEdit')">
      <el-button type="primary" plain round @click="openSetting">{{ i18nt('designer.setting.editAction') }}</el-button>
    </el-form-item>
    <el-form-item v-if="!optionModel.dsEnabled" :label="i18nt('designer.setting.tableDataEdit')">
      <el-button type="primary" plain round @click="openTableDataEdit">{{ i18nt('designer.setting.editAction') }}
      </el-button>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.dsEnabled')">
      <el-switch v-model="optionModel.dsEnabled"></el-switch>
    </el-form-item>
    <el-form-item v-if="!!optionModel.dsEnabled" :label="i18nt('designer.setting.dsName')">
      <el-select v-model="optionModel.dsName" filterable clearable>
        <el-option v-for="(item, idx) in dataSourceList" :key="idx" :title="item.description"
                   :label="item.uniqueName" :value="item.uniqueName"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.showButtonsColumn')">
      <el-switch v-model="optionModel.showButtonsColumn"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.buttonsColumnEdit')" v-if="!!optionModel.showButtonsColumn">
      <el-button type="primary" plain round @click="editButtonsColumn">{{ i18nt('designer.setting.editAction') }}
      </el-button>
    </el-form-item>

    <div v-if="dataDialogVisible" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.tableDataEdit')" v-model="dataDialogVisible"
                 :show-close="true" custom-class="drag-dialog small-padding-dialog"
                 :close-on-click-modal="false" :close-on-press-escape="false"
                 :destroy-on-close="true" width="75%">
        <code-editor :mode="'json'" :readonly="false" v-model="tableDataOptions"></code-editor>
        <template #footer>
          <div class="dialog-footer">
            <el-button size="default" type="primary" @click="saveTableData">{{ i18nt('designer.hint.confirm') }}
            </el-button>
            <el-button size="default" @click="dataDialogVisible = false">{{ i18nt('designer.hint.cancel') }}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="dialogVisible" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.tableColEdit')" v-model="dialogVisible"
                 :show-close="true" custom-class="drag-dialog small-padding-dialog"
                 :close-on-click-modal="false" :close-on-press-escape="false"
                 :destroy-on-close="true" width="1180px">
        <el-table :data="compTableColumns" style="width: 100%"
                  :cell-style="{padding:'3px 0'}" height="500" border row-key="columnId" ref="singleTable" stripe>
          <el-table-column type="index" width="42" fixed="left"></el-table-column>
          <el-table-column label="" width="30">
            <i class="iconfont icon-drag drag-option"></i>
          </el-table-column>
          <el-table-column label="columnId" prop="columnId" width="150" v-if="false"></el-table-column>
          <el-table-column :label="i18nt('designer.setting.columnName')" width="150" prop="prop">
            <template #default="scope">
              <el-input v-model="scope.row.prop"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.columnLabel')" width="150" prop="label">
            <template #default="scope">
              <el-input v-model="scope.row.label"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.columnWidth')" width="100" prop="width">
            <template #default="scope">
              <el-input v-model="scope.row.width"></el-input>
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.visibleColumn')" width="70" prop="show">
            <template #default="scope">
              <el-switch v-model="scope.row.show"></el-switch>
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.sortableColumn')" width="70" prop="sortable">
            <template #default="scope">
              <el-switch v-model="scope.row.sortable"></el-switch>
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.fixedColumn')" width="100" prop="fixed">
            <template #default="scope">
              <el-select v-model="scope.row.fixed">
                <el-option value="">false</el-option>
                <el-option value="left">left</el-option>
                <el-option value="right">right</el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.alignTypeOfColumn')" width="100" prop="align">
            <template #default="scope">
              <el-select v-model="scope.row.align">
                <el-option v-for="item in alignOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <!-- <el-table-column label="字段类型" width="100">
            <template #default="scope">
              <el-select v-model="scope.row.fieldType" placeholder="请选择">
                  <el-option v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
              </el-select>
            </template>
          </el-table-column> -->
          <el-table-column :label="i18nt('designer.setting.formatOfColumn')" width="200" prop="formatS">
            <template #default="{row,column,$index}">
              <el-button type="primary" @click="row.showEventDialog=true">编辑事件</el-button>
              <el-dialog v-model="row.showEventDialog" append-to-body>
                <el-alert type="info" :closable="false" title="function(row, column, cellValue, rowIndex) {"></el-alert>
                <code-editor v-if="row.showEventDialog" :mode="'javascript'" :readonly="false" v-model="row.formatS"
                             ref="ecEditor"></code-editor>
                <el-alert type="info" :closable="false" title="}"></el-alert>
              </el-dialog>


              <!--                            <el-select v-model="scope.row.formatS" clearable>
                                            <el-option-group
                                                v-for="group in op"
                                                :key="group.label"
                                                :label="group.label">
                                              <el-option
                                                  v-for="item in group.options"
                                                  :key="item.value"
                                                  :label="item.label"
                                                  :value="item.value">
                                              </el-option>
                                            </el-option-group>
                                          </el-select>-->
            </template>
          </el-table-column>
          <el-table-column :label="i18nt('designer.setting.actionColumn')" width="100" fixed="right" align="center">
            <template #default="scope">
              <el-button :title="i18nt('designer.setting.addTableColumn')" size="small" circle
                         @click="addCol" icon="el-icon-plus"></el-button>
              <el-button :title="i18nt('designer.setting.deleteTableColumn')" size="small" circle
                         @click="handleDelete(scope.$index, scope.row)" icon="el-icon-minus"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <div class="dialog-footer">
            <el-button size="default" type="primary" @click="colSubmit">{{ i18nt('designer.hint.confirm') }}</el-button>
            <el-button size="default" @click="dialogVisible = false">{{ i18nt('designer.hint.cancel') }}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showButtonsEditDialog" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.buttonsColumnEdit')" v-model="showButtonsEditDialog"
                 :show-close="true" custom-class="drag-dialog small-padding-dialog" append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false"
                 :destroy-on-close="true" width="1120px">
        <el-form label-width="110" label-position="left" :model="optionModel">
          <el-row :gutter="8">
            <el-col :span="12">
              <el-form-item prop="buttonsColumnTitle" :label="i18nt('designer.setting.buttonsColumnTitle')">
                <el-input v-model="optionModel.buttonsColumnTitle"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="buttonsColumnWidth" :label="i18nt('designer.setting.buttonsColumnWidth')">
                <el-input-number v-model="optionModel.buttonsColumnWidth"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-divider content-position="left">{{ i18nt('designer.setting.operationButtonsSetting') }}</el-divider>
            </el-col>
          </el-row>
          <draggable v-model="optionModel.operationButtons" item-key="id"
                     v-bind="{ghostClass: 'ghost', handle: '.drag-handler'}">
            <template #item="{ element: btn, index: bIdx }">
              <el-row :gutter="8" class="button-row">
                <el-col :span="1" class="drag-sort-col">
                  <i class="iconfont icon-drag drag-handler"></i>
                </el-col>
                <el-col :span="3">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.name'"
                                :label="i18nt('designer.setting.operationButtonName')" :rules="nameRules">
                    <el-input v-model="btn.name" @focus="onButtonNameFocus"
                              @change="(value) => onButtonNameChange(value, bIdx)"
                              :placeholder="i18nt('designer.setting.operationButtonName')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.label'"
                                :label="i18nt('designer.setting.operationButtonLabel')">
                    <el-input v-model="btn.label"
                              :placeholder="i18nt('designer.setting.operationButtonLabel')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.type'"
                                :label="i18nt('designer.setting.operationButtonType')">
                    <el-select v-model="btn.type" :placeholder="i18nt('designer.setting.operationButtonType')">
                      <el-option value="text">text</el-option>
                      <el-option value="primary">primary</el-option>
                      <el-option value="success">success</el-option>
                      <el-option value="warning">warning</el-option>
                      <el-option value="danger">danger</el-option>
                      <el-option value="info">info</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.size'"
                                :label="i18nt('designer.setting.operationButtonSize')">
                    <el-select v-model="btn.size" :placeholder="i18nt('designer.setting.operationButtonSize')">
                      <el-option value="large">large</el-option>
                      <el-option value="default">default</el-option>
                      <el-option value="small">small</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.round'"
                                :label="i18nt('designer.setting.operationButtonRound')">
                    <el-switch v-model="btn.round"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.hidden'"
                                :label="i18nt('designer.setting.operationButtonHidden')">
                    <el-switch v-model="btn.hidden"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item :prop="'operationButtons.' + bIdx + '.disabled'"
                                :label="i18nt('designer.setting.operationButtonDisabled')">
                    <el-switch v-model="btn.disabled"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <el-button icon="el-icon-delete" plain circle @click="deleteOperationButton(bIdx)"></el-button>
                </el-col>
              </el-row>
            </template>
          </draggable>
          <el-row :gutter="0">
            <el-col :span="4">
              <el-button type="primary" size="default" icon="el-icon-plus"
                         plain round @click="addOperationButton">{{ i18nt('designer.setting.addOperationButton') }}
              </el-button>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button size="default" @click="showButtonsEditDialog = false">{{ i18nt('designer.hint.closePreview') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import i18n from "@/utils/i18n"
import {deepClone, generateId} from "@/utils/util"
import Sortable from "sortablejs"
import CodeEditor from '@/components/code-editor/index'

export default {
  name: "data-table-customClass-editor",
  componentName: 'PropertyEditor',
  mixins: [i18n],
  components: {
    CodeEditor,
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  data() {
    return {
      dialogVisible: false,
      dataDialogVisible: false,
      showButtonsEditDialog: false,
      oldButtonName: '',
      cssClassList: [],
      tableDataOptions: [],
      widgetSizes: [
        {label: 'default', value: ''},
        {label: 'large', value: 'large'},
        {label: 'small', value: 'small'},
      ],
      alignOptions: [
        {
          value: 'left',
          label: 'left'
        }, {
          value: 'center',
          label: 'center'
        }, {
          value: 'right',
          label: 'right'
        },
      ],
      fieldTypeOptions: [
        {
          value: 'text',
          label: 'Text'
        }, {
          value: 'number',
          label: 'Number'
        }, {
          value: 'date',
          label: 'Date'
        },
      ],
      op: [{
        label: 'Date Format',
        options: [
          /*{value: 'd1', label: "yyyy-MM-dd"},
          {value: 'd2', label: "yyyy/MM/dd"},
          {value: 'd3', label: "yyyy年MM月dd日"},*/
          {value: 'd4', label: "yyyy-MM-dd HH:mm:ss"},
          // {value: 'd5', label: "yyyy-MM-dd hh:mm:ss"},
        ]
      }, {
        label: 'Number Format',
        options: [
          /*          {value: 'n1', label: "###,###,###,##0.######"},
                    {value: 'n2', label: "###,###,###,##0.00####"},
                    {value: 'n3', label: "###,###,###,##0.000000"},
                    {value: 'n4', label: "###,###,###,##0.000"},*/
          {value: 'n5', label: "###,###,###,##0.00"},
          /*{value: 'n6', label: "###,###,###,##0"},
          {value: 'n7', label: "###,##0.00##%"},*/
        ]
      }],

      nameRules: [
        {required: true, trigger: ['blur', 'change'], message: this.i18nt('designer.setting.fieldValueRequired')},
      ],
    }
  },
  computed: {
    dataSourceList() {
      if (!this.designer.formConfig || !this.designer.formConfig.dataSources) {
        return []
      } else {
        return this.designer.formConfig.dataSources
      }
    },
    compTableColumns() {
      this.optionModel.tableColumns.map(column => {
        column.showEventDialog = false
        column.formatS = ""
      })
      return this.optionModel.tableColumns
    }
  },
  created() {
    this.cssClassList = deepClone(this.designer.getCssClassList())
    //监听表单css代码改动事件并重新加载！
    this.designer.handleEvent('form-css-updated', (cssClassList) => {
      this.cssClassList = cssClassList
    })
  },
  mounted() {
    // this.dragSort()
  },
  methods: {
    //表格拖动排序
    dragSort() {
      //debugger
      const el = this.$refs.singleTable.$el.querySelectorAll('.el-table__body-wrapper .el-table__body > tbody')[0]
      let tableData = this.optionModel.tableColumns;
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: e => {
          //e.oldIndex为拖动一行原来的位置，e.newIndex为拖动后新的位置
          const targetRow = tableData.splice(e.oldIndex, 1)[0];
          tableData.splice(e.newIndex, 0, targetRow);
          let dragId = tableData[e.newIndex].id;//拖动行的id
          let oneId, twoId
          //拖动行的前一行
          if (tableData[e.newIndex - 1]) {
            oneId = tableData[e.newIndex - 1].id;
          } else {
            oneId = ""
          }
          //拖动行的后一行
          if (tableData[e.newIndex + 1]) {
            twoId = tableData[e.newIndex + 1].id;
          } else {
            twoId = ""
          }
        }
      })

    },

    openTableDataEdit() {
      this.dataDialogVisible = true;
      this.tableDataOptions = JSON.stringify(this.optionModel.tableData, null, '  ')
    },

    saveTableData() {
      try {
        this.optionModel.tableData = JSON.parse(this.tableDataOptions)
        this.dataDialogVisible = false
      } catch (ex) {
        this.$message.error(this.i18nt('designer.hint.invalidOptionsData') + ex.message)
      }
    },

    openSetting() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.dragSort()
      })
    },

    // 确认表格列更改
    colSubmit() {
      this.dialogVisible = false;
    },

    addCol() {
      let newRow = {columnId: new Date().getTime()};
      this.optionModel.tableColumns.push(newRow);
      this.designer.emitHistoryChange()
    },

    handleDelete(index, row) {
      if (this.optionModel.tableColumns.length === 1) {
        this.$message.warning(this.i18nt('designer.setting.onlyOneColumnCannotBeDeleted'))
        return false;
      }
      this.optionModel.tableColumns.splice(index, 1)
    },

    onButtonNameFocus(event) {
      console.log('test', event)
      this.oldButtonName = event.target.value
    },

    onButtonNameChange(newName, btnIdx) {
      let sameNameFlag = false
      this.optionModel.operationButtons.map((tb, tbIdx) => {
        if ((tb.name === newName) && (tbIdx !== btnIdx)) {
          sameNameFlag = true
        }
      })
      if (sameNameFlag) {
        this.$message.error(this.i18nt('designer.setting.operationButtonDuplicatedNameError'))
        this.optionModel.operationButtons[btnIdx].name = this.oldButtonName
      }
    },

    editButtonsColumn() {
      this.showButtonsEditDialog = true
    },

    deleteOperationButton(idx) {
      this.$confirm(this.i18nt('designer.setting.deleteOperationButtonHint'), this.i18nt('render.hint.prompt'), {
        confirmButtonText: this.i18nt('render.hint.confirm'),
        cancelButtonText: this.i18nt('render.hint.cancel')
      }).then(() => {
        this.optionModel.operationButtons.splice(idx, 1)
      }).catch(error => {
        //this.$message.error(error)
      })

    },

    addOperationButton() {
      this.optionModel.operationButtons = this.optionModel.operationButtons || []
      this.optionModel.operationButtons.push({
        name: 'btn' + generateId(),
        label: 'new btn',
        type: 'link',
        size: 'small',
        round: false,
        hidden: false,
        disabled: false,
      })
    },
    getFormatFromRow(index) {
      console.log(this.optionModel.tableColumns[index]);
      return this.optionModel.tableColumns[index]['formatS']
    }
  }
}
</script>

<style lang="scss" scoped>
li.col-item {
  list-style: none;

  span.col-span-title {
    display: inline-block;
    font-size: 13px;
    width: 120px;
  }

  .col-delete-button {
    margin-left: 6px;
  }
}

.panes-setting {
  ul {
    padding-inline-start: 0;
    padding-left: 0; /* 重置IE11默认样式 */
    margin: 0;
  }

  .drag-option {
    cursor: move;
  }

  li.ghost {
    background: #fff;
    border: 2px dotted $--color-primary;
  }
}

.small-padding-dialog {
  :deep(.el-dialog__body) {
    padding: 6px 15px 12px 15px !important;
  }

  :deep(.ace-container) {
    border: 1px solid #DCDFE6;
  }

  .dialog-footer {
    text-align: center;
  }
}

.button-row {
  border-bottom: 1px solid #e1e2e3;
  margin-bottom: 12px;
}

.drag-sort-col {
  padding-top: 8px;
  cursor: move;
}

</style>
