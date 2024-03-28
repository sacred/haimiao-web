<template>
  <el-card>
    <el-descriptions :column="4" :title="'运单详情('+loadingInfo.loadingNo+')'">
      <template v-slot:extra>
        <el-button type="primary" plain size="mini" @click="goBack">返回</el-button>
      </template>
      <el-descriptions-item label="车牌号码">{{ loadingInfo.plateNumber }}</el-descriptions-item>
      <el-descriptions-item label="运输日期">{{ loadingInfo.loadingDate | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="总重量">{{ loadingInfo.totalWeight }} Kg</el-descriptions-item>
      <el-descriptions-item label="总件数">{{ loadingInfo.totalNumber }} 件</el-descriptions-item>
      <!--      <el-descriptions-item label="运费">{{ loadingInfo.freightFee | formatMoney }}</el-descriptions-item>-->
    </el-descriptions>
    <el-divider></el-divider>
    <el-descriptions title="桶位配载">
      <template slot="extra">
        按钮含义：
        <el-button type="success" icon="el-icon-finished" circle size="mini"></el-button>
        待装货确定
        <el-button type="success" icon="el-icon-check" circle size="mini" plain disabled></el-button>
        已装货确定
        <el-button type="primary" icon="el-icon-finished" circle size="mini"></el-button>
        待派货确认
        <el-button type="primary" icon="el-icon-check" circle size="mini" plain disabled></el-button>
        已派货签收
        <el-button type="danger" icon="el-icon-check" circle size="mini" disabled></el-button>
        已派货签收(异常)
      </template>
    </el-descriptions>
    <el-row :gutter="20" v-for="(row, rowIndex) in Math.ceil(bucketOptions.length / 3)"
            :key="row.id">
      <el-col :span="8" v-for="(col, colIndex) in 3" :key="rowIndex+'-'+colIndex">
        <el-card shadow="hover" v-if="rowIndex*3+colIndex <= bucketOptions.length-1"
                 @mouseover.native="$set(bucketOptions[rowIndex*3+colIndex], 'showButton', true)"
                 @mouseleave.native="$set(bucketOptions[rowIndex*3+colIndex], 'showButton', false)">
          <div slot="header" class="clearfix">
            <span>{{ bucketOptions[rowIndex * 3 + colIndex].enumValue }}</span>
            <el-button style="float: right; padding: 3px 0" type="text"
                       @click="handleUpdate(bucketIdMap[bucketOptions[rowIndex * 3 + colIndex].enumValue], bucketOptions[rowIndex * 3 + colIndex].enumValue)"
                       v-if="actionType=='update' && bucketOptions[rowIndex*3+colIndex].showButton">配载装货
            </el-button>
          </div>
          <div v-for="goods in bucketNoMap[bucketOptions[rowIndex * 3 + colIndex].enumValue]" :key="goods.id"
               class="text item">
            <el-tag effect="plain" type="warning">{{ goods.localCust + '-->' + goods.hkCust }}</el-tag>
            <el-tag effect="plain">{{ goods.goodType }}</el-tag>
            <el-tooltip
                :content="goods.goodType +'（'+ goods.packingType +'）【共'+goods.totalNumber+'件（'+goods.fclNumber+'整'+goods.additionNumber+'散）共'+goods.totalWeight+'Kg】'"
                placement="top">
              <span>{{ goods.packingType + '【共' + goods.totalNumber + '件 ' + goods.totalWeight + 'Kg】' }}</span>
            </el-tooltip>
            <span style="float: right;">
              <el-button v-if="actionType=='loadingCheck' || goods.state>=3 && maxState<4"
                         @click="handleLoadingCheck(goods.id, bucketOptions[rowIndex * 3 + colIndex].enumValue, goods.goodType)"
                         type="success"
                         :plain="goods.state>=3" :disabled="goods.state>=3"
                         :icon="goods.state>=3?'el-icon-check':'el-icon-finished'" size="mini" circle></el-button>
              <el-tooltip v-if="goods.sendingConfirmState==0" :content="goods.sendingConfirmNotes" placement="right"
                          effect="light">
                <el-button v-if="actionType=='sendingCheck' || goods.state>=5"
                           @click="handleLoadingCheck(goods.id, bucketOptions[rowIndex * 3 + colIndex].enumValue, goods.goodType)"
                           :type="goods.sendingConfirmState==0?'danger':'primary'"
                           :plain="goods.state>=5 && goods.sendingConfirmState==1" :disabled="goods.state>=5"
                           :icon="goods.state>=5?'el-icon-check':'el-icon-finished'" size="mini" circle></el-button>
              </el-tooltip>
              <el-button
                  v-if="goods.sendingConfirmState!=0 && (actionType=='sendingCheck' || (actionType=='view' && goods.state>=5))"
                  @click="handleLoadingCheck(goods.id, bucketOptions[rowIndex * 3 + colIndex].enumValue, goods.goodType)"
                  :type="goods.sendingConfirmState==0?'danger':'primary'"
                  :plain="goods.state>=5 && goods.sendingConfirmState==1" :disabled="goods.state>=5"
                  :icon="goods.state>=5?'el-icon-check':'el-icon-finished'" size="mini" circle></el-button>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog title="确认货物信息" @close="handleDialogCancel('confirmForm')"
               :visible.sync="confirmOrder.dialogVisible" width="35%">
      <el-form :model="confirmOrder" :rules="rules" ref="confirmForm" label-width="80px" size="small">
        <el-form-item label="确认状态">
          <el-radio-group v-model="confirmOrder.state">
            <el-radio :label="1">确认无误</el-radio>
            <el-radio :label="0">异常情况</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model="confirmOrder.remark" style="width: 80%" type="textarea" :rows="5" clearable
                    placeholder="请输入内容">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click.stop="confirmOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click.prevent="handleDialogConfirm('confirmForm')">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import {fromBase64, toBase64} from 'js-base64';
import {fetchOptions} from '@/api/sysEnum';
import {getShipOrderInfo, loadingConfirm, sendingConfirm} from '@/api/shipOrder';
import {formatDate} from '@/utils/date';

const defaultConfirmOrder = {
  id: null,
  dialogVisible: false,
  goodType: null,
  state: 1,
  bucketNo: null,
  remark: ''
};
export default {
  name: 'shipOrderDetailView',
  data() {
    return {
      loadingInfo: [],
      bucketIdMap: [],
      bucketNoMap: [],
      bucketOptions: [],
      showButton: false,
      maxState: null,
      bucketDetailList: [],
      confirmOrder: Object.assign({}, defaultConfirmOrder),

      rules: {
        remark: [{
          required: true, message: '异常情况请填写备注', trigger: 'blur',
          validator: (rule, value, callback) => {
            if (this.confirmOrder.state == 0 && (!value || value.length == 0)) {
              callback(new Error('异常情况请填写备注说明'));
            } else {
              callback();
            }
          }
        }]
      },
    }
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd')
    },
    formatMoney(cellValue) {
      if (!cellValue) return '￥0.00';
      const parts = cellValue.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return '￥' + parts.join('.');
    },
  },
  created() {
    this.getOptions();
    let param = JSON.parse(fromBase64(this.$route.query.param));
    this.actionType = param.action;
    this.maxState = param.maxState;
    getShipOrderInfo(param.id).then(response => {
      let shipOrder = response.data;
      this.loadingInfo = Object.assign({}, shipOrder, {bucketDetailList: null});
      this.bucketDetailList = response.data.bucketDetailList;
      if (shipOrder.bucketDetailList != null) {
        for (let i = 0; i < shipOrder.bucketDetailList.length; i++) {
          let bucketNo = shipOrder.bucketDetailList[i].bucketNo;
          this.bucketIdMap[bucketNo] = shipOrder.bucketDetailList[i].id;
          this.bucketNoMap[bucketNo] = shipOrder.bucketDetailList[i].goodsDetailList;
        }
      }
    });
  },
  methods: {
    handleUpdate(id, bucketNo) {
      let param = toBase64(JSON.stringify({
        id,
        bucketNo,
        'plateNumber': this.loadingInfo.plateNumber,
        'orderLoadingId': this.loadingInfo.id,
        'loadingDate': this.loadingInfo.loadingDate
      }));
      this.$router.push({path: '/oms/addShipOrder', query: {param}})
    },
    handleLoadingCheck(id, bucketNo, goodType) {
      if (this.actionType == 'sendingCheck') {
        //派货签收需要确认框，可填写备注
        this.confirmOrder = Object.assign({}, defaultConfirmOrder, {id, bucketNo, goodType, 'dialogVisible': true})
      } else {
        //确认更新状态
        let param = {id: id, state: defaultConfirmOrder.state};
        loadingConfirm(param).then(response => {
          this.bucketDetailList.forEach(function (item, index, array) {
            if (item.bucketNo == bucketNo) {
              let goodsDetailList = item.goodsDetailList;
              goodsDetailList.forEach(function (goods) {
                if (goods.id == id) {
                  goods.state = 3;
                  return;
                }
              })
            }
          })
          this.$message({message: '装车确认成功', type: "success"});
        });
      }
    },
    handleDialogConfirm(formName) {
      let param = {...this.confirmOrder};
      if (param.goodType) {
        param.remak = param.goodType + param.remak;
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          sendingConfirm(param).then(response => {
            this.bucketDetailList.forEach(function (item, index, array) {
              if (item.bucketNo == param.bucketNo) {
                let goodsDetailList = item.goodsDetailList;
                goodsDetailList.forEach(function (goods) {
                  if (goods.id == param.id) {
                    goods.state = 5;
                    return;
                  }
                })
              }
            })
            this.confirmOrder.dialogVisible = false;
            this.$message({message: '派货签收成功', type: "success"});
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
    getOptions() {
      fetchOptions({"enumType": "BUCKET_NO"}).then(response => {
        this.bucketOptions = response.data;
      });
    },
    handleDialogCancel(formName) {
      this.$nextTick(() => {
        this.$refs[formName].resetFields();
        this.$refs[formName].clearValidate();
        this.unPackingGoods = null;
      });
    },
    goBack() {
      this.$router.back();
    }
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
