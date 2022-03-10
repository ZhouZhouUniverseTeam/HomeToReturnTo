<template>
  <div class="infinite-loading" ref="target">
    <div class="loading" v-if="isLoading">
      <span class="text">正在加载...</span>
    </div>
    <div class="none" v-if="isFinished">
      <span class="text">亲，没有更多了</span>
    </div>
  </div>
</template>

<script>
import {ref} from "@vue/runtime-core";
import {useIntersectionObserver} from "@vueuse/core";

export default {
  name: "index.vue",
  props:{
    isLoading:{
      type: Boolean,
      default: false
    },
    isFinished:{
      type: Boolean,
      default: false
    }
  },
  setup(props,{emit}) {
    let target = ref(null)
    // 执行监听元素的操作
    useIntersectionObserver(target, ([{ isIntersecting }]) => {
      // 如果元素进入了可视区
      if (isIntersecting) {
        // 如果没有正在加载并且还有数据可以加载
        if (!props.isLoading && !props.isFinished) {
          // console.log('进入可视区')
          // 通过触发自定义事件告诉父组件, 元素进入可视区了.
          emit("infinite"); ////
        }
      }
    });
    return {
      target
    }
  }
}
</script>

<style scoped lang="less">
.infinite-loading {
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;

    .text {
      color: #999;
      font-size: 16px;
    }
  }
  .none {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;

    .text {
      color: #999;
      font-size: 16px;
    }
  }
}
</style>