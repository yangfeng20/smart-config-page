import {createApp} from "vue";
import "./style.css";
import ElementPlus from "element-plus";
import 'element-plus/dist/index.css'
import App from "./App.vue";

// 国际化配置
import i18n from "./lang";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";

const app = createApp(App);

// axios
import axios from "./axios";
app.config.globalProperties['$axios'] = axios;

app.use(ElementPlus, {
    locale: localStorage.getItem("locale") === "zh_CN" ? zhCn : en,
});
app.use(i18n);
app.mount("#app");