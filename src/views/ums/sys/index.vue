<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
            style="float:right"
            type="primary"
            @click="handleSearchList()"
            size="small">
          查询搜索
        </el-button>
        <el-button
            style="float:right;margin-right: 15px"
            @click="handleResetSearch()"
            size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="大陆客户：">
            <el-select v-model="listQuery.enumType" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in SysEnumMap"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()">添加数据</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="sysEnumTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="订单编号" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.custOrderNo }}</template>
        </el-table-column>
        <el-table-column label="下单日期" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.orderDate | formatDate }}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatCreateTime }}</template>
        </el-table-column>
        <el-table-column label="内地客户" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.localCust }}</template>
        </el-table-column>
        <el-table-column label="香港客户" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.hkCust }}</template>
        </el-table-column>
        <el-table-column label="品类" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.goodType | formatOptionData(goodTypeOptions) }}</template>
        </el-table-column>
        <el-table-column label="规格" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.packingType | formatOptionData(packingTypeOptions) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
          bacround
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes,prev, pager, next,jumper"
          :current-page.sync="listQuery.pageNum"
          :page-size="listQuery.pageSize"
          :page-sizes="[5,10,15]"
          :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import {fetchOptions, getOption, addOptions, updateOptions} from '@/api/sysEnum'
import {formatDate} from '@/utils/date';

const defaultQuery = {
  pageNum: 1,
  pageSize: 10,
  enumType: null,
};
export default {
  name: "sysEnumList",
  data() {
    return {
      listQuery: Object.assign({}, defaultQuery),
      listLoading: true,
      list: null,
      total: null,
      SysEnumMap: []
    }
  },
  mounted() {
    this.fetchOptions();
    this.getList();
  },
  filters: {
    formatCreateTime(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    formatOptionData(code, options) {
        for (let item of options) {
          if (item.enumCode == code) {
            return item.enumValue;
          }
        }
        return code;
    }
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleAdd() {
      this.$router.push({path: '/ums/addSys'})
    },
    handleUpdate(index, row) {
      this.$router.push({path: '/ums/updateSys', query: {id: row.id}})
    },
    getList() {
      this.listLoading = true;
      getOption(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    fetchOptions() {
      fetchOptions("SYS_ENUM_MAP").then(response => {
        this.SysEnumMap = response.data;
      });
    },

  }
}
</script>
<style scoped>
.input-width {
  width: 203px;
}
</style>


