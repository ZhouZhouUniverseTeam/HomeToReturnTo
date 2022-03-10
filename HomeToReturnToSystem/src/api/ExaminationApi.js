import {requestWithoutToken} from "../utils/request";

// 检查用户是否存在
export function checkUsernameExists({id, username}) {
    return requestWithoutToken('/examination/checkUsername', 'get', {id, username})
}

// 添加用户
export function addUserNicknameAndGender({id,username, gender}) {
    return requestWithoutToken('/examination/adduser', 'post', {id,username, gender});
}

// 获取题目
export function getQuestionData() {
    return requestWithoutToken('/examination/question', 'get');
}

// 添加一条排行榜数据
export function addRankingData({raid, score, username, uid}) {
    return requestWithoutToken('/examination/ranking', 'post', {raid, score, username, uid});
}

export function getRankingUser() {
    return requestWithoutToken('/examination/rankingUser', 'get');
}