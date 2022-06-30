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
            <li v-for="(item,index) in handles">
              <el-button link @click="item.handle(index)"
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
import {defineProps, reactive, ref, watch} from "vue";
import {onClickOutside} from "@vueuse/core";

const menu$ = ref();
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  options: Object
})
const handles = ref([])
const emits = defineEmits(['update:show'])

watch(() => props.show, (newVal) => {
  if (newVal) {
    handles.value = createHandles()
  }
})

onClickOutside(menu$, (evt) => {
  evt.type !== 'pointerup' && emits('update:show', false)
})

function setWidgetKeyValue(index) {
  //获取label或value
  const type = handles.value[index].type
  props.options.currentWidget.options[`${type}Key`] = props.options.currentColumn.property
  emits('update:show', false)
}


function createHandles() {
  let handles
  switch (props.options.currentWidget.type) {
    case 'data-table':
      /*handles = [
        {
          label: '设置为显示列',
          handle: setWidgetColumns
        }
      ]*/
      break
    default:
      handles = [
        {
          label: '设置为label',
          type: 'label',
          handle: setWidgetKeyValue
        },
        {
          label: '设置为value',
          type: 'value',
          handle: setWidgetKeyValue
        }
      ]
      break
  }
  return handles
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