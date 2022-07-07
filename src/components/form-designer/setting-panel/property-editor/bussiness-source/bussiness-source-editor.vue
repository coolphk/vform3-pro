<template>
  <el-form-item :label="i18nt('designer.setting.bussinessSource')">
    <el-button @click="showDataSource=true">{{ buttonText }}</el-button>
    <bussiness-source-drawer v-if="showDataSource" v-model="showDataSource" :designer="designer"
                             :selected-widget="selectedWidget"
                             :option-model="optionModel"/>
  </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {ref} from "vue";
import BussinessSourceDrawer
  from "@/components/form-designer/setting-panel/property-editor/bussiness-source/bussiness-source-drawer";

export default {
  name: "bussinessSource-editor",
  components: {BussinessSourceDrawer},
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
      return this.optionModel.bussinessSource.currentNodeKey ? '已绑定' : '编辑'
    }

  }
}
</script>

<style scoped lang="scss">

</style>