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
            <el-date-picker :clearable="false"
                class="input-width"
                v-model="listQuery.orderDate"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
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
      <el-table ref="custOrderTable" :show-summary="true"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="订单编号" prop="custOrderNo" width="180" align="center">
          <template slot-scope="scope">
            <del v-if="scope.row.state==0">{{ scope.row.custOrderNo }}</del>
            <span v-if="scope.row.state>0">{{ scope.row.custOrderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内地客户" prop="localCust" align="center">
          <template slot-scope="scope">
            <del v-if="scope.row.state==0">{{ scope.row.localCust }}</del>
            <span v-if="scope.row.state>0">{{ scope.row.localCust }}</span>
          </template>
        </el-table-column>
        <el-table-column label="香港客户" prop="hkCust" align="center">
          <template slot-scope="scope">
            <del v-if="scope.row.state==0">{{ scope.row.hkCust }}</del>
            <span v-if="scope.row.state>0">{{ scope.row.hkCust }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品类" prop="goodType" align="center">
          <template slot-scope="scope">
            <del v-if="scope.row.state==0">{{ scope.row.goodType }}</del>
            <span v-if="scope.row.state>0">{{ scope.row.goodType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规格" prop="packingType" align="center">
          <template slot-scope="scope">
            <del v-if="scope.row.state==0">{{ scope.row.packingType }}</del>
            <span v-if="scope.row.state>0">{{ scope.row.packingType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="运费(元)" prop="freightFee" :formatter="formatMoney" align="center" sortable>
          <template slot-scope="scope">
            <del v-if="scope.row.state==0">{{ scope.row.freightFee|formatMoney }}</del>
            <span v-if="scope.row.state>0">{{ scope.row.freightFee|formatMoney }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总件数" prop="totalNumber" align="center"></el-table-column>
        <el-table-column label="总重量(Kg)" prop="totalWeight" align="center"></el-table-column>
        <el-table-column label="件数组成" align="center">
          <el-table-column label="每件重量" prop="unitWeight" align="center"></el-table-column>
          <el-table-column label="整件件数" prop="fclNumber" align="center"></el-table-column>
          <el-table-column label="尾数1重量(Kg)" prop="additionWeight1" align="center"></el-table-column>
          <el-table-column label="尾数2重量(Kg)" prop="additionWeight2" align="center"></el-table-column>
        </el-table-column>
        <el-table-column label="下单日期" prop="orderDate" :formatter="formatDate" width="120" align="center" sortable></el-table-column>
        <el-table-column label="提交时间" prop="createTime" :formatter="formatCreateTime" width="180" align="center"></el-table-column>
        <el-table-column label="订单状态" prop="state" :formatter="formatOptionData" align="center"></el-table-column>
        <el-table-column label="备注" prop="remark" width="180" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.state!=0"
                size="mini"
                @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
                size="mini"
                @click="handleCopy(scope.$index, scope.row)">复制
            </el-button>
            <el-button
                size="mini"
                type="danger" plain
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
import {toBase64} from "js-base64";

let start = new Date();
start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  custOrderNo: null,
  localCust: null,
  hkCust: null,
  goodType: null,
  orderState: [],
  createTime: null,
  orderDate: [formatDate(start, 'yyyy-MM-dd'), formatDate(new Date(), 'yyyy-MM-dd')],
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
        remark: null,
        id: null
      },
      stateOptions: [],
      goodTypeOptions: [],
      packingTypeOptions: [],
      hkCustOptions: [],
      localCustOptions: [],
      optionMap: {}
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.fetchOptions();
    this.getList();
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  filters: {
    formatMoney(cellValue) {
      if (!cellValue) return '￥0.00';
      const parts = cellValue.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return '￥' + parts.join('.');
    },
  },
  methods: {
    formatMoney(row, column, cellValue, index) {
      if (!cellValue) return '￥0.00';
      const parts = cellValue.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return '￥' + parts.join('.');
    },
    formatDate(row, column, cellValue, index) {
      let date = new Date(cellValue);
      return formatDate(date, 'yyyy-MM-dd')
    },
    formatCreateTime(row, column, cellValue, index) {
      let date = new Date(cellValue);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    formatOptionData(row, column, cellValue, index) {
      for (let item of this.optionMap[column.property.substr(column.property.indexOf('\.')+1)]) {
        if (item.enumCode == cellValue) {
          return item.enumValue;
        }
      }
      return cellValue;
    },
    handleKeyDown(event) {
      if (event.code === 'Enter') {
        event.preventDefault(); //防止默认表单提交
        this.handleSearchList();
      }
    },
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.listQuery.orderDateStart = this.listQuery.orderDate[0];
      this.listQuery.orderDateEnd = this.listQuery.orderDate[1]
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
      this.$router.push({path: '/custorder/addCustOrder'})
    },
    handleUpdate(index, row) {
      this.$router.push({path: '/custorder/updateCustOrder', query: {id: row.id}})
    },
    handleCopy(index, row) {
      console.log(JSON.stringify(row));
      let param = toBase64(JSON.stringify(row));
      this.$router.push({path: '/custorder/addCustOrder', query: {param}})
    },
    getList() {
      this.listLoading = true;
      fetchList(qs.stringify(this.listQuery, {indices: false})).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    fetchOptions() {
      fetchOptions({"enumType": "LOCAL_CUST"}).then(response => {
        this.localCustOptions = response.data;
        this.optionMap["localCust"] = this.localCustOptions;
      });
      fetchOptions({"enumType": "HK_CUST"}).then(response => {
        this.hkCustOptions = response.data;
        this.optionMap["hkCust"] = this.hkCustOptions;
      });
      fetchOptions({"enumType": "GOOD_TYPE"}).then(response => {
        this.goodTypeOptions = response.data;
        this.optionMap["goodType"] = this.goodTypeOptions;
      });
      fetchOptions({"enumType": "ORDER_STATE"}).then(response => {
        this.stateOptions = response.data;
        this.optionMap["state"] = this.stateOptions;
      });
      fetchOptions({"enumType": "PACKING_TYPE"}).then(response => {
        this.packingTypeOptions = response.data;
        this.optionMap["packingType"] = this.packingTypeOptions;
      });
    },
    handleCacnelOrderConfirm() {
      if (this.cancelOrder.remark == null || this.cancelOrder.remark === '') {
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


