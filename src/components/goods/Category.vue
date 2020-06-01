<template>
  <div>
    <!--   面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategory">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table :data="categoriesList" :columns="columns" :selection-type="false"
                  :expand-type="false" show-index index-text="#" border :show-row-hover="false" class="tree-table">
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operating" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="categoryDialog" width="50%" @close="categoryDialogCClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="categoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" >
          <el-cascader v-model="selectedKeys" :options="parentCategoryList" :props="cascaderProps"
            @change="cascaderChange" class="cascader" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="categoryDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitCatrgory">确 定</el-button>
      </span>

    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Category",
    data() {
      return {
        // 商品分类的数据列表
        categoriesList: [],
        // 查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        // 数据总条数
        total: 0,
        // 为tree-table指定定义
        columns: [
          {label: '分类名称', prop: 'cat_name'},
          // type: 表示将当前列定义为模板列
          // template: 表示当前这一列使用模板名称
          {label: '是否有效', type: 'template', template: 'isOk'},
          {label: '排序', type: 'template', template: 'sort'},
          {label: '操作', type: 'template', template: 'operating'}
        ],
        // 添加分类对话框的显示与隐藏
        categoryDialog: false,
        // 添加分类的表单对象
        categoryForm: {
          // 分类名称
          cat_name: '',
          // 父级分类 id
          cat_pid: 0,
          // 分类等级，默认要添加的是1级分类
          cat_level: 0
        },
        // 添加分类表单的验证规则
        categoryRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
          ],
          cat_pid: [],
          cat_level: []
        },
        // 父级分类列表
        parentCategoryList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          // 是否严格的遵守父子节点不互相关联
          checkStrictly: true
        },
        // 选中的父级分类id
        selectedKeys: []
      }
    },
    created() {
      this.getCategoryList()
    },
    methods: {
      async getCategoryList() {
        const {data: res} = await this.$http.get('categories', {
          params: this.queryInfo
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败')
        }
        this.categoriesList = res.data.result
        this.total = res.data.total
        //console.log(this.categoriesList);
      },
      // 监听pagesize改变
      handleSizeChange(newsize) {
        this.queryInfo.pagesize = newsize
        this.getCategoryList()
      },
      // 监听 pagenum 改变
      handleCurrentChange(newpage) {
        this.queryInfo.pagenum = newpage
        this.getCategoryList()
      },
      // 添加分类按钮事件
      addCategory() {
        this.getParentCategory()

        this.categoryDialog = true
      },
      // 获取父级分类数据列表
      async getParentCategory() {
        const {data: res} = await this.$http.get('categories', {
          params: {
            type: 2
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('父级数据获取失败')
        }
        //console.log(res.data);
        this.parentCategoryList = res.data
      },
      // 选择项发生变化触发该函数
      cascaderChange() {
        // 如果 selectedKeys 中的length >0 证明选中了父级分类，反之则没有
        // 选中父级分类

        //console.log(this.selectedKeys);
        if (this.selectedKeys.length > 0) {
          // 父级分类的 id
          this.categoryForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 当前分类的等级赋值
          this.categoryForm.cat_level = this.selectedKeys.length
        } else {
          // 父级分类的 id
          this.categoryForm.cat_pid = 0
          // 当前分类的等级赋值
          this.categoryForm.cat_level = 0
        }
      },
      // 添加分类对话框的确定按钮事件
      submitCatrgory() {
        //console.log(this.categoryForm);
        this.$refs.categoryRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post('categories', this.categoryForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getCategoryList()
          this.categoryDialog = false
        })

      },
      // 监听添加分类对话框的关闭，重置表单数据
      categoryDialogCClosed() {
        this.$refs.categoryRef.resetFields()
        this.selectedKeys = []
        this.categoryForm.cat_pid = 0
        this.categoryForm.cat_level = 0
      }
    }
  }
</script>

<style scoped>
  .tree-table {
    margin-top: 15px;
  }

  .cascader {
    width: 100%;
  }
</style>
