<template>
  <el-drawer @opened="onDrawOpen" v-model="showDataTargetDialog" :title="`请选择${i18nt('designer.setting.dataTarget')}`"
             show-close>
    <div style="height: 80vh;overflow: auto" v-loading="showProcedureListLoading">
      <procedure-select @onProcedureSelect="onProcedureSelect"
                        v-model="showProcedureListLoading"
                        :procedureValue="optionModel.dataTarget['procedureValue']"/>
      <!--数据表格采用右键选择列绑定，其他多选方式选择-->
      <!--table树-->
      <el-tree v-if="isTable(selectedWidget.type)"
               ref="tree$"
               node-key="Param_ID"
               v-loading="showLoading"
               :expand-on-click-node="false"
               :props="treeProps"
               :data="treeData"
               :check-on-click-node="false"
               :default-expanded-keys="optionModel.dataTarget['expandedNodes']"
               :default-checked-keys="optionModel?.dataTarget['checkedNodes']?.map(item=>item.Param_ID)"
               @check="checkNode"
               @node-contextmenu="nodeContextmenu"
               @node-collapse="nodeCollapse"
               @node-expand="nodeExpand"

      >
        <template #default="{ node, data }">
            <span class="custom-tree-node">
<!--              <span>{{ data.Param_ID }}</span>-->
              <span>{{ node.label }}</span>
              <span style="color:darkcyan">({{ data.Param_ObjType }})</span>
              <span v-if="data.Param_Des" style="color: #2c91ff">-[{{
                  data.Param_Des
                }}]</span>

              <span v-if="optionModel.dataTarget?.bindMap?.[data.Param_ID]">
                <el-button type="warning" @click="unbindNode(node)">{{
                    optionModel.dataTarget?.bindMap?.[data.Param_ID]
                  }}</el-button>
              </span>
            </span>
        </template>
      </el-tree>
      <!--非table控件的树-->
      <el-tree
          v-else
          ref="tree$"
          show-checkbox
          node-key="Param_ID"
          v-loading="showLoading"
          :expand-on-click-node="false"
          :props="treeProps"
          :data="treeData"
          :check-on-click-node="false"
          :default-expanded-keys="optionModel.dataTarget['expandedNodes']"
          :default-checked-keys="optionModel?.dataTarget['checkedNodes']?.map(item=>item.Param_ID)"
          @check="checkNode"
          @node-collapse="nodeCollapse"
          @node-expand="nodeExpand"

      >
        <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span style="color:darkcyan">({{ data.Param_ObjType }})</span>
              <span v-if="data.Param_Des" style="color: #2c91ff">-[{{
                  data.Param_Des
                }}]</span>
            </span>
        </template>
      </el-tree>
      <context-menu v-model:show="menuOptions.show" :options="menuOptions"></context-menu>
    </div>
  </el-drawer>
</template>

<script>
import ProcedureSelect from "@/components/form-designer/toolbar-panel/datasource-dialog/procedure-select";
import ContextMenu from "@/components/context-menu";
import i18n from "@/utils/i18n";
import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";
import {reactive, ref, toRaw, watch} from "vue";
import {isEmptyObj, isTable} from "@/utils/util";
import {getProcedureParams} from "@/api/data-schema";
import {unFlatten} from "@/utils/data-adapter";

