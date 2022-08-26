<template>
  <container-item-wrapper :widget="widget">
    <div :key="widget.id" v-show="!widget.options.hidden" class="sub-form-container">
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
import {filterPostParam, traverseObj} from "@/utils/data-adapter";
import ContainerItemWrapper from "@/components/form-render/container-item/container-item-wrapper";
import containerItemMixin from "@/components/form-render/container-item/containerItemMixin";
import refMixin from "@/components/form-render/refMixin";
import emitter from "@/utils/emitter";
import {traverseFieldWidgets} from "@/utils/util";
import {execProcedure, getProcedureParams} from "@/api/data-schema";
import {ElMessage} from "element-plus";

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
  },
  methods: {
    /**
     * 根据valueSource获取表单数据并赋值，
     * @param scriptParams
     */
    setFormDataWithValueSource(scriptParams) {
      console.log('setFormDataWithValueSource', scriptParams);
      const vs = this.widget?.options?.valueSource
      console.log(222, vs);
      const formData = {}
      traverseObj(vs.bindMap, (Scripts_ID, value) => {
        loadBussinessSource({
          Scripts_ID,
          currentPage: 1,
          pageSize: 10,
          ...scriptParams[Scripts_ID]?.params
        }).then(res => {
          //读取数据赋值到form表单中，并给bindMap设置默认值
          traverseObj(res.Data.TableData?.[0], (key, value) => {
            if (vs.bindMap[Scripts_ID][key]) {
              //todo 修改初始值
              vs.bindMap[Scripts_ID]['scriptFields'][key]['paramValue'] = value
            }
            if (vs.bindMap[Scripts_ID]?.['scriptFields']?.[key]?.widgetId) {
              formData[vs.bindMap[Scripts_ID]['scriptFields'][key].widgetId] = value
            }
          })
          this.getFormRef().setFormData(formData)
          console.log(vs.bindMap)
        })
      })
    },

    getChildWidgetsValue() {
      const formModel = {}
      traverseFieldWidgets(this.widget.widgetList, (widget) => {
        formModel[widget.id] = this.formModel[widget.id]
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
       * @param sv
       * @returns {*}
       */
      function getParamVALUE(formData, sv) {
        return formData[sv.widgetId] ? formData[sv.widgetId] : sv.paramValue
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
                Param_TestVALUE: getParamVALUE(wrapperData, sv) || param.defaultValue || param.Param_TestVALUE
              }] : [{
                ...param,
                Param_TestVALUE: getParamVALUE(wrapperData, sv) || param.defaultValue || param.Param_TestVALUE
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