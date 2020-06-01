<template>
  <div class="login">
    <div class="login-box">
      <div class="avatar-box">
        <img src="../assets/img/logo.png">
      </div>
      <el-form ref="form" :model="form" :rules="rules" label-width="0px" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import {request} from "../network/request";

  export default {
    name: "Login",
    data() {
      return {
        form: {
          username: 'admin',
          password: '123456'
        },
        rules: {
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      resetForm(formName) {
        this.$refs.form.resetFields();
      },
      login() {
        this.$refs.form.validate((valid) => {
          if(!valid) return;
            this.$http.post('login', this.form).then(res => {
              const data = res.data;
              //console.log(data);
              if(data.meta.status != 200) {
                return this.$message.error("登录失败")
              } else {
                this.$message.success("登录成功")
                window.sessionStorage.setItem('token', data.data.token)
                //console.log(data.data.token);
                this.$router.push('/home')
              }
            })
        })
      }
    }
  }
</script>

<style scoped>
  .login {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar-box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
  }

  .avatar-box>img {
    width: 100%;
    height: 100%;
    border-radius: 100%;
    background-color: #eee;
  }

  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>
