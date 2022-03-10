/**
 * 生成一个用不重复的ID
 * 时间戳 + 随机数前置 36进制 + 随机数长度控制
 */
export function GenNonDuplicateID(randomLength){
    return Number(Math.random().toString().substr(2,randomLength) + Date.now()).toString(36)
}
//GenNonDuplicateID()将生成 rfmipbs8ag0kgkcogc 类似的ID