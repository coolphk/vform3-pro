<template>
  <teleport to="body">
    <div ref="menu$" class="el-transfer context-menu" v-show="props.show"
         :style="{left:`${props.options.x}px`,top:`${props.options.y}px`}">
      <div class="el-transfer-panel" style="padding: 0">
        <p class="el-transfer-panel__header">
          列表操作
        </p>
        <div class="el-transfer-panel__body" style="padding: 0; height: auto">
          <ul>
            <li v-for="(item) in props.options.handles">
              <el-button link @click="execHandle(item.handle,item.category)"
                         style="width: 100%;justify-content: flex-start">
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
import {defineProps, ref} from "vue";
import {onClickOutside} from "@vueuse/core";

const menu$ = ref();
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  options: Object
})
const emits = defineEmits(['update:show'])


onClickOutside(menu$, (evt) => {
  evt.type !== 'pointerup' && emits('update:show', false)
})

function execHandle(handle, category) {
  handle(props.options.currentColumn, category)
  emits('update:show', false)
}

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