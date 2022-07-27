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
import refMixinDesign from "@/components/form-designer/refMixinDesign";
import FieldComponents from "@/components/form-designer/form-widget/field-widget";
import {loadBussinessSource} from "@/api/bussiness-source";
import {assembleBussinessParams, traverseObj} from "@/utils/data-adapter";
import ContainerItemWrapper from "@/components/form-render/container-item/container-item-wrapper";
import containerItemMixin from "@/components/form-render/container-item/containerItemMixin";
import refMixin from "@/components/form-render/refMixin";
import emitter from "@/utils/emitter";

export default {
  name: "data-wrapper-item",
  mixins: [i18n, containerItemMixin, refMixin, emitter],
  inject: ['refList'],
  components: {
    ContainerItemWrapper,
    ...FieldComponents,
  },
  props: {
    widget: Object,
  },
  computed: {},
  created() {
    this.initRefList()
  },
  mounted() {
    // this.setFormDataWithValueSource()
  },
  methods: {
    /**
     * 根据valueSource获取表单数据并赋值，
     * @param scripts
     */
    setFormDataWithValueSource(scripts) {
      const vs = this.widget?.options?.valueSource
      console.log(222, vs);
      console.log(333, scripts);
      const formData = {}
      traverseObj(vs.bindMap, (Scripts_ID, value) => {
        loadBussinessSource({
          Scripts_ID,
          currentPage: 1,
          pageSize: 10,
          ...scripts[Scripts_ID]?.params
        }).then(res => {
          //读取数据赋值到form表单中，并给bindMap设置默认值
          traverseObj(res.Data.TableData[0], (key, value) => {
            if (vs.bindMap[Scripts_ID][key]) {
              vs.bindMap[Scripts_ID][key]['paramValue'] = value
            }

            if (vs.bindMap[Scripts_ID]?.[key]?.widgetId) {
              formData[vs.bindMap[Scripts_ID][key].widgetId] = value
            }
          })
          this.getFormRef().setFormData(formData)
          console.log(vs.bindMap)
        })
      })
    }
  }
}
</script>

<style scoped>

</style>