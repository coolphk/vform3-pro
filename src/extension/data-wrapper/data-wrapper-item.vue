<template>
  <container-item-wrapper :widget="widget">
    <div :key="widget.id" v-show="!widget.options.hidden" cl="sub-form-container">
      <template v-if="!!widget.widgetList && (widget.widgetList.length > 0)">
        <template v-for="(subWidget, swIdx) in widget.widgetList">
          <template v-if="'container' === subWidget.category">
            <component :is="subWidget.type + '-item'" :widget="subWidget" :key="swIdx" :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget">
              <!-- 递归传递插槽！！！ -->
              <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
              </template>
            </component>
          </template>
          <template v-else>
            <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="null" :key="swIdx"
                       :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget">
              <!-- 递归传递插槽！！！ -->
              <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
              </template>
            </component>
          </template>
        </template>
      </template>
    </div>
  </container-item-wrapper>
</template>

<script>
import i18n from "@/utils/i18n";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";
import {loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams, filterPostParam, traverseObj} from "@/utils/data-adapter";
import ContainerItemWrapper from "@/components/form-render/container-item/container-item-wrapper";
import containerItemMixin from "@/components/form-render/container-item/containerItemMixin";
import refMixin from "@/components/form-render/refMixin";
import emitter from "@/utils/emitter";
import {traverseFieldWidgets} from "@/utils/util";
import {execProcedure, getProcedureParams} from "@/api/data-schema";
import {ElMessage} from "element-plus";
import {setLinkWidgetValueToScriptParams} from "@/utils/linkWidgetUtils";

export default {
  name: "data-wrapper-item",
  mixins: [i18n, containerItemMixin, refMixin, emitter],
  inject: ['refList', 'sfRefList', 'globalModel', 'getFormConfig', 'getGlobalDsv'],
  components: {
    ContainerItemWrapper,
    ...FieldComponents,
  },
  props: {
    widget: Object,
  },
  data() {
    return {
      params: {}
    }
  },
  computed: {},
  created() {
    this.initRefList()
  },
  mounted() {
    // this.setFormDataWithValueSource(this.params)
    this.handleOnMounted()
  },
  methods: {
    handleOnMounted() {
      if (!!this.widget.options.onMounted) {
        let mountFunc = new Function(this.widget.options.onMounted)
        mountFunc.call(this)
      }
    },
    /**
     * 根据valueSource获取表单数据并赋值，
     *
     */
    // setFormDataWithValueSource(scriptParams) {
    loadDataFromBussiness() {
      // console.log('setFormDataWithValueSource');
      const vs = this.widget?.options?.valueSource
      const formData = {}
      traverseObj(vs.bindMap, (Scripts_ID, bindvalue) => {
        setLinkWidgetValueToScriptParams(bindvalue.scriptParams, this.getWidgetRef)
        loadBussinessSource(assembleBussinessParams({
          scriptId: Scripts_ID,
          params: bindvalue.scriptParams,
          pageSize: 1
        })).then(res => {
          //读取数据赋值到form表单中，并给bindMap设置默认值
          traverseObj(res.Data.TableData?.[0], (key, value) => {
            if (bindvalue['scriptFields'][key]) {
              bindvalue['scriptFields'][key]['paramValue'] = value
            }
            if (bindvalue?.['scriptFields']?.[key]?.widgetId) {
              formData[bindvalue['scriptFields'][key].widgetId] = value
            }
          })
          this.getFormRef().setFormData(formData)
        })
      })
    },

    getChildWidgetsValue() {
      const formModel = {}
      traverseFieldWidgets(this.widget.widgetList, (widget) => {
        if (widget.options.valueKey) {
          formModel[widget.id] = this.formModel[widget.id][widget.options.valueKey]
        } else {
          formModel[widget.id] = this.formModel[widget.id]
        }

      })
      console.log(this.formModel, formModel);
      return formModel
    },

    setBussinessSourceParams(params) {
      this.params = params
    },

    saveDataWrapper() {
      /**
       * 从表单中的组件取值，如果没有和绑定关系匹配的组件则获取绑定关系默认值
       * @param formData
       * @param widgetId
       * @returns {*}
       */
      function getParamVALUE(formData, widgetId) {
        // return formData[sv.widgetId] ? formData[sv.widgetId] : sv.paramValue
        return formData?.[widgetId]
      }

      const wrapperData = this.getChildWidgetsValue()
      const postData = {}
      traverseObj(this.widget.options.valueSource.bindMap, (Scripts_ID, value) => {
        traverseObj(value?.scriptFields, (sk, sv) => {
          sv?.params?.map(param => {
            postData[param.procedureId] = {
              procedureName: param.procedureName,
              //替换params值，用来生成最后exec接口的params参数。
              params: postData?.[param.procedureId]?.params ? [...postData[param.procedureId].params, {
                ...param,
                Param_TestVALUE: getParamVALUE(wrapperData, sv.widgetId) || param.defaultValue || sv.paramValue || param.Param_TestVALUE
                //赋值顺序，1、绑定关系中的控件值，2、绑定关系默认值 3、当前存储过程对应参数值 4、绑定关系中存储过程对应参数值
              }] : [{
                ...param,
                Param_TestVALUE: getParamVALUE(wrapperData, sv.widgetId) || param.defaultValue || sv.paramValue || param.Param_TestVALUE
              }],
            }
          })
        })
      })

      traverseObj(postData, (procedureId, procedure) => {
        getProcedureParams(procedure.procedureName, "", 1).then(res => {
          const procedureParams = res.Data
          console.log('getProcedureParams', procedureParams);
          //获取xml结构
          let postParams = procedureParams.filter(item => item.Param_ObjType === 'object' || item.Param_ObjType === 'array' || item.Param_isXML === '1')

          //比对绑定关系与存储过程参数，将相同的进行替换
          procedureParams.map(item => {
            const newItem = procedure.params.find(postItem => postItem.Param_ID === item.Param_ID)
            if (newItem) {
              // console.log(procedure)
              postParams.push(newItem)
            }
          })
          //过滤无用字段，减少提交数据大小
          postParams = postParams.map(item => {
            return filterPostParam(item)
          })
          console.log('execProcedure postParams', postParams);
          execProcedure({
            procedureID: procedureId,
            procedureName: procedure.procedureName,
            params: postParams
          }).then(res => {
            if (res.Status) {
              ElMessage.success('保存成功!')
            }
            console.log('execProcedure', res);
          })
        })
      })
    }
  }
}
</script>

<style scoped>

</style>