export default {
  name: "dataTarget-drawer",
  components: {ProcedureSelect, ContextMenu},
  mixins: [i18n, propertyMixin],
  setup(props, ctx) {
    //显示数据目标
    const showDataTargetDialog = ref(false)
    const showLoading = ref(false)
    const showProcedureListLoading = ref(true)
    const showCheckBox = ref(!isTable(props.selectedWidget.type))
    //展开的节点
    const openNodeSet = reactive(new Set(props.optionModel.dataTarget['expandedNodes']))
    //树组件引用
    const tree$ = ref("")
    const treeProps = {
      label: 'Param_Name',
      children: 'children',
      isLeaf: 'isLeaf',
    }
    //树组件数据
    const treeData = ref([])
    //当前操作的节点
    const currentNode = ref({})
    const menuOptions = reactive({
      show: false,
      x: 0,
      y: 0,
      title: '选择绑定列',
    })

    watch(openNodeSet, (newVal) => {
      props.optionModel.dataTarget["expandedNodes"] = Array.from(newVal)
    })

    /*onMounted(() => {
      onDrawOpen()
    })*/

    function createMenuHandle(node) {
      const bindMap = props.optionModel.dataTarget.bindMap
      const boundColumns = []
      !isEmptyObj(bindMap) && Object.keys(bindMap).map(key => {
        boundColumns.push(bindMap[key])
      })
      //先从绑定map中获取已绑定的column prop，然后从tableColumns中过滤已绑定的列
      const handles = props.optionModel.tableColumns
          .filter(column => !boundColumns.includes(column.prop))
          .map(column => ({
            label: column.prop,
            handle: () => {
              bindMap[node.data.Param_ID] = column.prop
              menuOptions.show = false
              //绑定编辑表格时获取绑定节点的父级结构
              const parent = tree$.value.store.nodesMap[node.data.Param_ID].parent
              if (parent.data.Param_ObjType === 'object' && parent.parent.data.Param_ObjType === 'array') {
                const schema = toRaw(parent.data)
                //删除掉暂时不用的children
                delete schema.children
                props.optionModel.dataTarget.arraySchema = schema
              }
            }
          }))
      return handles
    }

    // 选择存储过程，通过过程名称加载存储过程参数，并设置树形组件默认展开根节点
    function onProcedureSelect(val) {
      //切换存储过程时清空展开的节点
      openNodeSet.clear()
      props.optionModel.dataTarget['procedureValue'] = val
      props.optionModel.dataTarget.checkedNodes = []
      loadTreeData(val)
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
        // props.optionModel.dataTarget['checkedNodes'] = checkedNodes
        /*console.log(checkedNodes);
        console.log(checkedNodes.filter(node => {
          // node.data.Param_ID === data.Param_ID)
          console.log(node);
        }))*/
        props.optionModel.dataTarget['checkedNodes'] = [data]
        tree$.value.setCheckedKeys([data.Param_ID])
      }
    }

    function nodeExpand(data, val) {
      console.log('nodeExpand_data', data);
      openNodeSet.add(data.Param_ID)
    }

    /**
     * 递归移除关闭节点，如果某节点关闭，则将移除改节点下的子节点
     * @param data
     * @param node
     */
    function nodeCollapse(data, node) {
      const traverse = (node) => {
        const nodes = node.childNodes.filter(item => item.expanded)
        nodes.map(item => {
          openNodeSet.delete(item.key)
          traverse(item)
        })
      }
      traverse(node)
      openNodeSet.delete(data.Param_ID)
    }

    function _isArrayChild(data) {
      const node = tree$.value.store.nodesMap[data.Param_ID]
      return node?.parent?.data.Param_ObjType === 'array' || node?.parent?.parent?.data.Param_ObjType === 'array';
    }

    function onDrawOpen() {
      console.log('onDrawOpen');
      const val = props.optionModel.dataTarget['procedureValue']
      // console.log(111, val);
      if (!isEmptyObj(val)) {
        loadTreeData(val)
      }
    }

    function loadTreeData(val) {
      showLoading.value = true
      getProcedureParams(val.ProcedureName, "", 1).then((res) => {
        const tree = unFlatten(res.Data, 'Param_ID')
        treeData.value = [{
          Param_ID: val.ProcedureID,
          Param_Name: val.ProcedureName,
          children: tree
        }]
        showLoading.value = false
      })
    }

    function nodeContextmenu(event, data, node, self) {
      event.preventDefault()
      menuOptions.show = true
      menuOptions.x = event.x;
      menuOptions.y = event.y
      currentNode.value = node
      menuOptions.handles = createMenuHandle(node)
    }

    /**
     * 给已经和表格列绑定的节点解除绑定
     */
    function unbindNode(node) {
      //todo 解除绑定时菜单有问题
      props.optionModel.dataTarget.bindMap[node.data.Param_ID] && delete props.optionModel.dataTarget.bindMap[node.data.Param_ID]
    }

    return {
      showDataTargetDialog,
      showLoading,
      treeProps,
      tree$,
      treeData,
      menuOptions,
      showCheckBox,
      showProcedureListLoading,
      isTable,
      checkNode,
      nodeExpand,
      nodeCollapse,
      onProcedureSelect,
      onDrawOpen,
      nodeContextmenu,
      unbindNode
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