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
            <el-select v-model="listQuery.localCust" clearable class="input-width" placeholder="请选择">
              <el-option v-for="item in localCustOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <br>
          <el-form-item label="车牌号码：">
            <el-select v-model="listQuery.plateNumber" class="input-width" clearable filterable placeholder="请选择">
              <el-option v-for="item in plateNumberOptions"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="运单编号：">
            <el-input v-model="listQuery.loadingNo" class="input-width" placeholder="运单编号"></el-input>
          </el-form-item>
          <el-form-item label="下单日期：">
            <el-date-picker class="input-width"
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
      <template v-slot="extra">
        <i class="el-icon-tickets"></i>
        <span>数据列表</span>
        <el-radio-group class="btn-add" v-model="settlementType" @change="handleRadioChange">
          <el-radio :label="1">客户维度</el-radio>
          <el-radio :label="2">车辆维度</el-radio>
        </el-radio-group>
      </template>
    </el-card>
    <div class="table-container">
      <el-table ref="settlementTable" v-if="settlementType==1"
                :data="list"
                :span-method="spanMethod"
                show-summary
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="运输日期" colspan="2" prop="loadingDate" :formatter="formatDate" width="120" align="center"></el-table-column>
        <el-table-column label="大陆客户" prop="localCust" align="center"></el-table-column>
        <el-table-column label="总运费(元)" prop="totalFee" :formatter="formatMoney" align="center"></el-table-column>
        <el-table-column label="货物明细" align="center">
          <el-table-column label="品种" prop="goodType" align="center"></el-table-column>
          <el-table-column label="运费(元)" prop="freightFee" :formatter="formatMoney" align="center"></el-table-column>
          <el-table-column label="总件数" prop="totalNumber" align="center"></el-table-column>
          <el-table-column label="总重量(Kg)" prop="totalWeight" align="center"></el-table-column>
          <el-table-column label="车牌号码" prop="plateNumber" align="center"></el-table-column>
          <el-table-column label="桶位" prop="bucketNo" align="center"></el-table-column>
          <el-table-column label="签收异常说明" prop="notes" align="center"></el-table-column>
        </el-table-column>
      </el-table>

      <el-table ref="settlementTable" v-if="settlementType==2"
                :data="list"
                :span-method="spanMethod"
                show-summary
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="运输日期" colspan="2" prop="loadingDate" :formatter="formatDate" width="120" align="center"></el-table-column>
        <el-table-column label="车牌号码" prop="plateNumber" align="center"></el-table-column>
        <el-table-column label="总运费(元)" prop="totalFee" :formatter="formatMoney" align="center"></el-table-column>
        <el-table-column label="货物明细" align="center">
          <el-table-column label="规格" prop="packingType" align="center"></el-table-column>
          <el-table-column label="运费(元)" prop="freightFee" :formatter="formatMoney" align="center"></el-table-column>
          <el-table-column label="总件数" prop="totalNumber" align="center"></el-table-column>
          <el-table-column label="总重量(Kg)" prop="totalWeight" align="center"></el-table-column>
          <el-table-column label="签收异常说明" prop="notes" align="center"></el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {fetchOptions} from '@/api/sysEnum'
import {getCustSettlement, getVechileSettlement} from '@/api/shipOrder'
import {formatDate} from '@/utils/date';

let start = new Date();
start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
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
      spanInfo: new Map(),
      settlementType: 1,
      goodTypeOptions: [],
      packingTypeOptions: [],
      localCustOptions: [],
      plateNumberOptions: [],
      stateOptions: [],
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
    handleRadioChange() {
      this.handleSearchList();
    },
    getList() {
      this.listLoading = true;
      let {orderDate, ...param} = this.listQuery;
      if (this.settlementType == 1) {
        getCustSettlement(param).then(response => {
          this.listLoading = false;
          this.list = response.data;
          this.spanInfo = new Map();
          let rowIndex = 0;
          let rowspan = 1;
          let tempKey = "";
          let firstRow = 0;
          let totalFee = 0;
          this.list.forEach(o=> {
            if (o.loadingDate + '-' + o.localCust == tempKey) {
              totalFee += o.freightFee;
              rowspan++;
            } else {
              tempKey = o.loadingDate + '-' + o.localCust;
              rowspan = 1;
              firstRow = rowIndex;
              totalFee = o.freightFee;
            }
            this.list[firstRow].totalFee = totalFee;
            this.spanInfo.set(firstRow, {rowspan: rowspan, colspan: 1});
            rowIndex++;
          })
        });
      } else {
        getVechileSettlement(param).then(response => {
          this.listLoading = false;
          this.list = response.data;
          this.spanInfo = new Map();
          let rowIndex = 0;
          let rowspan = 1;
          let tempKey = "";
          let firstRow = 0;
          let totalFee = 0;
          this.list.forEach(o=> {
            if (o.loadingDate + '-' + o.plateNumber == tempKey) {
              totalFee += o.freightFee;
              rowspan++;
            } else {
              tempKey = o.loadingDate + '-' + o.plateNumber;
              rowspan = 1;
              firstRow = rowIndex;
              totalFee = o.freightFee;
            }
            this.list[firstRow].totalFee = totalFee;
            this.spanInfo.set(firstRow, {rowspan: rowspan, colspan: 1});
            rowIndex++;
          })
        });
      }
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex <= 2) {
        let obj = this.spanInfo.get(rowIndex);
        if (obj) {
          return obj;
        } else {
          return {
            rowspan: 0,
            colspan: 1
          }
        }
      } else {
        return {
          rowspan: 1,
          colspan: 1
        }
      }
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
      fetchOptions({"enumType": "PLATE_NUMBER"}).then(response => {
        this.plateNumberOptions = response.data;
        this.optionMap["plateNumber"] = this.plateNumberOptions;
      });
    }

  }
}
</script>
<style scoped>
.input-width {
  width: 220px;
}
button {
  margin: 5px 0; /* 上下间隔为5px */
}
</style>


