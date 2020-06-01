<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-alert show-icon title="注意：只允许第三级分类设置相关参数" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCategory" :options="categoriesList" :props="categoriesProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="isShowDialog=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index"
                        closable class="el-tag" @close="handleClosed(index, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- <template slot-scope="scope"> -->
              <template v-slot="slot">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(slot.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="isShowDialog=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index"
                        closable class="el-tag" @close="handleClosed(index, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- <template slot-scope="scope"> -->
              <template v-slot="slot">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(slot.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数/静态属性的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="isShowDialog" width="50%" @close="dialogClosed">
      <!-- 添加动态参数的表单 -->
      <el-form :model="paramsForm" :rules="paramsRules" ref="paramsRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="paramsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
         <el-button @click="isShowDialog = false">取 消</el-button>
         <el-button type="primary" @click="submitParamsForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加编辑的对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="isShowEditDialog" width="50%" @close="editDialogClosed">
      <!-- 修改参数的表单 -->
      <el-form :model="editForm" :rules="editRules" ref="editRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
         <el-button @click="isShowEditDialog = false">取 消</el-button>
         <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        // 商品分类列表
        categoriesList: [],
        // 级联选择框配置
        categoriesProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children',
          // 是否严格的遵守父子节点不互相关联
          checkStrictly: true
        },
        // 级联选择框双向绑定
        selectedCategory: [],
        // 被激活的页签名称
        activeName: 'many',
        // 动态参数数据
        manyTableData: [],
        // 静态属性数据
        onlyTableData: [],
        // 是否显示动态参数/静态属性的对话框
        isShowDialog: false,
        // 添加的表单
        paramsForm: {
          attr_name: ''
        },
        // 添加的表单的验证规则
        paramsRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        // 修改对话框的显示与隐藏
        isShowEditDialog: false,
        //修改对话框的表单对象
        editForm: {
          attr_name: ''
        },
        // 修改对话框的表单对象的验证规则
        editRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        // // 控制按钮与文本框的切换显示
        // inputVisible: false,
        // // 文本框输入的内容
        // inputValue: ''
      }
    },
    computed: {
      // 按钮被禁用返回true, 否则false
      isButtonDisabled() {
        return this.selectedCategory.length !== 3 ? true: false
      },
      // 当前选中的三级分类id
      selectedCategoryId() {
        if (this.selectedCategory.length === 3) {
          return this.selectedCategory[2]
        }
        return null
      },
      // 动态获取动态参数/静态属性的标题文本
      titleText() {
        return this.activeName === 'many'? '动态参数': '静态属性'
      }
    },
    created() {
      this.getCategories()
    },
    methods: {
      async getCategories() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }
        this.categoriesList = res.data
      },
      // 级联选择框选项变化，会触发该函数
      handleChange() {
        this.getParamsData()
      },
      // tab 页签点击事件
      handleTabsClick() {
        this.getParamsData()
      },
      // 获取参数列表数据
      getParamsData() {
        // 选中的不是三级分类
        if (this.selectedCategory.length !== 3) {
          this.selectedCategory = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        // 根据所选的分类id,和当前所处的面板，获取对应的参数
        this.$http.get(`categories/${this.selectedCategoryId}/attributes`, {
          params: {sel: this.activeName}
        }).then(result => {
          const res = result.data
          if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')

          //console.log(res.data);
          // 处理attr_vals字符串
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []

            //增加一个控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框输入的值
            item.inputValue = ''
          })
          // 动态参数数据
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else { // 静态属性数据
            this.onlyTableData = res.data
          }
        })
      },
      // 关闭动态参数/静态属性的对话框
      dialogClosed() {
        this.$refs.paramsRef.resetFields()
      },
      // 动态参数/静态属性的对话框的确定按钮点击事件（发送请求）
      submitParamsForm() {
        this.$refs.paramsRef.validate(valid => {
          if (!valid) return
          this.$http.post(`categories/${this.selectedCategoryId}/attributes`, {
            attr_name: this.paramsForm.attr_name,
            attr_sel: this.activeName
          }).then(result => {
            const res = result.data
            if (res.meta.status !== 201) {
              return this.$message.error('添加参数失败')
            }
            this.$message.success('添加参数成功')
            this.getParamsData()
            this.isShowDialog = false
          })
        })
      },
      // 编辑按钮事件监听
      showEditDialog(attr_id) {
        // 查询当前参数的信息
        this.$http.get(`categories/${this.selectedCategoryId}/attributes/${attr_id}`, {
          params: {attr_sel: this.activeName}
        }).then(result => {
          const res = result.data
          if (res.meta.status !== 200) {
            return this.$message.error('获取参数信息失败')
          }
          this.editForm = res.data
          this.isShowEditDialog = true
        })

      },
      //  修改对话框关闭事件监听
      editDialogClosed() {
        this.$refs.editRef.resetFields()
      },
      // 修改对话框确定事件监听(提交修改的信息)
      submitEditForm() {
        this.$refs.editRef.validate(valid => {
          if (!valid) return
          this.$http.put(`categories/${this.selectedCategoryId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }).then(result => {
            const res = result.data
            if (res.meta.status !== 200) {
              return this.$message.error('修改参数失败')
            }
            this.$message.success('修改参数成功')
            this.getParamsData()
            this.isShowEditDialog = false
          })
        })
      },
      // 删除按钮事件监听
      removeParams(attr_id) {
        this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`categories/${this.selectedCategoryId}/attributes/${attr_id}`).then(result => {
            const res = result.data
            if (res.meta.status !== 200) {
              return this.$message.error('删除参数失败')
            }
            this.getParamsData()
            this.$message({type: 'success', message: '删除成功!'});
          })

        }).catch(() => {
          this.$message({type: 'info', message: '已取消删除'});
        });
      },
      // 文本框失去焦点或按下enter都会触发该函数
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputVisible = false
          row.inputValue = ''
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputVisible = false
        row.inputValue = ''

        this.saveAttrvals(row)
      },
      // 发起请求，保存修改的Tag数据
      saveAttrvals(row) {
        // 发起请求，保存这次数据操作
        this.$http.put(`categories/${this.selectedCategoryId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }).then(result => {
          const res = result.data
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数项失败!')
          }
          this.$message.success('修改参数项成功!')
        })
      },
      // 点击按钮，显示文本输入框
      showInput(row) {
        row.inputVisible = true
        // 让文本框自动获得焦点
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // 删除Tag 标签按钮事件
      handleClosed(index, row) {
        row.attr_vals.splice(index, 1)
        this.saveAttrvals(row)
      }
    }
  }
</script>

<style scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
