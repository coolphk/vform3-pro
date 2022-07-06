<template>

  <el-form-item :label="i18nt('designer.setting.dataTarget')">
    <el-button @click="showDataTargetDialog=true">选择</el-button>
    <data-target-drawer v-if="showDataTargetDialog" v-model="showDataTargetDialog" :selected-widget="selectedWidget"
                        :designer="designer"
                        :option-model="optionModel"></data-target-drawer>
  </el-form-item>

</template>

<script>
import i18n from "@/utils/i18n"
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin"
import {computed, nextTick, onMounted, reactive, ref, toRaw, watch} from "vue";
import {getProcedureParams} from "@/api/data-schema";
import ProcedureSelect from "@/components/form-designer/toolbar-panel/datasource-dialog/procedure-select";
import {getChildren, unflatten} from "@/utils/data-adapter";
import {ElMessage} from "element-plus";
import {isEmptyObj, isTable} from "@/utils/util";
import ContextMenu from "@/components/context-menu"
import DataTargetDrawer from "@/components/form-designer/setting-panel/property-editor/data-target/dataTarget-drawer";


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
}
</script>

<style scoped>

</style>
