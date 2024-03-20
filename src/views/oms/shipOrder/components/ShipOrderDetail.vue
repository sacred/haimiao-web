<template>
  <el-card>
    <el-descriptions :column="4" :title="'运单详情('+loadingInfo.loadingNo+')'">
      <template v-slot:extra><el-button type="primary" plain size="mini" @click="goBack">返回</el-button></template>
      <el-descriptions-item label="车牌号码">{{ loadingInfo.plateNumber }}</el-descriptions-item>
      <el-descriptions-item label="运输日期">{{ loadingInfo.loadingDate | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="总重量">{{ loadingInfo.totalWeight }}</el-descriptions-item>
      <el-descriptions-item label="总件数">{{ loadingInfo.totalNumber }}</el-descriptions-item>
    </el-descriptions>
    <el-divider></el-divider>
    <el-descriptions title="桶位配载">
    </el-descriptions>
    <el-row :gutter="20" v-for="(row, rowIndex) in Math.ceil(bucketOptions.length / 4)"
            :key="row.id">
      <el-col :span="6" v-for="(col, colIndex) in 4" :key="rowIndex+'-'+colIndex">
        <el-card shadow="hover" v-if="rowIndex*4+colIndex <= bucketOptions.length-1"
                 @mouseover.native="$set(bucketOptions[rowIndex*4+colIndex], 'showButton', true)"
                 @mouseleave.native="$set(bucketOptions[rowIndex*4+colIndex], 'showButton', false)">
          <div slot="header" class="clearfix">
            <span>{{ bucketOptions[rowIndex * 4 + colIndex].enumValue }}</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleUpdate(bucketIdMap[bucketOptions[rowIndex * 4 + colIndex].enumValue])"
                       v-if="isEdit && bucketOptions[rowIndex*4+colIndex].showButton">配载装货
            </el-button>
          </div>
          <div v-for="goods in bucketNoMap[bucketOptions[rowIndex * 4 + colIndex].enumValue]" :key="goods.id" class="text item">
            <el-tag effect="plain">{{goods.goodType}}</el-tag>{{goods.packingType +'【共'+goods.totalNumber+'件（'+goods.fclNumber+'整'+goods.additionNumber+'散）共'+goods.totalWeight+'Kg】' }}
            <!--            {{ goods.localCust +'->'+ goods.hkCust +'【'+ goods.goodType +'（'+ goods.packingType +'）：'+goods.totalNumber+'件 '+goods.additionNumber+' 共'+goods.totalWeight+'Kg】' }}-->
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
import {fetchOptions} from '@/api/sysEnum'
import {createShipOrder, getShipOrderInfo} from '@/api/shipOrder'
import {formatDate} from '@/utils/date';

const defaultShipOrder = {
  id: null,
  localCust: null,
  hkCust: null,
  goodType: null,
  packingType: null,
  fclNumber: 0,
  unitWeight: 10,
  additionWeight1: 0,
  additionWeight2: 0,
  orderDate: new Date(),
  remark: null
};
export default {
  name: 'shipOrderDetailView',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loadingInfo: [],
      bucketIdMap: [],
      bucketNoMap: [],
      shipOrder: Object.assign({}, defaultShipOrder),
      stateOptions: [],
      goodTypeOptions: [],
      packingTypeOptions: [],
      hkCustOptions: [],
      localCustOptions: [],
      bucketOptions: [],
      showButton: false,
      rules: {
        localCust: [
          {required: true, message: '请选择大陆客户', trigger: 'change'}
        ],
        hkCust: [
          {required: true, message: '请选择香港客户', trigger: 'change'}
        ],
        goodType: [
          {required: true, message: '请选择品种', trigger: 'change'}
        ],
        packingType: [
          {required: true, message: '请选择规格', trigger: 'change'}
        ],
        unitWeight: [
          {pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '只能输入数值，限2位小数', trigger: 'blur'}
        ],
        additionWeight1: [
          {pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '只能输入数值，限2位小数', trigger: 'blur'}
        ],
        additionWeight2: [
          {pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '只能输入数值，限2位小数', trigger: 'blur'}
        ],
        orderDate: [
          {required: true, message: '请选择日期', trigger: 'change'}
        ]
      },
    }
  },
  mounted() {
    this.getOptions();
    getShipOrderInfo(this.$route.query.id).then(response => {
      let shipOrder = response.data;
      this.loadingInfo = Object.assign({}, shipOrder, {bucketDetailList: null});
      if (shipOrder.bucketDetailList != null) {
        for (let i=0; i<shipOrder.bucketDetailList.length; i++) {
          let bucketNo = shipOrder.bucketDetailList[i].bucketNo;
          this.bucketIdMap[bucketNo] = shipOrder.bucketDetailList[i].id;
          this.bucketNoMap[bucketNo] = shipOrder.bucketDetailList[i].goodsDetailList;
        }
      }
    });
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd')
    },
  },
  methods: {
    handleUpdate(id) {
      this.$router.push({path: '/oms/addShipOrder', query: {id: id}})
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm('是否提交数据', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.isEdit) {
              updateshipOrder(this.shipOrder).then(response => {
                this.$refs[formName].resetFields();
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration: 1000
                });
                this.$router.back();
              });
            } else {
              let newshipOrder = {};
              newshipOrder.localship = this.shipOrder.localship;
              newshipOrder.hkship = this.shipOrder.hkship;
              newshipOrder.orderDetailDtoList = [];
              newshipOrder.orderDetailDtoList.push({...this.shipOrder});
              createShipOrder(newshipOrder).then(response => {
                this.$refs[formName].resetFields();
                this.$message({
                  message: '提交成功',
                  type: 'success',
                  duration: 1000
                });
                this.$router.back();
              });
            }
          });
        } else {
          this.$message({
            message: '验证失败',
            type: 'error',
            duration: 1000
          });
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.shipOrder = Object.assign({}, defaultshipOrder);
    },
    getOptions() {
      fetchOptions({"enumType": "LOCAL_ship"}).then(response => {
        this.localCustOptions = response.data;
      });
      fetchOptions({"enumType": "HK_ship"}).then(response => {
        this.hkCustOptions = response.data;
      });
      fetchOptions({"enumType": "GOOD_TYPE"}).then(response => {
        this.goodTypeOptions = response.data;
      });
      fetchOptions({"enumType": "ORDER_STATE"}).then(response => {
        this.stateOptions = response.data;
      });
      fetchOptions({"enumType": "PACKING_TYPE"}).then(response => {
        this.packingTypeOptions = response.data;
      });
      fetchOptions({"enumType": "BUCKET_NO"}).then(response => {
        this.bucketOptions = response.data;
      });
    },
    goBack() {
      this.$router.back();
    },
  }
}
</script>
<style scoped>
.input-width {
  width: 60%;
}

.el-row {
  margin-bottom: 20px;

&
:last-child {
  margin-bottom: 0;
}

}
.el-card {
  min-height: 180px;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}
</style>
