<template>
  <div class="rubbish-detail-box" >
    <div class="title" :style="{backgroundColor:currentType!=='搜索'?rubbishData?.color : 'black'}">
      <h2>{{ currentType === "搜索" ? `${currentType} ${rubbishName} 的结果` : currentType}} <span class="close-btn" @click="closeDetailBox">×</span></h2>
    </div>

    <div v-if="currentType !== '搜索'" class="rubbish-introduce" :style="{backgroundColor:rubbishData?.color}">
      <div>{{rubbishData?.introduce}}</div>
      <div>
        <div><strong>投放要求:</strong></div>
        <ul>
          <li v-for="(item,index) in rubbishData?.ask" :key="index">{{item}}</li>
        </ul>
      </div>
    </div>

    <ul class="rubbish-list">
      <li @click="handleShowPopUpBox(rubbishItem.rid)" class="item" v-for="rubbishItem in rubbishData?.items" :key="rubbishData?.rid">{{ rubbishItem.rname }}</li>
    </ul>

    <InfiniteLoading @infinite="loadMore" :isLoading="isLoading" :isFinished="isFinished"></InfiniteLoading>

    <Transition name="pop-up-box">
      <div class="pop-up-box" v-if="showPopUpBox && rubbishId">
        <PopUpBox @handleHidePopUpBox="handleHidePopUpBox" :currentType="currentType" :rubbishId="rubbishId"></PopUpBox>
      </div>
    </Transition>

  </div>
</template>

<script>
import {ref, watch} from "vue";
import {getRubbishDetailData, getRubbishType, getSearchData} from "../../api/rubbishDetailApi";

import InfiniteLoading from "../../components/InfiniteLoading/index.vue"
import PopUpBox from "../../components/PopUpBox/index.vue"


export default {
  name: "RubbishDetail",
  props: {
    currentType: {
      type: String,
      default: ""
    },
    closeDetailBox: {
      type: Function
    },
    rubbishName:{
      type: String
    }
  },
  components: {
    InfiniteLoading,
    PopUpBox,
  },
  setup(props, {emit}) {

    // 控制弹出框显示隐藏
    let showPopUpBox = ref(false)

    let rubbishId = ref()
    function handleShowPopUpBox(id) {
      showPopUpBox.value = true;

      rubbishId.value = id;
    }

    function handleHidePopUpBox() {
      showPopUpBox.value = false;
    }

    // 解构出变量和方法
    const {rubbishData, isLoading, isFinished, loadMore} = useGetRubbishData(props);


    // 关闭弹出框
    function closeDetailBox() {
      showPopUpBox.value = false;
      emit('closeDetailBox')
    }

    return {
      rubbishData,
      closeDetailBox,
      isLoading,
      isFinished,
      loadMore,
      showPopUpBox,
      handleShowPopUpBox,
      handleHidePopUpBox,
      rubbishId,
    }
  }
}

// 用来获取垃圾详情数据的hook
function useGetRubbishData(props) {
  const isLoading = ref(false);

  const isFinished = ref(false);
  // 存储垃圾详情数据
  let rubbishData = ref();

  // 整合参数
  let reqParams = ref({
    rubbishType: props.currentType,
    page: 0,
    pageSize: 100
  })

  // 获取数据的方法
  function getData(reqParams) {
    isLoading.value = true;
    if (props.currentType === '搜索') {
      getSearchData({...reqParams, rubbishName:props.rubbishName}).then(({data}) => {
        isLoading.value = false;

        if(reqParams.page === 0) {
          if (data.items.length < 1) isFinished.value = true;
          // if (data.items)
          rubbishData.value = data
          rubbishData.value.items = [...data.items]
        } else {
          rubbishData.value.items = [...rubbishData.value.items,...data?.items];
        }

        if(data.pages === reqParams.page) {
          isFinished.value = true;
        }
      })

      return ;
    }
    // 获取垃圾详情数据 如果不是搜索的情况下
     getRubbishDetailData(reqParams).then(({data}) => {
      isLoading.value = false;

        if(reqParams.page === 0) {
          // console.log(data)
          rubbishData.value = data
          rubbishData.value.items = [...data.items]
        } else {
          rubbishData.value.items = [...rubbishData.value.items,...data?.items];
        }

        if(data.pages === reqParams.page) {
          isFinished.value = true;
        }

    })

    // 如果是搜索的情况下
  }

  // 调用获取数据的方法
  // getData(reqParams.value);

  watch(() => reqParams.value,
      () => getData(reqParams.value))
    getData(reqParams.value)

  function loadMore() {
    reqParams.value = {...reqParams.value, page: reqParams.value.page + 1}
  }

  return {
    rubbishData,
    isLoading,
    isFinished,
    loadMore
  }
}
</script>

<style scoped lang="less">
.rubbish-detail-box {
  width: 100%;
  height: 100%;
  color: #fff;
  overflow-y: auto;

  .title {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 999;
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 30px;
    //background-color: #2d6a32;
    padding: 0 20px;

    .close-btn {
      float: right;
      font-size: 40px;
      cursor: pointer;
      user-select: none;
    }

    .close-btn:hover {
      color: red;
    }
  }

  .rubbish-introduce {
    margin: 0 auto;
    width: 1000px;
    padding: 20px;
    background-color: #2d6a32;
    font-size: 25px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    line-height: 40px;
  }

  .pop-up-box {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index:1000
  }

  .rubbish-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    overflow: hidden;

    .item {
      display: flex;
      width: 19%;
      height: 60px;
      border-radius: 15px;
      //background-color: #999;
      margin: 5px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #000;
      border: 2px solid #000;
    }

    .item.active {
      background-color: red;
    }

    .item:hover {
      background-color: red;
    }
  }

  /* info弹出框 */
  .pop-up-box-enter-active,
  .pop-up-box-leave-active{
    transition: all .3s ease;
  }

  .pop-up-box-enter-from{
    opacity: 0;
  }

  .pop-up-box-enter-to{
    opacity: 1;
  }

  .pop-up-box-leave-from{
    opacity: 1;
  }

  .pop-up-box-leave-to{
    opacity: 0;
  }
}
</style>