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
          <el-form-item label="运单编号：">
            <el-input v-model="listQuery.loadingNo" class="input-width" placeholder="运单编号"></el-input>
          </el-form-item>
          <el-form-item label="车牌号码：">
            <el-select v-model="listQuery.plateNumber" class="input-width" clearable filterable placeholder="请选择">
              <el-option v-for="item in plateNumberOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="运单状态：">
            <el-select v-model="listQuery.orderState" class="input-width" multiple placeholder="全部" clearable>
              <el-option v-for="item in stateOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="下单日期：">
            <el-date-picker
                v-model="listQuery.orderDate"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                placeholder="请选择时间">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()">新增配载</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="shipOrderTable"
                :data="list"
                show-summary
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="运单编号" prop="loadingNo" width="160" align="center"></el-table-column>
        <el-table-column label="车牌号码" prop="plateNumber" :formatter="formatOptionData" align="center"></el-table-column>
        <el-table-column label="运费(元)" prop="freightFee" :formatter="formatMoney" align="center" sortable></el-table-column>
        <el-table-column label="总件数" prop="totalNumber" align="center"></el-table-column>
        <el-table-column label="总重量(Kg)" prop="totalWeight" align="center"></el-table-column>
        <el-table-column label="下单日期" prop="loadingDate" :formatter="formatDate" width="120" align="center" sortable></el-table-column>
        <el-table-column label="提交时间" prop="createTime" :formatter="formatCreateTime" width="180" align="center"></el-table-column>
        <el-table-column label="运单状态" prop="minState" :formatter="formatOptionData" align="center"></el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleView(scope.$index, scope.row)">查看
            </el-button>
            <el-button type="primary"
                size="mini" v-if="!scope.row.minState || ((scope.row.minState==2 || scope.row.minState==3) && scope.row.maxState < 4)"
                @click="handleUpdate(scope.$index, scope.row)">配载
            </el-button>
            <el-button size="mini" v-if="scope.row.minState==2" type="success" plain
                       @click="handleLoadingCheck(scope.$index, scope.row, 'loadingCheck')">装车确认
            </el-button>
            <el-button size="mini" v-if="scope.row.minState==3 || scope.row.minState==4" type="primary" plain
                       @click="handleLoadingCheck(scope.$index, scope.row, 'sendingCheck')">派货确认
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
        title="取消运单"
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
import {toBase64} from 'js-base64';
import {fetchOptions} from '@/api/sysEnum'
import {fetchList} from '@/api/shipOrder'
import {formatDate} from '@/utils/date';

let start = new Date();
start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
const defaultListQuery = {
  plateNumber: null,
  bucketNo: null,
  bucketId: null,
  shipOrderNo: null,
  localCust: null,
  hkCust: null,
  goodType: null,
  orderState: [],
  orderDate: [formatDate(start, 'yyyy-MM-dd'), formatDate(new Date(), 'yyyy-MM-dd')],
};
export default {
  name: "shipOrderList",
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
      localCustOptions: [],
      plateNumberOptions: [],
      optionMap: {}
    }
  },
  created() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.fetchOptions();
    this.handleSearchList();
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
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
      if (!cellValue) return "";
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
      if (this.listQuery.orderDate != null) {
        this.listQuery.orderDateStart = this.listQuery.orderDate[0];
        this.listQuery.orderDateEnd = this.listQuery.orderDate[1];
      } else {
        this.listQuery.orderDateStart = null;
        this.listQuery.orderDateEnd = null;
      }
      this.getList();
    },
    handleAdd() {
      this.$router.push({path: '/oms/addShipOrder'})
    },
    handleView(index, row) {
      let param = toBase64(JSON.stringify({id: row.id, action: 'view', maxState: row.maxState}));
      this.$router.push({path: '/oms/viewShipOrder', query: {param}});
    },
    handleUpdate(index, row) {
      let param = toBase64(JSON.stringify({id: row.id, action: 'update', maxState: row.maxState}));
      this.$router.push({path: '/oms/updateShipOrder', query: {param}})
    },
    handleLoadingCheck(index, row, action) {
      let param = toBase64(JSON.stringify({id: row.id, action, maxState: row.maxState}));
      this.$router.push({path: '/oms/updateShipOrder', query: {param}})
    },
    getList() {
      this.listLoading = true;
      fetchList(qs.stringify(this.listQuery, {indices: false})).then(response => {
        this.listLoading = false;
        this.list = response.data;
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
        this.optionMap["minState"] = this.stateOptions;
      });
      fetchOptions({"enumType": "PACKING_TYPE"}).then(response => {
        this.packingTypeOptions = response.data;
        this.optionMap["packingType"] = this.packingTypeOptions;
      });
      fetchOptions({"enumType": "PLATE_NUMBER"}).then(response => {
        this.plateNumberOptions = response.data;
        this.optionMap["plateNumber"] = this.plateNumberOptions;
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
          message: '取消运单成功',
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


