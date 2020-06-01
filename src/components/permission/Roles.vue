<template>
    <div>
      <!-- 面包屑导航  -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图  -->
      <el-card class="box-card">
        <el-row>
          <el-col>
            <el-button type="primary">添加角色</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 角色列表区域  -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列  -->
        <el-table-column type="expand">
          <template v-slot="slot">
            <el-row v-for="(item1,index) in slot.row.children" :key="item1.id"
                    :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']">
              <!-- 渲染一级权限  -->
              <el-col :span="5">
                <el-tag class="el-tag" closable @close="detetePermit(slot.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限  -->
              <el-col :span="19">
                <el-row v-for="(item2, indey) in item1.children" :key="item2.id"
                        :class="[indey === 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="detetePermit(slot.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, indez) in item2.children"
                            :key="item3.id" closable @close="detetePermit(slot.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>

            </el-row>
<!--            <pre>{{slot.row}}</pre>-->
          </template>
        </el-table-column>
        <!-- 索引列  -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRolePermit(slot.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分配权限对话框  -->
      <el-dialog title="分配权限" :visible.sync="isShowPermitDialog" width="50%" @close="closeDialog">
        <!-- 树形控件  -->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id"
                 default-expand-all :default-checked-keys="defaultRoles" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="isShowPermitDialog = false">取 消</el-button>
          <el-button type="primary"  @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        rolesList: [],
        isShowPermitDialog: false, // 分配权限对话框的显示与隐藏
        rightsList: [], // 所有权限数据
        treeProps: { // 树形控件绑定的属性
          label: 'authName',
          children: 'children'
        },
        defaultRoles: [], //默认选中节点id值
        roleId: '', // 即将分配角色权限的id
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      // 获取所有角色列表
      getRolesList() {
        this.$http.get('roles').then(result => {
          const res = result.data;
          //console.log(res);
          this.rolesList = res.data
        })
      },
      // 是否删除三级标签
      detetePermit(role, rightId) {
        // 显示弹框是否删除
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(result => {
            const res = result.data;
            //console.log(res);
            if (res.meta.status !== 200) return this.$message.error('删除角色权限失败')
            // 刷新界面
            //this.getRolesList();
            role.children = res.data;
            this.$message({type: 'success', message: '删除角色权限成功!'})
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      //分配权限按钮事件
      setRolePermit(role) {
        this.roleId = role.id
        // 获取所有权限数据
        this.$http.get('rights/tree').then(result => {
          const res = result.data;
          this.rightsList = res.data;
          //console.log(this.rightsList);
        })

        // 获取三级节点

        this.getLeafKeys(role, this.defaultRoles)

        this.isShowPermitDialog = true
      },

      //通过递归，获取角色下所有三级权限的id，并保存到defaultRoles
      // 如果当前node不包含children属性，则为三级节点
      getLeafKeys(node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },

      //关闭分配权限对话框
      closeDialog() {
        //console.log("关闭会话框")
        this.defaultRoles = [];
      },
        // 点击为角色分配权限
      allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',');

        this.$http.post(`roles/${this.roleId}/rights`, {
          rids: idStr
        }).then(result => {
          const res = result.data;
          if (res.meta.status !== 200) {
            return this.$message.error('分配权限失败')
          }
          this.$message.success('分配权限成功')
        })

        this.getRolesList();

        this.isShowPermitDialog = false
      }
    }
  }
</script>

<style scoped>
.el-tag {
  margin: 10px;
}
  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
