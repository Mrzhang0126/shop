<template>
    <div>
      <!-- 面包屑导航  -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card class="box-card">
        <!-- 提示区域 -->
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
        <!-- 步骤条区域（进度条） -->
        <el-steps :space="200" :active="parseInt(activeIndex)" finish-status="success" class="el-steps" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数" ></el-step>
          <el-step title="商品属性" ></el-step>
          <el-step title="商品图片" ></el-step>
          <el-step title="商品内容" ></el-step>
          <el-step title="完成" ></el-step>
        </el-steps>
        <!-- tabs区域 -->
        <el-form :model="goodsForm" :rules="goodsRules" ref="goodsRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabsLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="">
              <el-cascader v-model="goodsForm.goods_cat" :options="categoriesList" :props="categoriesProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
          <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 多选框数组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox class="el-checkbox" :label="child" v-for="(child, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals[i]" v-for="(cb, i) in item.attr_vals" :key="i"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview"
              :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="goodsForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btn-add" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        </el-form>
      </el-card>

      <!-- 图片预览 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" >
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>

    </div>
</template>

<script>
  import _ from 'lodash' // 导入深拷贝依赖
  export default {
    name: "Add",
    data() {
      return {
        activeIndex: '0',
        // 添加商品表单
        goodsForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 商品所属的分类数组
          goods_cat: [],
          // 上传图片的数组
          pics: [],
          // 商品的详情描述
          goods_introduce: '',
          attrs: []
        },
        // 添加商品表单规则
        goodsRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
          goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
          goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
          goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
        },
        // 商品分类数据列表
        categoriesList: [],
        categoriesProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        // 动态参数数据
        manyTableData: [],
        // 静态属性数据列表
        onlyTableData: [],
        // 上传图片的地址
        uploadURL: 'http://timemeetyou.com:8889/api/private/v1/upload',
        // 图片上传组件的请求头对象header
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        previewVisible: false
      }
    },
    created() {
      this.getGoodsCategoriesList()
    },
    computed: {
      categoryId() {
        if (this.goodsForm.goods_cat.length === 3) {
          return this.goodsForm.goods_cat[2]
        }
        return null
      }
    },
    methods: {
      // 获取所有商品分类数据
      getGoodsCategoriesList() {
        this.$http.get('categories').then(result => {
          const res = result.data
          if (res.meta.status !== 200) {
            return this.$message.error('获取商品分类数据失败')
          }
          this.categoriesList = res.data
          //console.log(this.categoriesList);
        })
      },
      // 级联选择器发生变化会触发该函数
      handleChange() {
        if (this.goodsForm.goods_cat.length !== 3) {
          this.goodsForm.goods_cat = []
        }
      },
      beforeTabsLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.goodsForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品分类')
          return false
        }
      },
      async tabClicked() {
        // 访问的是动态参数面板
        if (this.activeIndex === '1') {
          // console.log('789')categoryId
          const {data: res} = await this.$http.get(`categories/${this.categoryId}/attributes`, {
            params: {sel: 'many'}
          })

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态数据列表失败')
        }
          //console.log(res.data);
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
        this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.categoryId}/attributes`, {
            params: {sel: 'only'}
          })

          if (res.meta.status !== 200) {
            return this.$message.error('获取静态属性数据列表失败')
          }
          console.log(res.data);
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.onlyTableData = res.data
        }
      },
      // 处理图片预览效果
      handlePreview(file) {
        //console.log(file)
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      // 处理移除图片的操作
      handleRemove(file) {
        // 1.获取将要删除的图片临时路径
        const filePath = file.response.data.tmp_path
        // 2.从pic数组找到将要删除的图片索引值
        const index = this.goodsForm.pics.findIndex(item => {
          return item.pic === filePath
        })
        console.log(index);
        // 3.调用splice方法删除
        this.goodsForm.pics.splice(index, 1)
      },
      // 监听文件上传成功时的钩子
      handleSuccess(response) {
        //console.log(response)
        // 1. 拼接得到一个图片信息对象
        const picInfo = {pic: response.data.tmp_path}
        // 2.添加到数组
        this.goodsForm.pics.push(picInfo)
      },
      // 添加商品按钮事件（商品内容里面，富文本编辑器下面的按钮-添加商品）
      addGoods() {
        this.$refs.goodsRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项！')
          }
          // 执行添加的业务逻辑
          // lodash cloneDeep(obj) 深拷贝
          const form = _.cloneDeep(this.goodsForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo ={attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')}
            this.goodsForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals}
            this.goodsForm.attrs.push(newInfo)
          })
          form.attrs = this.goodsForm.attrs
          console.log(form);
          // 发起请求，添加商品
          // 商品名称必须是惟一的
          const {data: res} = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
      }
    }
  }
</script>


<style scoped>
  .el-steps {
    margin: 15px 0;
  }

  el-step {
    font-size: 10px;
  }

  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btn-add {
    margin-top: 15px;
  }
</style>
