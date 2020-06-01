<template>
  <el-container class="home-content">
    <el-header class="header">
      <div>
        <img src="../assets/img/heima.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="exit">退出</el-button>
    </el-header>

    <!-- 侧边栏-->
    <el-container>
      <el-aside class="aside" :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff"
                 unique-opened class="menu" :collapse="isCollapse" :collapse-transition="false"
                 router :default-active="activePath">
          <!--    可以写成  :default-active="$route.path"-->
          <!-- 一级菜单-->
          <el-submenu :index="item.id + '' " v-for="item in menuLists" :key="item.id">
            <!-- 一级菜单模板-->
            <template slot="title">
              <i :class="iconsObj[item.id]" class="iconfont"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单-->
            <el-menu-item :index=" '/' + childItem.path + '' " v-for="childItem in item.children"
                          :key="childItem.id" @click="showNavState('/' + childItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{childItem.authName}}</span>
              </template>
            </el-menu-item>

          </el-submenu>

        </el-menu>
      </el-aside>
      <el-main class="main">
      <!--    路由占位符    -->
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        menuLists: [],
        iconsObj: {
          "125": "iconfont icon-user",
          "103": "iconfont icon-tijikongjian",
          "101": "iconfont icon-shangpin",
          "102": "iconfont icon-danju",
          "145": "iconfont icon-baobiao"
        },
        isCollapse: false,
        activePath: ''
      }
    },
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      // 退出按钮
      exit() {
        window.sessionStorage.clear();
        this.$router.replace('/login')
      },
      // 获取所有的菜单
      getMenuList() {
        this.$http.get('menus').then(res => {
          //console.log(res.data)
          const data = res.data;
          this.menuLists = data.data;
        }).catch(error => {
          this.$message.error(error)
        })
      },
      // 点击按钮，切换菜单折叠
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      // 保存连接激活状态
      showNavState(path) {
        window.sessionStorage.setItem('activePath', path);
        this.activePath = path;
      }
    }
  }
</script>

<style scoped>
  .home-content {
    height: 100%;
  }
   .header {
     background-color: #373d41;
     display: flex;
     justify-content: space-between;
     padding-left: 0;
     align-items: center;
     color: #fff;
     font-size: 20px;
   }
  .header>div {
    display: flex;
    align-items: center;
  }

  .header>div >span {
    margin-left: 15px;
  }

  .aside {
    background-color: #333744;
  }

  .menu {
    border-right: none;
  }

  .main {
    background-color: #EAEDF1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
