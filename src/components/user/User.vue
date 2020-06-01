<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <el-card class="box-card">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
          </el-col>
        </el-row>

        <el-table :data="userList" border stripe class="el-table">
          <el-table-column type="index" label="#"/>
          <el-table-column label="姓名" prop="username"/>
          <el-table-column label="邮箱" prop="email"/>
          <el-table-column label="电话" prop="mobile"/>
          <el-table-column label="角色" prop="role_name"/>
          <el-table-column label="状态" prop="ms_state">
<!--            <template v-slot="slot">-->
            <template slot-scope="scope">
<!--                 {{scope.row}}-->
              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px">
            <template v-slot="slot">
              <!-- 修改用户-->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditUser(slot.row.id)"></el-button>
              <!-- 删除用户-->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(slot.row.id)"></el-button>

              <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="allocateRole(slot.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
          :total="total" class="el-pagination">
        </el-pagination>
      </el-card>

      <!--  添加用户对话框  -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="resetUserForm">
        <el-form :model="userForm" :rules="userRules" ref="ruleForm" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="userForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="userForm.mobile"></el-input>
          </el-form-item>
        </el-form>
       <span slot="footer" class="dialog-footer">
         <el-button @click="dialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="addNewUser">确 定</el-button>
       </span>
      </el-dialog>

      <!--修改用户对话框-->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="findUserInfo" :rules="findUserInfoRules" ref="findUserInfoRef"
                 label-width="70px" @close="editResetUserInfoForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="findUserInfo.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="findUserInfo.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="findUserInfo.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"  @click="editSubmitUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!--分配角色对话框-->
      <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%" @close="roleDialogClosed">
        <div>
          <p>当前用户： {{userInfo.username}}</p>
          <p>当前角色： {{userInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
           <el-button @click="roleDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    name: "User",
    data() {
      //验证邮箱的规则
      let checkEmail = (rule, value, callback) => {
        const regEmail = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if (regEmail.test(value)) {
          return callback();
        } else {
          callback(new Error('请输入合法的邮箱'));
        }
      }
      //验证手机号码规则
      let checkTelephone = (rule, value, callback) => {
          const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
          if (regMobile.test(value)) {
            return callback()
          } else {
            callback(new Error('请输入合法的手机号'));
          }
      }
      return {
        queryInfo: {// 获取用户列表的参数对象
          query: '',
          pagenum: 1, // 当前页数
          pagesize: 5 //当前每页显示多少条数据
        },
        userList: [],
        total: 0,
        dialogVisible: false, //控制添加用户对话框的显示与隐藏
        userForm: { //添加用户的表单数据
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        userRules: { //添加表单的验证规则
          username: [
            {required: true, message: '请输入用户名', tigger: 'blur'},
            {min: 3, max: 10,message: '用户名长度3~10个字符之间', tigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', tigger: 'blur'},
            {min: 6, max: 16,message: '用户名长度6~16个字符之间', tigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', tigger: 'blur'},
            {validator: checkEmail, tigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入电话', tigger: 'blur'},
            {validator: checkTelephone, tigger: 'blur'}
          ]
        },
        editDialogVisible: false, // 修改用户对话框
        findUserInfo: {}, //查找的用户信息
        findUserInfoRules: {//修改表单用户信息的校验规则
          email: [
            {required: true, message: '请修改邮箱', tigger: 'blur'},
            {validator: checkEmail, tigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请修改电话', tigger: 'blur'},
            {validator: checkTelephone, tigger: 'blur'}
          ]
        },

        //分配角色对话框显示与隐藏
        roleDialogVisible: false,
        // 需要被分配角色的用户信息
        userInfo: {},
        //所有角色列表
        rolesList: [],
        // 已选中的角色Id值
        selectedRoleId: ''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.$http.get('users',
          {params: this.queryInfo
          })
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户列表失败")
        }
        this.userList = res.data.users
        this.total = res.data.total
      },

      handleSizeChange(newsize) {
        // console.log(newsize);
        this.queryInfo.pagesize = newsize
        this.getUserList();
      },
      handleCurrentChange(newpage) {
        // console.log(newpage);
        this.queryInfo.pagenum = newpage
        this.getUserList()
      },

      async userStateChange(userInfo) {
        console.log(userInfo);
        // this.$http.put('users/:uid/state/:type')
        const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state

          return this.$message.error('更新用户失败')
        }
        this.$message.success('更新用户成功')
      },
      // 重置添加用户表单
      resetUserForm() {
        this.$refs.ruleForm.resetFields();
      },
      // 点击确定按钮，添加用户
      addNewUser() {
        this.$refs.ruleForm.validate(valid => {
          //console.log(valid);
           if (!valid) return
          this.$http.post('users', this.userForm).then(res => {
            const data = res.data;
            console.log(data);
            if (data.meta.status !== 201) {
              this.$message.error('添加用户失败')
            } else {
              this.$message.success('添加用户成功')
              // 隐藏对话框
              this.dialogVisible = false;
              // 刷新用户列表
              this.getUserList()
            }

          }).catch(error => {

          })
        })
      },

      //修改用户
      async showEditUser(id) {
        //console.log(id);
        const {data: res} = await this.$http.get('users/' + id)

        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败')
        }
        this.findUserInfo = res.data;
        this.editDialogVisible = true
      },
      //重置恢复数据
      editResetUserInfoForm() {
        this.$refs.findUserInfoRef.resetFields();
      },
      editSubmitUserInfo() { //修改完成提交用户信息
        this.$refs.findUserInfoRef.validate(valid => {
          if (!valid) return
          this.$http.put('users/' + this.findUserInfo.id, {
            email: this.findUserInfo.email,
            mobile: this.findUserInfo.mobile
          }).then(res => {
            const data = res.data;
            if (data.meta.status !==200) {
              this.$message.error('更新用户信息失败')
            } else {
              this.editDialogVisible = false
              this.getUserList();
              this.$message.success('更新用户信息成功')
            }
          }).catch(error => {
            console.log(error)
          })
        });
      },
      //删除用户
      deleteUser(id) {
        // console.log(id)
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete('users/' + id).then(result => {
            const res = result.data;
            if (res.meta.status !== 200) return this.$message.error("删除用户失败")

            this.$message({type: 'success', message: '删除用户成功!'});
            this.getUserList();
          })

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      //分配角色按钮事件
      allocateRole(userInfo) {
        this.userInfo = userInfo

        //展开对话框之前，获取所有角色列表
        this.$http.get('roles').then(result => {
          const res = result.data;
          this.rolesList = res.data;
          //console.log(this.rolesList);
        })
        this.roleDialogVisible = true
      },
      // 分配角色对话框确定按钮事件(保存角色信息)
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error("请选择要分配的角色")
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })

        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败！')
        }
        this.$message.success('更新角色成功')
        this.getUserList();
        this.roleDialogVisible = false
      },
      // 监听关闭分配角色对话框
      roleDialogClosed() {
        this.selectedRoleId = ''
        this.userInfo = {}
      }
    }
  }
</script>

<style scoped>
  /*.box-card {*/
  /*  margin-top: 10px;*/
  /*}*/

  /*.table {*/
  /*  margin-top: 15px;*/
  /*  font-size: 12px;*/
  /*}*/
</style>
