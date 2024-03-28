<template>

  <div>
    <div class="container">
      <div class="login-wrapper">
        <div class="header">Login</div>
        <div class="form-wrapper">
          <el-input class="input-item" v-model="username" placeholder="USERNAME"/>
          <el-input class="input-item" type="password" v-model="pwd" placeholder="PASSWORD"
                    @keydown.enter="loginHandler"/>
          <el-button type="primary" class="btn" @click="loginHandler">{{ t("button.login") }}</el-button>
        </div>
        <div class="msg">
          Smart Config Login
        </div>
      </div>
    </div>
  </div>


</template>

<script setup>
import {ref, defineEmits} from 'vue';
import axios from "./../axios";
// 导入t函数
import {useI18n} from "vue-i18n";
import {ElNotification} from "element-plus";

const {t} = useI18n();

const username = ref("")
const pwd = ref("")
// 定义登录成功事件
const emits = defineEmits(['loginSuccess']);


const loginHandler = () => {
  if (!username.value || !pwd.value) {
    ElNotification({
      title: t("login.errorTitle"),
      message: t("login.inputEmpty"),
      type: 'warning',
      duration: 2000,
    })
    return;
  }

  login(username.value, pwd.value)
}

const login = (username, pwd) => {
  axios.post("config/login?" + `username=${username}&password=${pwd}`).then(resp => {
    ElNotification({
      title: '登录成功',
      message: "",
      type: 'success',
    })
    // 触发登录成功事件
    emits('loginSuccess');
  }).catch(e => {
  }).finally(() => {

  })
}

</script>

<style>
* {
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
}

body {
  height: 100%;
}

.container {
  /* 使用视口高度作为最小高度 */
  min-height: 100vh;
  background-image: linear-gradient(to right, #999999, #330867);
}

.login-wrapper {
  background-color: bisque;
  width: 358px;
  height: 480px;
  border-radius: 15px;
  padding: 0 50px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 25%);
}

.header {
  font-size: 35px;
  font-weight: bold;
  text-align: center;
  line-height: 120px;
}

.input-item {
  margin-bottom: 20px;
  border: 0;
  padding: 10px;
  font-size: 15px;
  height: 60px;
}

.input-item::placeholder {
  text-transform: uppercase;
}

.btn {
  text-align: center;
  padding: 10px;
  width: 100%;
  margin-top: 40px;
  background-image: linear-gradient(to right, #a6c1ee, #fbc2eb);
  color: #fff;
}

.msg {
  text-align: center;
  line-height: 88px;
}

a {
  text-decoration-line: none;
  color: #abc1ee;
}
</style>