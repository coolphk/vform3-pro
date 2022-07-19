<template>
  <div style="margin:8px 8px 0 8px;display: flex;flex-direction: column;height: 100%">
    <div>
      <el-select
          ref="select$"
          v-model="selectedProcedures"
          multiple
          filterable
          value-key="ProcedureID"
          :teleported="true"
          :fit-input-width="true"
      >
        <el-option v-for="(item,index) in procedureList" :value="item.value" :label="item.label"></el-option>
      </el-select>
    </div>

    <div style="width:360px;height:100%; margin-top: 8px;" class="el-card">
      <el-tree
          node-key="Param_ID"
          style="height: 700px;overflow: auto;"
          :indent="8"
          :data="treeData"
          :props="treeProps"
      >
        <template #default="{node,data}">
          <draggable :list="[data]" :group="treeDragGroup" item-key="Param_ID">
            <template #item="{element,index}">
              <div>
                {{ element.Param_Name }}
              </div>
            </template>
          </draggable>
        </template>
      </el-tree>
    </div>

  </div>

</template>

<script>
import ProcedureSelect from "@/components/form-designer/toolbar-panel/datasource-dialog/procedure-select";
import ContextMenu from "@/components/context-menu";
import i18n from "@/utils/i18n";
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {onMounted, reactive, ref, toRaw, watch} from "vue";
import {isEmptyObj, isTable} from "@/utils/util";
import {getProcedureList, getProcedureParams} from "@/api/data-schema";
import {unFlatten} from "@/utils/data-adapter";
import {onClickOutside} from "@vueuse/core";

export default {
  name: "VDataTarget",
  components: {ProcedureSelect, ContextMenu},
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    const putList = reactive([])
    const showLoading = ref(false)
    const showProcedureListLoading = ref(true)
    //展开的节点
    const openNodeSet = reactive(new Set(props.dataTarget['expandedNodes']))
    const select$ = ref()
    //树组件引用
    const tree$ = ref("")
    const treeProps = {
      label: 'Param_Name',
      children: 'children',
    }
    const treeDragGroup = {
      name: 'itxst',
      put: false,
      pull: 'clone'
    }

    const treeData = ref([]) //存储过程具体内容树
    //存储过程下拉列表
    const procedureList = ref([])
    const selectedProcedures = ref([])

    watch(openNodeSet, (newVal) => {
      props.dataTarget["expandedNodes"] = Array.from(newVal)
    })

    watch(selectedProcedures, (newVal, oldVal) => {
      //如果new length> old length代表是添加数据，双重遍历筛选出新选择的脚本，然后读取脚本参数
      if (newVal.length > oldVal.length) {
        newVal.map(nv => {
          if (oldVal.findIndex((ov) => nv.ProcedureID === ov.ProcedureID) === -1) {
            loadTreeData(nv)
          }
        })
      } else {
        oldVal.map(ov => {
          if (newVal.findIndex((nv) => nv.ProcedureID === ov.ProcedureID) === -1) {
            treeData.value.splice(treeData.value.findIndex(param => param.Param_ID === ov.ProcedureID), 1)
          }
        })
      }
    })

    function onDragAdd(evt) {
      console.log(putList[evt.newIndex]);
    }

    // 选择存储过程，通过过程名称加载存储过程参数，并设置树形组件默认展开根节点
    function onProcedureSelect(val) {
      console.log(22, val, selectedProcedures.value);

      //切换存储过程时清空展开的节点
      /*openNodeSet.clear()
      props.dataTarget['procedureValue'] = val
      props.dataTarget.checkedNodes = []
      loadTreeData(val)*/
    }

    function checkNode(data, {checkedNodes}) {

      // console.log('selectedWidget', props.selectedWidget);
      /*if (props.selectedWidget.type === 'edit-table') {
        if (!_isArrayChild(data)) {
          ElMessage.error(`${translate('extension.widgetLabel.' + props.selectedWidget.type)}只能选择数组子节点!`)
          tree$.value.setChecked(data, false, true)
          return;

        }
      } else {*/
      if (!isTable(props.selectedWidget.type)) {
        // if (data?.Param_ObjType !== 'attribute') {
        //   ElMessage.error('您选择的不是叶节点')
        //   tree$.value.setChecked(data, false, true)
        // return
        // }
        // props.dataTarget['checkedNodes'] = checkedNodes
        /*console.log(checkedNodes);
        console.log(checkedNodes.filter(node => {
          // node.data.Param_ID === data.Param_ID)
          console.log(node);
        }))*/
        props.dataTarget['checkedNodes'] = [data]
        tree$.value.setCheckedKeys([data.Param_ID])
      }
    }

    function nodeExpand(data, val) {
      console.log('nodeExpand_data', data, tree$.value);
      const {Param_ID, Param_Name, isProcedure} = data
      openNodeSet.add(Param_ID)
      if (Param_ID !== 'root0') {
        if (isProcedure) {
          getProcedureParams(Param_Name, "", 1).then(res => {
            const parent = treeData.value[0].children.find(item => item.Param_ID === data.Param_ID)
            parent.children = res.Data
          })
          treeData.value = [...treeData.value]
        }
      }
    }

    /**
     * 递归移除关闭节点，如果某节点关闭，则将移除改节点下的子节点
     * @param data
     * @param node
     */
    function nodeCollapse(data, node) {
      console.log(node);
      const traverse = (node) => {
        const nodes = node.children.filter(item => item.expanded)
        nodes.map(item => {
          openNodeSet.delete(item.key)
          traverse(item)
        })
      }
      traverse(node)
      openNodeSet.delete(data.Param_ID)
    }

    function loadProcedureList() {
      getProcedureList().then(res => {
        procedureList.value = res.Data.TableData.map(item => ({
          label: item.ProcedureName,
          value: item
        }))
      })
    }

    function loadTreeData(val) {
      getProcedureParams(val.ProcedureName, "", 1).then((res) => {
        const tree = unFlatten(res.Data.sort((a, b) => a.Param_Des.localeCompare(b.Param_Des)), 'Param_ID')
        console.log('tree', tree);
        treeData.value.push({
          Param_ID: val.ProcedureID,
          Param_Name: val.ProcedureName,
          children: tree
        })
      })
    }

    loadProcedureList()
    loadTreeData({ProcedureID: 1775695957, ProcedureName: 'HOPatient_VAE1_Update'})
    return {
      // showDataTargetDialog,
      showLoading,
      treeProps,
      tree$,
      treeData,
      select$,
      // showCheckBox,
      procedureList,
      selectedProcedures,
      showProcedureListLoading,
      treeDragGroup,
      putList,
      isTable,
      checkNode,
      nodeExpand,
      nodeCollapse,
      onProcedureSelect,
      onDragAdd
    }
  },
  props: {
    dataTarget: Object
  },

}
</script>

<style lang="scss">
.bussiness-container {
  .el-input__wrapper {
    width: 300px;
  }

  .pop-class {
    width: 300px;
  }
}
</style>