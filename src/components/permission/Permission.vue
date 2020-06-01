<template>
    <div>
      <!-- 面包屑导航  -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图  -->
      <el-card class="box-card">
        <el-table :data="permissionsList" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="权限名称" prop="authName"></el-table-column>
          <el-table-column label="路径" prop="path"></el-table-column>
          <el-table-column label="权限等级" prop="level">
            <template v-slot="slot">
              <el-tag v-if="slot.row.level === '0'">一级</el-tag>
              <el-tag type="success" v-else-if="slot.row.level === '1'">二级</el-tag>
          <!-- <el-tag type="warning" v-else-if="slot.row.level === '2'">三级</el-tag>-->
              <el-tag type="danger" v-else-if="slot.row.level === '2'">三级</el-tag>
          </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
</template>

<script>
  export default {
    name: "Permission",
    data() {
      return {
        permissionsList: []
      }
    },
    created() {
      this.getPermissionList()
    },
    methods: {
      //获取所有权限
      getPermissionList() {
        this.$http.get('rights/list').then(result => {
          const res = result.data;
          console.log(res);
          this.permissionsList = res.data
        })
      }
    }
  }
</script>

<style scoped>

</style>
