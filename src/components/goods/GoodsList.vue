<template>
  <div>
    <!-- 面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGood">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
  export default {
    name: "GoodsList",
    data() {
      return {
        // 查询参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 商品数据
        goodsList: [],
        // 总数据条数
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    computed: {
    },
    methods: {
      // 根据分页获取对应商品数据列表
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods', {
          params: this.queryInfo
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        this.$message.success('获取商品列表成功')
        console.log(res.data);
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      //
      handleSizeChange(newsize) {
        this.queryInfo.pagesize = newsize
        this.getGoodsList()
      },
      handleCurrentChange(newpage) {
        this.queryInfo.pagenum = newpage
        this.getGoodsList()
      },
      // 删除按钮事件
      removeGoods(id) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`goods/${id}`).then(result => {
            const res = result.data
            if (res.meta.status !== 200) {
              return this.$message.error('删除商品失败')
            }
            this.getGoodsList()
            this.$message({type: 'success', message: '删除商品成功!'});
          })

        }).catch(() => {
          this.$message({type: 'info', message: '已取消删除'});
        });
      },
      // 添加商品 按钮事件
      goAddGood() {
        this.$router.push('/goods/add')
      }
    },
    filters: {
      // 处理时间
      dateFormat(num) {
        const date = new Date(num)
        const year = date.getFullYear()
        const month = (date.getMonth() + 1 + '').padStart(2, '0')
        const day = (date.getDate() + '').padStart(2, '0')
        const hours = (date.getHours() + '').padStart(2, '0')
        const minutes = (date.getMinutes() + '').padStart(2, '0')
        const seconds = (date.getSeconds() + '').padStart(2, '0')
        const str = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        return str
      }
    }
  }
</script>

<style scoped>

</style>
