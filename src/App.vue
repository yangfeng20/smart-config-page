<!-- src/App.vue -->
<template>
  <div>
    <el-config-provider :locale="elLocale">

      <el-switch
          v-model="langSwitch"
          style="
        position: absolute;
        right: 200px;
        top:10px;
        --el-switch-on-color: #13ce66;
        --el-switch-off-color: #ff4949;"
          inline-prompt
          active-text="Zh"
          inactive-text="En"
          @change.native="handleChangeI18n"/>

      <new-login v-if="!loginActive"></new-login>
      <config-list v-if="loginActive"></config-list>
    </el-config-provider>
  </div>

</template>

<script setup>
import {ref, computed} from "vue";
// i18n
import {useI18n} from "vue-i18n";
// Element Plus全局配置国际化
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";

const loginActive = ref(true);

const {locale} = useI18n({useScope: "global"}); // vue-i18n提供了一个钩子函数 useI18n(),暴露出locale属性用于切换语言
locale.value = localStorage.getItem("locale") || "zh_CN"; // 页面首次加载显示的语言
const elLocale = computed(() => (locale.value === "zh_CN" ? zhCn : en)); // Element Plus组件国际化
// 中英文切换开关
const langSwitch = ref(locale.value === "zh_CN");
// 中英文切换事件
const handleChangeI18n = (val) => {
  locale.value = val ? "zh_CN" : "en_US"; // true为中文，false为英文
  localStorage.setItem("locale", locale.value); // 本地缓存当前页面语言
};


</script>

<style scoped>

</style>
