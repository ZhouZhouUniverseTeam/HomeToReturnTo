<template>
  <div class="examination">

    <div class="examination-container">
      <div class="examination-title">
        <h1>考试</h1>
      </div>
      <!--   开始按钮   -->
      <div class="start" @click="handleStartingToWork" v-if="!isStartingWork">
        开始答题
      </div>

      <!--   题目   -->
      <div class="question" v-else-if="questionList && isStartingWork">
        <!--   当前是第几题   -->
        <div class="qid">{{ questionIndex + 1 }}/10</div>
        <div class="question-title">{{ questionList[questionIndex].title }}</div>
        <div class="answer">
          <div class="answer-item optionA" @click="handleClickOption('A', questionList[questionIndex].optionA)">
            {{ questionList[questionIndex].optionA }}
          </div>
          <div class="answer-item optionB" @click="handleClickOption('B', questionList[questionIndex].optionB)">
            {{ questionList[questionIndex].optionB }}
          </div>
          <div class="answer-item optionC" @click="handleClickOption('C', questionList[questionIndex].optionC)">
            {{ questionList[questionIndex].optionC }}
          </div>
          <div class="answer-item optionD" @click="handleClickOption('D', questionList[questionIndex].optionD)">
            {{ questionList[questionIndex].optionD }}
          </div>
        </div>
      </div>

      <!--   注册框   -->
      <div class="register" v-if="isShowRegister">
        <form id="addUser" ref="form">
          <div class="register-username">
            <span class="username">昵称：</span><input type="text" name="username">
          </div>
          <div class="register-gender">
            <span class="gender">性别：</span>
            <label for="man" class="man">👦</label>
            <input type="radio" name="gender" id="man" value="0" checked>
            <label for="woman" class="woman">👧</label>
            <input type="radio" name="gender" id="woman" value="1">
          </div>

        </form>
        <div class="buttons">
          <button class="affirm" @click="handleAddUser">确定</button>
        </div>

      </div>

      <!--   得分情况   -->
      <div class="score-situation" v-if="isShowScoreBox">
        <div class="score-situation-left" v-if="isShowAnswer">
          <div class="left-answer-title">本次答题答案</div>
          <div class="left-answer">
            <div class="left-answer-list" v-for="(item,index) in questionList" :key="index">
              <span class="answer-timu">{{ item.title }}</span>
              <div class="answer-left">
                <span class="answer-wrong">{{ item.wrongText }}</span>
                <span class="answer-daan">{{ item.daanText }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="score-situation-center">
          <div class="title"><h2>获得 <span class="score">{{ score }}</span> 分</h2></div>
          <img class="jiangbei" src="../../assets/images/jiangbei2.png" alt="">
          <div class="question-result">共 <span class="question-result-num">{{ allQuestionComputed }}</span> 题 答对 <span
              class="question-result-num">{{ answerQuestionComputed }}</span> 题 答错 <span
              class="question-result-num">{{ allQuestionComputed - answerQuestionComputed }}</span> 题
          </div>
          <div class="again" @click="handleHideScoreBox">再试一次</div>
          <div class="center-buttons">
            <div class="check-answer" @click="handleShowAnswer">查看答案</div>
            <div class="check-wrong" @click="handleShowRanking">排行榜</div>
          </div>
        </div>
        <div class="score-situation-right" v-if="isShowRanking">
          <div class="right-title">排行榜前十名</div>
          <div class="ranking-list" v-for="(item,index) in rankingUsers" :key="item.raid">
            <div class="ranking-num" :style="{color: index+1 < 4?'red':'#999'}">{{ index + 1 }}</div>
            <div class="ranking-right">
              <div class="ranking-user-gender">{{ item.gender ? '👦' : '👧' }}</div>
              <div class="ranking-username">{{ item.username }}</div>
              <div class="ranking-score">{{ item.score }}分</div>
            </div>
          </div>
          <div class="right-bottom-text">每天00:00重置排行榜</div>
        </div>
      </div>

      <div v-if="!isStartingWork">
        <RightButtonLink v-for="(item, index) in rightButtons" :key="index" :style="{top: index * 100 + 100 + 'px'}"
                         :class="[rightButtonActiveIndex === index ? 'active':'']"
                         @mouseenter="handleShowActiveClass(index)" @mouseleave="handleHideActiveClass" :to="item.path">
          {{ item.text }}
        </RightButtonLink>
      </div>
    </div>
  </div>
</template>

<script>
import {computed, onMounted, ref} from "vue";
// 引入api
import {
  addRankingData,
  addUserNicknameAndGender,
  checkUsernameExists,
  getQuestionData,
  getRankingUser
} from "../../api/ExaminationApi";
// 引入生成随机不重复ID的方法
import {GenNonDuplicateID} from "../../assets/js/randomId"

import RightButtonLink from "../../components/RightButtonLink/index.vue"
import {Message} from "../../components/library/Message";

export default {
  name: "index",
  components: {
    RightButtonLink,
  },
  setup() {
    // 用户信息(username, uid)
    let userInfo = ref()

    onMounted(() => {
      // 进入页面获取用户名
      userInfo.value = JSON.parse(localStorage.getItem('userInfo')) || null;
      handleCheckUserExists();
    })

    // 显示/隐藏注册弹框
    let isShowRegister = ref(false);

    // 判断用户是否存在localStore中
    function handleCheckUserExists() {
      // 用户存在
      if (userInfo?.value) {

        let reqParams = {
          id: userInfo.value.id,
          username: userInfo.value.username
        }
        // 发起请求，查看用户名是否存在数据库中
        checkUsernameExists(reqParams).then((data) => {
          if (data?.code === 500) {
            localStorage.removeItem('userInfo');
            Message({type: "error", text: '用户已过期，请重新注册'});
            isShowRegister.value = true;
            return;
          } else if (data?.code === 200) {
            Message({type:"success", text: userInfo.value?.username + ' 欢迎回来'})
          }
        })
      } else {
        // 用户不存在就让用户注册
        isShowRegister.value = true;
      }
    }

    let form = ref();

    // 添加用户
    function handleAddUser() {
      let formData = new FormData(form.value);

      let username = formData.get('username');

      let gender = formData.get('gender');

      if (username.trim().length === 0) return Message({type: 'error', text: '昵称不能为空'});

      // 生成随机不重复id
      let randomId = GenNonDuplicateID(10)

      // 发起请求，向数据库中添加用户数据
      addUserNicknameAndGender({id: randomId, username, gender}).then((data) => {
        if (data?.code === 500) {
          // 用户添加失败后
          // 提示用户
          return Message({type:"error", text: data?.message});
        } else if (data?.code === 200) {
          // 用户添加成功后
          // 提示用户
          Message({type: 'success', text: data?.message});
          // 关闭注册弹框
          isShowRegister.value = false;
          // 把用户名保存到本地，用作第二次进入页面时去数据库查找有没有这个用户
          localStorage.setItem('userInfo', JSON.stringify({username, id: randomId}));
        }
      })
    }


    // 控制开始答题按钮
    let isStartingWork = ref(false);
    let questionList = ref();
    // 题目序号
    let questionIndex = ref(0);

    // 分数
    let score = ref(0)

    // 显示分数框
    let isShowScoreBox = ref(false)


    // 点击开始答题按钮
    function handleStartingToWork() {
      if (!userInfo) {
        isShowRegister.value = true;
        console.log(111)
        return;
      }

      isStartingWork.value = true;
      // 获取题目数据
      getQuestionData().then(({data}) => {
        questionList.value = [...data];
      })
    }

    // 选择答案
    function handleClickOption(option, optionText) {
      if (questionIndex.value === 9) {
        // 到最后一题了, 到最后一题后还需要在执行一次保存答案，不然最后一题不会记录，但是不能让索引继续往上加
        if (option !== questionList.value[questionIndex.value].daan) {
          // 答错
          // 正确答案选项
          let daan = questionList.value[questionIndex.value].daan;
          // 记录错误答案
          // 记录正确答案
          questionList.value[questionIndex.value].wrongText = optionText;
          questionList.value[questionIndex.value].daanText = questionList.value[questionIndex.value][`option${daan}`]
        } else {
          // 答对
          // 分数+10
          score.value += 10;
          questionList.value[questionIndex.value].daanText = questionList.value[questionIndex.value][`option${option}`]
        }

        // 最后一题记录完成后显示得分情况，并将用户分数同步到数据库
        // 👦
        // 弹出得分框
        isShowScoreBox.value = true;
        // 隐藏答题框，并且显示开始答题按钮
        isStartingWork.value = false;

        // 生成随机不重复id
        let randomId = GenNonDuplicateID(10)
        // 获取用户信息
        let {username, id} = JSON.parse(localStorage.getItem('userInfo'));

        let reqParams = {
          raid: randomId,
          score: score.value,
          username: username,
          uid: id
        }

        addRankingData(reqParams).then((data) => {
          Message({type: 'success', text: data?.message});
        })


      } else {
        // 还没到最后一题
        if (option !== questionList.value[questionIndex.value].daan) {
          // 答错
          // 正确答案选项
          let daan = questionList.value[questionIndex.value].daan;
          // 记录错误答案
          // 记录正确答案
          questionList.value[questionIndex.value].wrongText = optionText;
          questionList.value[questionIndex.value].daanText = questionList.value[questionIndex.value][`option${daan}`]
        } else {
          // 答对
          // 分数+10
          score.value += 10;
          questionList.value[questionIndex.value].daanText = questionList.value[questionIndex.value][`option${option}`]
        }
        questionIndex.value = questionIndex.value + 1;
      }
    }


    // 计算总共有多少题目
    let allQuestionComputed = computed(() => {
      return questionList.value.length;
    })

    // 计算答对多少题目
    let answerQuestionComputed = computed(() => {
      return questionList.value.filter(item => !item.wrongText).length;
    })

    let isShowAnswer = ref(false);

    function handleShowAnswer() {
      isShowAnswer.value = !isShowAnswer.value;
    }

    let isShowRanking = ref(false);

    let rankingUsers = ref();

    function handleShowRanking() {
      isShowRanking.value = !isShowRanking.value;

      getRankingUser().then(({data}) => {
        rankingUsers.value = data.rankingUsers;
      })
    }

    function handleHideScoreBox() {
      // 清空所有状态
      isShowScoreBox.value = false;
      isShowRanking.value = false;
      isShowAnswer.value = false;
      questionIndex.value = 0;
      questionList.value = null;
      score.value = 0;
    }

    let rightButtonActiveIndex = ref(false);

    let rightButtons = [
      {
        text: '首页',
        path: "/home"
      },
      {
        text: '2021全国各省垃圾产量',
        path: "/provinceRanking"
      },
      {
        text: '垃圾分类小课堂',
        path: "/rubbishClass"
      }
    ]

    function handleShowActiveClass(index) {
      rightButtonActiveIndex.value = index;
    }

    function handleHideActiveClass() {
      rightButtonActiveIndex.value = null;
    }


    return {
      handleStartingToWork,
      handleAddUser,
      handleClickOption,
      isShowRegister,
      form,
      isStartingWork,
      questionList,
      questionIndex,
      isShowScoreBox,
      score,
      allQuestionComputed,
      answerQuestionComputed,
      handleShowAnswer,
      isShowAnswer,
      handleShowRanking,
      isShowRanking,
      rankingUsers,
      handleHideScoreBox,
      rightButtons,
      rightButtonActiveIndex,
      handleShowActiveClass,
      handleHideActiveClass
    }
  }
}
</script>

<style scoped lang="less">
.examination-container {
  position: relative;
  width: 1200px;
  margin: 0 auto;

  .question {
    margin-top: 100px;

    .question-title {
      font-size: 26px;
      text-align: center;
      margin-bottom: 40px;
    }

    .qid {
      position: absolute;
      right: 130px;
      top: 100px;
      padding: 20px 40px;
      background-color: red;
      font-size: 20px;
      color: #000;
    }

    .answer {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      height: 400px;

      .answer-item {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 350px;
        height: 60px;
        border: 2px solid #000;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }
    }
  }

  .examination-title h1 {
    padding: 20px 0;
    font-size: 40px;
    font-weight: bolder;
    text-align: center;
    user-select: none;
  }

  .start {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 200px auto;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 2px solid #000;
    cursor: pointer;
    user-select: none;
    font-size: 30px;
  }

  .register {
    position: fixed;
    left: 50%;
    top: 400px;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 300px;
    background-color: #fff;
    border: 2px solid #000;
    padding: 20px 120px;
    box-sizing: border-box;

    .register-username {
      margin-bottom: 30px;

      .username {
        font-size: 20px;
        font-weight: bolder;
      }

      & input {
        height: 20px;
      }
    }

    .register-gender {

      .gender {
        font-size: 20px;
        font-weight: bolder;
      }

      .man,
      .woman {
        padding: 3px 10px;
        background-color: #4F9CEE;
        border-radius: 4px;
        font-size: 20px;
      }

      .woman {
        background-color: hotpink;
      }

      #man {
        margin-right: 20px;
      }
    }

    .buttons {
      position: absolute;
      right: 50%;
      bottom: 0;
      transform: translate(50%);
      padding: 40px 20px;

      .affirm {
        padding: 10px 40px;
        background-color: #4F9CEE;
        color: #fff;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }
    }
  }


  .score-situation {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -10%);
    width: 100%;
    //height: 120%;
    height: 640px;
    padding: 20px 0;
    background-color: #fff;
    border: 2px solid #000;

    .score-situation-center {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;

      .title {
        padding: 10px 10px;
        font-size: 40px;
        font-weight: bolder;
        text-align: center;
      }

      .score {
        font-size: 70px;
        color: red;
        padding: 10px 10px;

        .score-text {
          font-size: 40px;
          font-weight: bolder;
          color: #000;
        }
      }

      .jiangbei {
        width: 200px;
        height: 200px;
      }

      .question-result {
        font-size: 20px;
        font-weight: bolder;

        .question-result-num {
          color: red;
        }
      }

      .again {
        width: 320px;
        height: 50px;
        text-align: center;
        line-height: 50px;
        background-color: #b9e0ed;
        user-select: none;
        cursor: pointer;
        margin-top: 10px;
      }

      .center-buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        margin-top: 10px;

        .check-answer,
        .check-wrong {
          width: 150px;
          height: 50px;
          text-align: center;
          line-height: 50px;
          background-color: #3d5ca8;
          user-select: none;
          cursor: pointer;
        }

        .check-wrong {
          margin-left: 20px;
          background-color: orangered;
        }
      }

    }

    .score-situation-left {
      height: 100%;
      width: 450px;

      .left-answer-title {
        font-size: 26px;
        font-weight: bold;
        text-align: center;
      }

      .left-answer {
        margin-top: 40px;
      }

      .left-answer-list {
        margin-bottom: 20px;
        overflow: hidden;

        .answer-left {
          float: right;
        }

        .answer-wrong {
          text-decoration: line-through;
          color: #999;
          margin-right: 5px;
        }

        .answer-daan {
          color: green;
        }
      }

    }

    .score-situation-right {
      height: 100%;

      .right-bottom-text {
        font-size: 14px;
        text-align: center;
        margin-top: 10px;
      }

      .right-title {
        font-size: 26px;
        text-align: center;
        font-weight: bolder;
        margin-bottom: 20px;
      }

      .ranking-list {
        padding: 15px;
        overflow: hidden;

        .ranking-num {
          float: left;
          font-size: 26px;
          margin-right: 10px;
        }

        .ranking-right {
          float: left;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;

          .ranking-user-gender {
            font-size: 26px;
          }

          .ranking-score {
            margin-left: 20px;
            color: red;
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>