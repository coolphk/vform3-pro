<template>
  <el-form-item :label="i18nt('designer.setting.valueSource')">
    <el-button @click="showDataSource=true">{{ buttonText }}</el-button>
    <value-source-drawer v-if="showDataSource" v-model="showDataSource" :designer="designer"
                         :selected-widget="selectedWidget"
                         :option-model="optionModel"/>
  </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {ref} from "vue";
import ValueSourceDrawer
  from "@/components/form-designer/setting-panel/property-editor/bussiness-value-source/value-source-drawer.vue";
import {isEmptyObj} from "@/utils/util";

export default {
  name: "valueSource-editor",
  components: {ValueSourceDrawer},
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const showDataSource = ref(false)
    return {
      showDataSource,
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  computed: {
    buttonText() {
      return isEmptyObj(this.optionModel.valueSource.bindMap) ? '编辑' : '已绑定'
    }

  }
}
</script>

<style scoped lang="scss">

</style>