<template>

  <div class="ds-list">
    <template v-if="!!formConfig.dataSources && (formConfig.dataSources.length > 0)">
    <el-descriptions v-for="(ds, dsIdx) in formConfig.dataSources"
                     :column="1" size="small" border>
      <template #title>
        <span :title="ds.description">{{ds.uniqueName}}</span>
      </template>
      <template #extra>
        <el-button type="primary" icon="el-icon-edit" plain circle
                   size="small" @click="editDataSource(dsIdx)"></el-button>
        <el-button type="danger" icon="el-icon-delete" plian circle
                   size="small" @click="deleteDataSource(dsIdx)"></el-button>
      </template>
      <el-descriptions-item>
        <template #label>
          <div :title="ds.requestURL">
            <el-icon><platform /></el-icon></div>
        </template>
        {{ds.requestURL}}</el-descriptions-item>

      <!--
      <el-descriptions-item label="">{{ds.description}}</el-descriptions-item>
      -->
    </el-descriptions>
    </template>
    <template v-else>
      <el-empty :description="i18nt('designer.setting.noDataSource')"></el-empty>
    </template>

    <div class="ds-button-wrapper">
      <el-button type="primary" icon="el-icon-plus" plain round @click="addDataSource">
        {{i18nt('designer.setting.addDataSource')}}</el-button>
    </div>
  </div>

  <el-drawer :title="i18nt('designer.setting.dataSourceSetting')" direction="rtl" v-model="showDataSourceDialogFlag" :modal="true" :size="820"
             :destroy-on-close="true" :append-to-body="false" :close-on-click-modal="false" :close-on-press-escape="false"
             custom-class="ds-setting-drawer header-small-mb">
    <template #default>
      <el-form :model="dsModel" :rules="formRules" ref="dsForm"
               label-width="160px" label-position="left" class="ds-form">
        <el-form-item :label="i18nt('designer.setting.dsUniqueName')" prop="uniqueName">
          <el-input v-model="dsModel.uniqueName"></el-input>
        </el-form-item>
        <el-row style="width: 100%">
          <el-col :span="20">
            <el-form-item :label="i18nt('designer.setting.dsRequestURL')" prop="requestURL">
              <el-input v-model="dsModel.requestURL"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label-width="0" prop="requestURLType" class="no-left-margin">
              <el-select v-model="dsModel.requestURLType" :placeholder="i18nt('designer.setting.dsRequestURLType')">
                <el-option :label="i18nt('designer.setting.dsURLStringType')" value="String"></el-option>
                <el-option :label="i18nt('designer.setting.dsURLVariableType')" value="Variable"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="i18nt('designer.setting.dsDescription')" prop="description">
          <el-input type="textarea" v-model="dsModel.description" :rows="2"></el-input>
        </el-form-item>
        <el-form-item :label="i18nt('designer.setting.dsRequestMethod')" prop="requestMethod">
          <el-radio-group v-model="dsModel.requestMethod">
            <el-radio-button label="get">get</el-radio-button>
            <el-radio-button label="post">post</el-radio-button>
            <el-radio-button label="put">put</el-radio-button>
            <el-radio-button label="delete">delete</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="i18nt('designer.setting.dsRequestHeaders')">
          <el-row v-for="(rh, hIdx) in dsModel.headers" class="rh-row" :gutter="8">
            <el-col :span="8">
              <el-form-item :prop="'headers.' + hIdx + '.name'" :rules="nameRules" :label-width="0">
                <el-input v-model="rh.name" :placeholder="i18nt('designer.setting.dsRequestNameInputPlaceholder')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item :prop="'headers.' + hIdx + '.type'" :label-width="0">
                <el-select v-model="rh.type" :placeholder="i18nt('designer.setting.dsRequestTypeInputPlaceholder')">
                  <el-option :label="i18nt('designer.setting.dsRequestValueStringType')" value="String"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueNumberType')" value="Number"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueBooleanType')" value="Boolean"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueVariableType')" value="Variable"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :prop="'headers.' + hIdx + '.value'" :rules="valueRules" :label-width="0">
                <el-input v-model="rh.value" :placeholder="i18nt('designer.setting.dsRequestValueInputPlaceholder')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-button icon="el-icon-delete" plain circle @click="deleteRequestHeader(hIdx)"></el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-button type="text" icon="el-icon-plus" @click="addRequestHeader">
                {{i18nt('designer.setting.addRequestHeader')}}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="i18nt('designer.setting.dsRequestParams')">
          <el-row v-for="(rp, pIdx) in dsModel.params" class="rd-row" :gutter="8">
            <el-col :span="8">
              <el-form-item :prop="'params.' + pIdx + '.name'" :rules="nameRules" :label-width="0">
                <el-input v-model="rp.name" :placeholder="i18nt('designer.setting.dsRequestNameInputPlaceholder')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item :prop="'params.' + pIdx + '.type'" :label-width="0">
                <el-select v-model="rp.type" :placeholder="i18nt('designer.setting.dsRequestTypeInputPlaceholder')">
                  <el-option :label="i18nt('designer.setting.dsRequestValueStringType')" value="String"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueNumberType')" value="Number"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueBooleanType')" value="Boolean"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueVariableType')" value="Variable"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :prop="'params.' + pIdx + '.value'" :rules="valueRules" :label-width="0">
                <el-input v-model="rp.value" :placeholder="i18nt('designer.setting.dsRequestValueInputPlaceholder')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-button icon="el-icon-delete" plain circle @click="deleteRequestParam(pIdx)"></el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-button type="text" icon="el-icon-plus" @click="addRequestParam">
                {{i18nt('designer.setting.addRequestParam')}}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="i18nt('designer.setting.dsRequestData')">
          <el-row v-for="(rd, dIdx) in dsModel.data" class="rd-row" :gutter="8">
            <el-col :span="8">
              <el-form-item :prop="'data.' + dIdx + '.name'" :rules="nameRules" :label-width="0">
                <el-input v-model="rd.name" :placeholder="i18nt('designer.setting.dsRequestNameInputPlaceholder')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item :prop="'data.' + dIdx + '.type'" :label-width="0">
                <el-select v-model="rd.type" :placeholder="i18nt('designer.setting.dsRequestTypeInputPlaceholder')">
                  <el-option :label="i18nt('designer.setting.dsRequestValueStringType')" value="String"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueNumberType')" value="Number"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueBooleanType')" value="Boolean"></el-option>
                  <el-option :label="i18nt('designer.setting.dsRequestValueVariableType')" value="Variable"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :prop="'data.' + dIdx + '.value'" :rules="valueRules" :label-width="0">
                <el-input v-model="rd.value" :placeholder="i18nt('designer.setting.dsRequestValueInputPlaceholder')"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-button icon="el-icon-delete" plain circle @click="deleteRequestData(dIdx)"></el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-button type="text" icon="el-icon-plus" @click="addRequestData">
                {{i18nt('designer.setting.addRequestData')}}</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <el-collapse v-model="activeNames">
          <el-collapse-item :title="i18nt('designer.setting.dsConfigHandlerTitle')" name="1" class="ch-collapse">
            <el-alert type="info" :closable="false" title="(config, isSandbox, DSV) => {"></el-alert>
            <code-editor :mode="'javascript'" :readonly="false" v-model="dsModel.configHandlerCode" ref="chEditor"></code-editor>
            <el-alert type="info" :closable="false" title="}"></el-alert>
          </el-collapse-item>
          <el-collapse-item :title="i18nt('designer.setting.dsDataHandlerTitle')" name="2" class="dh-collapse">
