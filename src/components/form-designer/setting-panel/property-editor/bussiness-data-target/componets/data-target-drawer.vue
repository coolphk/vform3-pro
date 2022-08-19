<template>
  <el-drawer @opened="onDrawOpen" v-model="showDataTargetDialog" title="选择需要匹配的数据"
             show-close>
    <div style="height: 80vh;overflow: auto" v-loading="showProcedureListLoading">
      <div style="margin-bottom: 20px;display:flex;align-items: center;flex-flow: wrap">
        <div>选择存储过程名称：
          <el-button type="primary" @click="loadProcedureList">刷新数据</el-button>
        </div>
        <el-select :autofocus="false" filterable v-model="selectedProcedure"
                   style="width: 400px"
                   value-key="ProcedureID"
                   @change="onProcedureSelect"
        >
          <el-option v-for="(item) in procedureList" :value="item" :label="item.ProcedureName"/>
        </el-select>
      </div>
      <!--数据表格采用右键选择列绑定，其他多选方式选择-->
      <!--table树-->
      <el-tree ref="tree$"
               node-key="Param_ID"
               v-loading="showLoading"
               :expand-on-click-node="false"
               :props="treeProps"
               :data="treeData"
               :check-on-click-node="false"
               :default-expanded-keys="optionModel.dataTarget['expandedKeys']"
               :default-checked-keys="optionModel?.dataTarget['checkedNodes']?.map(item=>item.Param_ID)"
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

              <span v-if="optionModel.dataTarget?.bindMap?.[data.Param_Name]">
                <el-button type="warning" @click="unbindNode(data)">{{
                    optionModel.dataTarget?.bindMap?.[data.Param_Name]
                  }}</el-button>
              </span>
            </span>
        </template>
      </el-tree>
      <!--非table控件的树-->
      <!--      <el-tree
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
            </el-tree>-->
      <context-menu v-model:show="menuOptions.show" :options="menuOptions"></context-menu>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import ContextMenu from "@/components/context-menu/index.vue";
import {reactive, ref, toRaw, watch} from "vue";
import {isEmptyObj, isTable} from "@/utils/util.js";
import {getProcedureList, getProcedureParams} from "@/api/data-schema";
import {unFlatten} from "@/utils/data-adapter.js";
import Node from "element-plus/es/components/tree/src/model/node";
import {Procedure, ScriptParam} from "@/api/types";
import {EditTableOptions} from "@/extension/edit-table/edit-table-schema";

//树组件数据
interface TreeNode {
  Param_ID: string,
  Param_Name: string,
  children: ScriptParam[]
}

interface MenuOption {
  show: boolean,
  x: number,
  y: number,
  title: string
  handles: { label: string, handle: Function }[]
}

const props = defineProps<{
  designer: any,
  selectedWidget: any,
  optionModel: EditTableOptions
}>()
//显示数据目标
const showDataTargetDialog = ref(false)
const showLoading = ref(false)
const showProcedureListLoading = ref(false)
const showCheckBox = ref(!isTable(props.selectedWidget?.type))
const procedureList = ref<Procedure[]>()
const selectedProcedure = ref<Procedure>(props.optionModel.dataTarget.selectedProcedure)
//展开的节点
const openNodeSet = reactive(new Set(props.optionModel?.dataTarget['expandedKeys']))
//树组件引用
const tree$ = ref()
const treeProps = {
  label: 'Param_Name',
  children: 'children',
  isLeaf: 'isLeaf',
}


const treeData = ref<TreeNode[]>([])
//当前操作的节点
const currentNode = ref({})
const menuOptions = reactive<MenuOption>({
  show: false,
  x: 0,
  y: 0,
  title: '选择绑定列',
  handles: []
})

watch(openNodeSet, (newVal) => {
  props.optionModel && (props.optionModel.dataTarget["expandedKeys"] = Array.from(newVal))
})

async function loadProcedureList() {
  procedureList.value = (await getProcedureList()).Data.TableData
}

function createMenuHandle(data: ScriptParam) {
  const bindMap = props.optionModel?.dataTarget.bindMap
  //已经绑定的关系
  const boundColumns = Object.values(bindMap)
  //先从绑定map中获取已绑定的column prop，然后从tableColumns中过滤已绑定的列
  const handles = props.optionModel?.tableColumns
      .filter(column => !boundColumns.includes(column.prop))
      .map(column => ({
        label: column.prop,
        handle: () => {
          bindMap[data.Param_Name] = column.prop
          menuOptions.show = false
          //绑定编辑表格时获取绑定节点的父级结构
          const parent = tree$.value.store.nodesMap[data.Param_ID].parent
          if (parent.data.Param_ObjType === 'object' && parent.parent.data.Param_ObjType === 'array') {
            const schema = toRaw(parent.data)
            //删除掉暂时不用的children
            delete schema.children
            props.optionModel && (props.optionModel.dataTarget.arraySchema = schema)
          }
        }
      }))
  return handles
}

// 选择存储过程，通过过程名称加载存储过程参数，并设置树形组件默认展开根节点
function onProcedureSelect(val: Procedure) {
  console.log(11, val);
  //切换存储过程时清空展开的节点
  openNodeSet.clear()
  treeData.value = []
  if (props.optionModel) {
    props.optionModel.dataTarget.selectedProcedure = val
    // props.optionModel.dataTarget.checkedNodes = []
  }
  loadTreeData(val)
}

function nodeExpand(data: ScriptParam) {
  openNodeSet.add(data.Param_ID)
}

/**
 * 递归移除关闭节点，如果某节点关闭，则将移除改节点下的子节点
 * @param data
 * @param node
 */
function nodeCollapse(data: ScriptParam, node: Node) {
  /*  const traverse = (node) => {
      const nodes = node.childNodes.filter(item => item.expanded)
      nodes.map(item => {
        openNodeSet.delete(item.key)
        traverse(item)
      })
    }
    traverse(node)*/
  openNodeSet.delete(data.Param_ID)
}

/*function _isArrayChild(data) {
  const node = tree$.value.store.nodesMap[data.Param_ID]
  return node?.parent?.data.Param_ObjType === 'array' || node?.parent?.parent?.data.Param_ObjType === 'array';
}*/

function onDrawOpen() {
  console.log('onDrawOpen');
  loadProcedureList()
  const val = props.optionModel?.dataTarget.selectedProcedure
  // console.log(111, val);
  if (!isEmptyObj(val)) {
    loadTreeData(val)
  }
}

function loadTreeData(val: Procedure) {
  showLoading.value = true
  getProcedureParams(val.ProcedureName, "", 1).then((res) => {
    const tree = unFlatten(res.Data.sort((a, b) => a.Param_Des.localeCompare(b.Param_Des)), 'Param_ID', {
      procedureId: val.ProcedureID,
      procedureName: val.ProcedureName
    })
    treeData.value.push({
      Param_ID: val.ProcedureID,
      Param_Name: val.ProcedureName,
      children: tree
    })
    showLoading.value = false
  })
}

function nodeContextmenu(event: MouseEvent, data: ScriptParam, node: Node) {
  event.preventDefault()
  menuOptions.show = true
  menuOptions.x = event.x;
  menuOptions.y = event.y
  currentNode.value = node
  menuOptions.handles = createMenuHandle(data)
}

/**
 * 给已经和表格列绑定的节点解除绑定
 */
function unbindNode(data:ScriptParam) {
  //todo 解除绑定时菜单有问题
  props.optionModel.dataTarget.bindMap[data.Param_Name] && delete props.optionModel.dataTarget.bindMap[data.Param_Name]
}


</script>

<style scoped>

</style>