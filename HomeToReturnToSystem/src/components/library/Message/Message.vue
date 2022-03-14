<template>
  <Transition name="down" mode="out-in">
    <div class="message" :style="style[currentMessage]" v-if="isShow">
      <i class="iconfont" :class="style[type].icon"></i>
      <span class="text">{{text}}</span>
    </div>
  </Transition>
</template>
<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";

export default defineComponent({
  name: "Message",
  props:{
    type:{
      type:String,
      default: 'success'
    },
    text:{
      type:String,
      default: ''
    }
  },
  setup(props) {
    const style = {
      // 警告类型的提示
      warn: {
        icon: "icon-warning",
        color: "#E6A23C",
        backgroundColor: "rgb(253, 246, 236)",
        borderColor: "rgb(250, 236, 216)",
      },
      // 错误类型的提示
      error: {
        icon: "icon-shanchu",
        color: "#F56C6C",
        backgroundColor: "rgb(254, 240, 240)",
        borderColor: "rgb(253, 226, 226)",
      },
      // 成功类型的提示
      success: {
        icon: "icon-queren2",
        color: "#67C23A",
        backgroundColor: "rgb(240, 249, 235)",
        borderColor: "rgb(225, 243, 216)",
      },
    };

    const currentMessage = props.type;

    // 是否显示组件
    const isShow = ref(false);

    // 定时器变量
    let timer: any = null;

    // 每次开启定时器前，先清除定时器
    clearTimeout(timer);
    // 开启定时器
    timer = setTimeout(() => {
      isShow.value = false;
    }, 3000)

    // 当组件挂在完成后显示组件
    onMounted(() => {
      isShow.value = true;
    })

    return { style, currentMessage, isShow };
  },
});
</script>
<style scoped lang="less">
.message {
  width: 300px;
  height: 50px;
  position: fixed;
  z-index: 9999;
  left: 50%;
  margin-left: -150px;
  top: 25px;
  line-height: 50px;
  padding: 0 25px;
  border: 1px solid #e4e4e4;
  background: #f5f5f5;
  color: #999;
  border-radius: 4px;
  i {
    margin-right: 4px;
    vertical-align: middle;
  }
  .text {
    vertical-align: middle;
  }
}

.down {
  &-enter {
    &-from {
      transform: translate3d(0, -75px, 0);
      opacity: 0;
    }
    &-active {
      transition: all 0.5s;
    }
    &-to {
      transform: none;
      opacity: 1;
    }
  }
}

.down {
  &-leave {
    &-from {
      transform: none;
      opacity: 1;
    }
    &-active {
      transition: all 0.5s;
    }
    &-to {
      transform: translate3d(0, -75px, 0);
      opacity: 0;
    }
  }
}
</style>