<!--            <el-alert type="info" :closable="false" title="(result, widget, form) => {"></el-alert>-->
            <el-alert type="info" :closable="false" title="(result, isSandbox, DSV) => {"></el-alert>
            <code-editor :mode="'javascript'" :readonly="false" v-model="dsModel.dataHandlerCode" ref="dhEditor"></code-editor>
            <el-alert type="info" :closable="false" title="}"></el-alert>
          </el-collapse-item>
          <el-collapse-item :title="i18nt('designer.setting.dsErrorHandlerTitle')" name="3" class="eh-collapse">
<!--            <el-alert type="info" :closable="false" title="(error, widget, form) => {"></el-alert>-->
            <el-alert type="info" :closable="false" title="(error, isSandbox, DSV, $message) => {"></el-alert>
            <code-editor :mode="'javascript'" :readonly="false" v-model="dsModel.errorHandlerCode" ref="ehEditor"></code-editor>
            <el-alert type="info" :closable="false" title="}"></el-alert>
          </el-collapse-item>
        </el-collapse>

      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button style="float: left" type="primary" plain @click="testDataSource">
          {{i18nt('designer.setting.testDataSource')}}</el-button>
        <el-button @click="showDataSourceDialogFlag = false">
          {{i18nt('designer.hint.cancel')}}</el-button>
        <el-button type="primary" @click="saveDataSource">
          {{i18nt('designer.hint.confirm')}}</el-button>
      </div>
    </template>
  </el-drawer>

  <div v-if="showTestDataSourceDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
    <el-dialog :title="i18nt('designer.setting.testDataSource')" v-model="showTestDataSourceDialogFlag"
               :show-close="true" custom-class="drag-dialog small-padding-dialog"
               :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
      <el-alert type="info" :closable="false" :title="i18nt('designer.setting.dsvTitle')"></el-alert>
      <code-editor :mode="'json'" :readonly="false" v-model="dsvJson" class="dsv-json-editor"></code-editor>
      <div class="footer-button">
        <el-button type="primary" @click="doDataSourceRequest">{{i18nt('designer.setting.executeDataSource')}}</el-button>
        <el-button type="primary" plain @click="clearRequestResult">{{i18nt('designer.setting.clearRequestResult')}}</el-button>
        <el-button  @click="showTestDataSourceDialogFlag = false">
          {{i18nt('designer.hint.closePreview')}}</el-button>
      </div>
      <el-alert type="info" :closable="false" :title="i18nt('designer.setting.dsRequestResult')"></el-alert>
      <code-editor :mode="'json'" :readonly="true" v-model="dsResultJson" ref="dsResultEditor"></code-editor>
    </el-dialog>
  </div>

