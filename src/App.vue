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

      <new-login @loginSuccess="loginActive=true" v-if="!loginActive"></new-login>
      <config-list @loginPast="loginActive=false" v-if="loginActive"></config-list>
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

const getCookie = (cookieName) => {
  const cookies = document.cookie.split("; ")
  for (let i = 0; i < cookies.length; i++) {
    const [name, value] = cookies[i].split("=")
    if (name === cookieName) {
      return decodeURIComponent(value)
    }
  }
  return ""
}
const loginActive = !!getCookie("JSESSIONID") ? ref(true) : ref(false);

const {locale} = useI18n({useScope: "global"});
locale.value = localStorage.getItem("locale") || "zh_CN";
const elLocale = computed(() => (locale.value === "zh_CN" ? zhCn : en));
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
