<template>
  <div class="search-rubbish">
    <input type="text" placeholder="输入垃圾名称" ref="input">
    <span class="leave-for" @keydown.enter="searchRubbish" @click="searchRubbish">搜索</span>
  </div>
</template>

<script>
import {ref} from "vue";

export default {
  name: "index",
  props: {
    openDetailBox: {
      type: Function
    }
  },
  setup(props, {emit}) {
    let input = ref()

    function searchRubbish(e) {
      emit('openDetailBox', input.value.value)
      input.value.value = '';
    }

    return {
      input,
      searchRubbish,
    }
  }
}
</script>

<style scoped lang="less">
.search-rubbish {
  display: flex;
  justify-content: space-between;
  /*width: 200px;*/
  height: 44px;
  border-radius: 20px;
  /*overflow: hidden;*/
  user-select: none;

  & input {
    width: 300px;
    height: 40px;
    font-size: 16px;
    border-radius: 10px;
    /*border-bottom-left-radius: 20px;*/
    /*border-top-left-radius: 20px;*/
    padding-left: 10px;
    padding-right: 50px;
    background-color: transparent;
    color: #000;
  }

  .leave-for {
    position: absolute;
    right: 0;
    top: 0;
    width: 50px;
    height: 44px;
    cursor: pointer;
    text-align: center;
    line-height: 44px;
    border-radius: 10px;
    color: #000;
    /*background-color: #2d6a32;*/
    /*border-bottom-right-radius: 20px;*/
    /*border-top-right-radius: 20px;*/
    /*border: 2px solid #2d6a32;*/
  }
}
</style>