</template>

<script>
  import i18n from "@/utils/i18n"
  import CodeEditor from "@/components/code-editor/index"
  import {deepClone, generateId, runDataSourceRequest} from "@/utils/util"
  import { Platform } from '@element-plus/icons-vue'

  export default {
    name: "data-source-setting",
    mixins: [i18n],
    inject: ['getGlobalDsv'],
    components: {
      Platform,
      CodeEditor,
    },
    props: {
      designer: Object,
      formConfig: Object,
    },
    data() {
      return {
        activeNames: ['2'],

        dsModel: {
          dataSourceId: null,
          uniqueName: '',
          requestURL: '',
          requestURLType: 'String',
          description: '',
          headers: [
          ],
          params: [
          ],
          data: [
          ],
          requestMethod: 'get',
          configHandlerCode: '  return config',
          dataHandlerCode: '  return result.data.data;',
          errorHandlerCode: '  $message.error(error.message);',
        },
        curEditDSIdx: -1,

        formRules: {
          uniqueName: [
            { required: true, trigger: ['blur', 'change'], message: this.i18nt('designer.setting.fieldValueRequired')}
          ],
          requestURL: [
            { required: true, trigger: ['blur', 'change'], message: this.i18nt('designer.setting.fieldValueRequired') }
          ],
          requestMethod: [
            { required: true, trigger: ['blur', 'change'], message: this.i18nt('designer.setting.fieldValueRequired') }
          ]
        },
        nameRules: [
          { required: true, trigger: ['blur', 'change'], message: this.i18nt('designer.setting.fieldValueRequired') },
        ],
        valueRules: [
          { required: true, trigger: ['blur', 'change'], message: this.i18nt('designer.setting.fieldValueRequired') },
          { validator: this.validateValueInput, trigger: ['blur', 'change'] }
        ],

        showDataSourceDialogFlag: false,

        dsvJson: '{\n  \n}',
        dsResultJson: '',
        showTestDataSourceDialogFlag: false
      }
    },
    methods: {
      validateValueInput(rule, value, callback) {
        let ruleField = rule.field
        let fieldType = ruleField.substring(0, ruleField.indexOf('.'))
        let fieldIdx = Number(ruleField.substring(ruleField.indexOf('.') + 1, ruleField.lastIndexOf('.')))
        let valueType = this.dsModel[fieldType][fieldIdx].type
        if (valueType === 'Number') {
          if (isNaN(value)) {
            callback(new Error(this.i18nt('designer.setting.dsRequestNumberTypeError')))
          } else {
            callback()
          }
        } else if (valueType === 'Boolean') {
          if ((value.toLowerCase() === 'true') || (value.toLowerCase() === 'false') || (value.toLowerCase() === 'null') ||
             (value === '1') || (value === '0')) {
            callback()
          } else {
            callback(new Error(this.i18nt('designer.setting.dsRequestBooleanTypeError')))
          }
        } else {
          callback()
        }
      },

      addDataSource() {
        this.curEditDSIdx = -1
        this.dsModel = new Object({})
        this.dsModel.dataSourceId = null
        this.dsModel.uniqueName = ''
        this.dsModel.requestURL = ''
        this.dsModel.requestURLType = 'String'
        this.dsModel.requestMethod = 'get'
        this.dsModel.description = ''
        this.dsModel.headers = []
        this.dsModel.params = []
        this.dsModel.data = []
        this.dsModel.configHandlerCode = '  return config'
        this.dsModel.dataHandlerCode = '  return result.data.data;'
        this.dsModel.errorHandlerCode = '  $message.error(error.message);'

        this.showDataSourceDialogFlag = true
      },

      editDataSource(dsIdx) {
        this.dsModel = deepClone(this.formConfig.dataSources[dsIdx])
        this.curEditDSIdx = dsIdx
        this.showDataSourceDialogFlag = true
      },

      saveDataSource() {
        this.$refs['dsForm'].validate((valid, fields) => {
          if (!valid) {
            this.$message.error(this.i18nt('designer.setting.dsValidationError'))
            return
          }

          this.dsModel.dataSourceId = this.dsModel.dataSourceId || 'ds' + generateId()
          let curDSId = this.dsModel.dataSourceId
          let curDSName = this.dsModel.uniqueName
          let sameNameFlag = false
          this.formConfig.dataSources.map(dsItem => { // 检查名称重复
            if ((dsItem.uniqueName === curDSName) && (dsItem.dataSourceId !== curDSId)) {
              sameNameFlag = true
            }
          })
          if (sameNameFlag) {
            this.$message.error(this.i18nt('designer.setting.dsDuplicatedNameError'))
            return
          }

          if (this.curEditDSIdx >= 0) {
            this.formConfig.dataSources.splice(this.curEditDSIdx, 1, this.dsModel)
            this.showDataSourceDialogFlag = false
          } else {
            this.formConfig.dataSources.push(this.dsModel)
            this.showDataSourceDialogFlag = false
          }

          //TODO: 触发表单历史变动
        })
      },

      deleteDataSource(dsIdx) {
        this.$confirm(this.i18nt('designer.setting.deleteDataSourceHint'), this.i18nt('render.hint.prompt'), {
          confirmButtonText: this.i18nt('render.hint.confirm'),
          cancelButtonText: this.i18nt('render.hint.cancel')
        }).then(() => {
          this.formConfig.dataSources.splice(dsIdx, 1)
        }).catch(error => {
          //this.$message.error(error)
        })
      },

      addRequestHeader() {
        this.dsModel.headers.push({
          name: '',
          type: 'String',
          value: ''
        })
      },

      deleteRequestHeader(idx) {
        this.dsModel.headers.splice(idx, 1)
      },

      addRequestParam() {
        this.dsModel.params.push({
          name: '',
          type: 'String',
          value: ''
        })
      },

      deleteRequestParam(idx) {
        this.dsModel.params.splice(idx, 1)
      },

      addRequestData() {
        this.dsModel.data.push({
          name: '',
          type: 'String',
          value: ''
        })
      },

      deleteRequestData(idx) {
        this.dsModel.data.splice(idx, 1)
      },

      testDataSource() {
        let globalDsv = this.getGlobalDsv() || {}
        this.dsvJson = JSON.stringify(globalDsv, null, '  ')
        this.showTestDataSourceDialogFlag = true
      },

      async doDataSourceRequest() {
        let dsvObj = JSON.parse(this.dsvJson)
        let dsResult = await runDataSourceRequest(this.dsModel, dsvObj, true, this.$message)
        this.$refs.dsResultEditor.setValue( JSON.stringify(dsResult, null, '  ') )
      },

      clearRequestResult() {
        this.$refs.dsResultEditor.setValue('')
      },

    },
  }
