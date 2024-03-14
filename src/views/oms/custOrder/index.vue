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
                    <el-form-item label="订单编号：">
                      <el-input v-model="listQuery.custOrderNo" class="input-width" placeholder="订单编号"></el-input>
                    </el-form-item>
          <el-form-item label="大陆客户：">
            <el-select v-model="listQuery.localCust" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in localCustOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="香港客户：">
            <el-select v-model="listQuery.hkCust" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in hkCustOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="品类：">
            <el-select v-model="listQuery.goodType" class="input-width" placeholder="全部" clearable>
              <el-option v-for="item in goodTypeOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="下单日期：">
            <el-date-picker
                class="input-width"
                v-model="listQuery.orderDate"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="请选择时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="listQuery.orderState" class="input-width" multiple placeholder="全部" clearable>
              <el-option v-for="item in stateOptions"
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
      <el-button size="mini" class="btn-add" @click="handleAdd()">客户下单</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="custOrderTable"
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
        <el-table-column label="运费" width="120" align="center">
          <template slot-scope="scope">￥{{ scope.row.freightFee }}</template>
        </el-table-column>
        <el-table-column label="总重量(Kg)" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.totalWeight }}</template>
        </el-table-column>
        <el-table-column label="总件数" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.totalNumber }}</template>
        </el-table-column>
        <el-table-column label="整件件数" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.fclNumber }}</template>
        </el-table-column>
        <el-table-column label="每件重量" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.unitWeight }}</template>
        </el-table-column>
        <el-table-column label="尾数1重量(Kg)" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.additionWeight1 }}</template>
        </el-table-column>
        <el-table-column label="尾数2重量(Kg)" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.additionWeight2 }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.state | formatOptionData(stateOptions) }}</template>
        </el-table-column>
        <el-table-column label="备注" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.remark }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
                size="mini"
                type="danger"
                @click="handleCancelOrder(scope.$index, scope.row)"
                v-show="scope.row.state===1">取消订单
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
    <el-dialog
        title="取消订单"
        :visible.sync="cancelOrder.dialogVisible" width="30%">
      <span style="vertical-align: top">操作备注：</span>
      <el-input
          style="width: 80%"
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          v-model="cancelOrder.remark">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCacnelOrderConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import qs from 'qs'
import {fetchOptions} from '@/api/sysEnum'
import {cancelOrder, fetchList} from '@/api/custOrder'
import {formatDate} from '@/utils/date';

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  custOrderNo: null,
  localCust: null,
  hkCust: null,
  goodType: null,
  orderState: [],
  createTime: null,
};
export default {
  name: "custOrderList",
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      listLoading: true,
      list: null,
      total: null,
      operateType: null,
      cancelOrder: {
        dialogVisible: false,
        content: null,
        id: null
      },
      stateOptions: [],
      goodTypeOptions: [],
      packingTypeOptions: [],
      hkCustOptions: [],
      localCustOptions: []
    }
  },
  mounted() {
    this.getList();
    this.getOptions();
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd')
    },
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
      this.listQuery.orderDateStart = this.listQuery.orderDate;
      this.listQuery.orderDateEnd = this.listQuery.orderDate
      this.getList();
    },
    handleCancelOrder(index, row) {
      this.cancelOrder.dialogVisible = true;
      this.cancelOrder.id = row.id;
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
      this.$router.push({path: '/oms/addCustOrder'})
    },
    handleUpdate(index, row) {
      this.$router.push({path: '/oms/updateCustOrder', query: {id: row.id}})
    },
    getList() {
      this.listLoading = true;
      fetchList(qs.stringify(this.listQuery, {indices:false})).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    getOptions() {
      fetchOptions("LOCAL_CUST").then(response => {
        this.localCustOptions = response.data;
      });
      fetchOptions("HK_CUST").then(response => {
        this.hkCustOptions = response.data;
      });
      fetchOptions("GOOD_TYPE").then(response => {
        this.goodTypeOptions = response.data;
      });
      fetchOptions("ORDER_STATE").then(response => {
        this.stateOptions = response.data;
      });
      fetchOptions("PACKING_TYPE").then(response => {
        this.packingTypeOptions = response.data;
      });
    },
    handleCacnelOrderConfirm() {
      if (this.cancelOrder.content == null || this.cancelOrder.content === '') {
        this.$message({
          message: '操作备注不能为空',
          type: 'warning',
          duration: 1000
        });
        return;
      }
      let params = new URLSearchParams();
      params.append('id', this.cancelOrder.id);
      params.append('remark', this.cancelOrder.remark);
      cancelOrder(params).then(response => {
        this.cancelOrder.id = null;
        this.cancelOrder.dialogVisible = false;
        this.getList();
        this.$message({
          message: '取消订单成功',
          type: 'success',
          duration: 1000
        });
      });
    }

  }
}
</script>
<style scoped>
.input-width {
  width: 203px;
}
</style>


