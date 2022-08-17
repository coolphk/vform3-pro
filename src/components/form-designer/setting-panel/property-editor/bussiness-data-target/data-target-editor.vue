<template>

  <el-form-item :label="i18nt('designer.setting.dataTarget')">
    <el-button @click="showDataTargetDialog=true">{{ buttonText }}</el-button>
    <data-target-drawer v-if="showDataTargetDialog" v-model="showDataTargetDialog" :selected-widget="selectedWidget"
                        :designer="designer"
                        :option-model="optionModel"></data-target-drawer>
  </el-form-item>

</template>

<script>
import i18n from "@/utils/i18n"
import {ref} from "vue";
import {isEmptyObj} from "@/utils/util";
import DataTargetDrawer from "./componets/data-target-drawer";


export default {
  name: "dataTarget-editor",
  components: {DataTargetDrawer},
  mixins: [i18n],
  setup(props, ctx) {
    //显示数据目标
    const showDataTargetDialog = ref(false)

    return {
      showDataTargetDialog,
    }
  },
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  computed: {
    buttonText() {
      return this.optionModel.dataTarget?.checkedNodes?.length > 0 || !isEmptyObj(this.optionModel.dataTarget?.bindMap) ? '已绑定' : '编辑'
    }
  }
}
</script>

<style scoped>

</style>