</script>

<style lang="scss" scoped>
  /*:deep(.ds-setting-drawer) { !* 必须加上:deep，否则不生效 *!*/
  /*  right: 320px !important;*/
  /*}*/

  .ds-list {
    :deep(.el-descriptions) {
      width: 284px;
      overflow-x: hidden;
      margin-bottom: 15px;
      padding: 8px;
      background: #f5f7fa;
    }

    :deep(.el-descriptions__title) {
      font-weight: normal;
    }
  }

  .ds-button-wrapper {
    text-align: center;
    margin-top: 12px;
  }

  .ds-form {
    :deep(.el-form-item.is-required>.el-form-item__label:before) {
      content: '' !important;
      margin-right: 0 !important;
    }

    :deep(.el-form-item.is-required>.el-form-item__label:after) {
      content: '*' !important;
      color: var(--el-color-danger);
      font-weight: bold;
    }
  }

  .no-left-margin :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .rh-row, .rd-row {
    :deep(.el-col) {
      margin: 5px 0;
    }
  }

  .ch-collapse :deep(.ace-editor) {
    border: 1px solid #e1e2e3;
    min-height: 120px;
  }

  .dh-collapse :deep(.ace-editor) {
    border: 1px solid #e1e2e3;
    min-height: 220px;
  }

  .eh-collapse :deep(.ace-editor) {
    border: 1px solid #e1e2e3;
    min-height: 120px;
  }

  .dsv-json-editor {
    margin-bottom: 12px;
  }

  .dsv-json-editor :deep(.ace-editor) {
    border: 1px solid #e1e2e3;
    min-height: 120px;
  }

  :deep(.ace-editor) {
    border: 1px solid #e1e2e3;
  }

  .footer-button {
    float: right;
    margin-bottom: 12px;
  }

</style>
