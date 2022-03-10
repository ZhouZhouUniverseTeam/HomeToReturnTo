import { createApp } from "vue";
import App from "./App.vue";

// 引入路由文件
import router from "./routes";
// 导入Vuex
// import store from "./store";
// 导入清除浏览器默认样式代码
import "./assets/style/reset.css";

createApp(App).use(router).mount("#app");
