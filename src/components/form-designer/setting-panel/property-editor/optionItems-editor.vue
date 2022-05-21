<template>
  <el-form-item label-width="0">
    <el-divider class="custom-divider-margin-top">{{i18nt('designer.setting.optionsSetting')}}</el-divider>
  </el-form-item>
  <el-form-item :label="i18nt('designer.setting.labelKeyName')">
    <el-input v-model="optionModel.labelKey"></el-input>
  </el-form-item>
  <el-form-item :label="i18nt('designer.setting.valueKeyName')">
    <el-input v-model="optionModel.valueKey"></el-input>
  </el-form-item>
  <el-form-item v-if="hasConfig('childrenKey')" :label="i18nt('designer.setting.childrenKeyName')">
    <el-input v-model="optionModel.childrenKey"></el-input>
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
  <el-form-item v-if="!optionModel.dsEnabled" label-width="0">
    <option-items-setting :designer="designer" :selected-widget="selectedWidget"></option-items-setting>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"
  import OptionItemsSetting from "@/components/form-designer/setting-panel/option-items-setting"
  import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";

  export default {
    name: "optionItems-editor",
    mixins: [i18n, propertyMixin],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    components: {
      OptionItemsSetting,
    },
    computed: {
      dataSourceList() {
        if (!this.designer.formConfig || !this.designer.formConfig.dataSources) {
          return []
        } else {
          return this.designer.formConfig.dataSources
        }
      },

    },
  }
</script>

<style scoped>

</style>
