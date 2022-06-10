<template>
  <div ref="menu$" class="el-transfer context-menu" v-show="props.menuState.show">
    <div class="el-transfer-panel" style="padding: 0">
      <p class="el-transfer-panel__header">
        列表操作
      </p>
      <div class="el-transfer-panel__body" style="padding: 0;height: auto">
        <ul>
          <li v-for="(item) in menuContext">
            <el-button link @click="closeMenu(item.handler)" style="width: 100%;justify-content: flex-start">
              {{ item.label }}
            </el-button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, ref} from "vue";
import {onClickOutside} from "@vueuse/core";

const menu$ = ref();
const props = defineProps({
  menuState: {
    type: Object,
    default: {
      show: true
    }
  },
  tableData: Array
})

const closeMenu = (callback) => {
  props.menuState.show = false
  callback()
}

const menuContext = [
  {
    label: "编辑",
    handler: () => {
      props.menuState.row.isEditing = true
    }
  }, {
    label: "添加同级节点",
    handler: () => {
      /*console.log(111, props.menuState.table);
      console.log(props.menuState.table.store);*/
      console.log('row', props.menuState.row)
    }
  }, {
    label: "添加子级节点",
    handler: () => {

    }
  },
]

onClickOutside(menu$, (evt) => {
  evt.type !== 'pointerup' && (props.menuState.show = false)
})
</script>

<style scoped lang="scss">
.context-menu {
  position: absolute;
  z-index: 1000;
  left: v-bind('props.menuState.x');
  top: v-bind('props.menuState.y');
  height: auto !important;

  ul {
    padding: 0;
    margin: 0;

    li {
      list-style: none;
      padding: 5px 0 5px 15px;
      border-bottom: 1px solid #c2d6ea;
    }
  }
}
</style>