import XtxMessage from "./Message/Message.vue";
// 引入创建虚拟DOM的方法
import {createVNode, render} from "vue";
const container = document.createElement('div');
document.body.appendChild(container);

let timer = null;

export function Message({ type, text }) {
    // 将Message但文本组件传唤为虚拟DOM
    const vNode = createVNode(XtxMessage, { type, text });
    // 将创建好的虚拟DOM渲染到container容器中
    render(vNode, container);
    // 清除定时器
    clearInterval(timer);
    // 开启定时器，三秒后隐藏Message组件
    timer = setInterval(() => {
        render(null, container);
    }, 3000);
}