<template>
  <teleport to="body">
    <div ref="menu$" class="el-transfer context-menu" v-show="props.menuState.show"
         :style="{left:`${props.menuState.x}px`,top:`${props.menuState.y}px`}">
      <div class="el-transfer-panel" style="padding: 0">
        <p class="el-transfer-panel__header">
          列表操作
        </p>
        <div class="el-transfer-panel__body" style="padding: 0; height: auto">
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
  </teleport>
</template>

<script setup>
import {defineProps, nextTick, onMounted, ref, watch} from "vue";
import {onClickOutside, useMouse} from "@vueuse/core";

const menu$ = ref();
const props = defineProps({
  menuState: {
    type: Object
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
  }, {
    label: "添加子级节点",
    handler: () => {

    }
  },
  {
    label: "添加子级节点",
    handler: () => {

    }
  }, {
    label: "添加子级节点",
    handler: () => {

    }
  }, {
    label: "添加子级节点",
    handler: () => {

    }
  }, {
    label: "添加子级节点",
    handler: () => {

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

watch(() => props.menuState.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const menu = menu$.value
      const {x, y} = props.menuState
      const {offsetWidth: bodyWidth, offsetHeight: bodyHeight} = document.body
      const {offsetWidth: menuWidth, offsetHeight: menuHeight} = menu
      const left = x + menuWidth - bodyWidth
      const top = y + menuHeight - bodyHeight
      if (left > 0) {
        props.menuState.x = x - left - 10
      }
      if (top > 0) {
        props.menuState.y = y - top - 20
      }
    })
  }
})
</script>

<style scoped lang="scss">
.context-menu {
  position: absolute;
  z-index: 9999;
  box-shadow: 2px 5px 5px #c2d6ea;

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