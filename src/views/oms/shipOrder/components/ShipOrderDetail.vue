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
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleUpdate(bucketIdMap[bucketOptions[rowIndex * 4 + colIndex].enumValue], bucketOptions[rowIndex * 4 + colIndex].enumValue)"
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
import {toBase64} from 'js-base64'
import {fetchOptions} from '@/api/sysEnum'
import {getShipOrderInfo} from '@/api/shipOrder'

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
      bucketOptions: [],
      showButton: false,
    }
  },
  created() {
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
  methods: {
    handleUpdate(id, bucketNo) {
      let param = toBase64(JSON.stringify({id, bucketNo, 'plateNumber': this.loadingInfo.plateNumber, 'orderLoadingId': this.loadingInfo.id, 'loadingDate': this.loadingInfo.loadingDate}));
      this.$router.push({path: '/oms/addShipOrder', query: {param}})
    },
    getOptions() {
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
