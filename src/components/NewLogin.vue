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
// 导入t函数
import {useI18n} from "vue-i18n";

const {t} = useI18n();
</script>
<script>
import {ElNotification} from 'element-plus'

export default {
  name: "NewLogin",
  data() {
    return {
      username: "",
      pwd: "",
    }
  },
  methods: {

    loginHandler() {
      if (!this.username || !this.pwd) {
        ElNotification({
          title: this.t("login.errorTitle"),
          message: this.t("login.inputEmpty"),
          type: 'warning',
          duration: 2000,
        })
        return;
      }

      this.login(this.username, this.pwd)
    },

    login(username, pwd) {

      this.$axios.post("/login", {
        username, pwd
      }).then(resp => {

      }).catch(e => {
        ElNotification({
          title: '登录失败',
          message: e,
          type: 'error',
        })
      }).finally(() => {

      })
    },
  }
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