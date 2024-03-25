<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="shipOrder"
             ref="shipOrderForm"
             label-width="200px"
             size="small">
      <el-form-item label="车牌号码：" prop="plateNumber" :rules="{required: true, message: '请选择车牌号码', trigger: 'change'}">
        <el-select v-model="shipOrder.plateNumber" :disabled="editSatus>0" class="input-width" filterable
                   placeholder="请选择">
          <el-option v-for="item in plateNumberOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="桶位：" prop="bucketNo" :rules="{required: true, message: '请选择装载的桶位', trigger: 'change'}">
        <el-select v-model="shipOrder.bucketNo" :disabled="editSatus>0" class="input-width" filterable
                   placeholder="请选择">
          <el-option v-for="item in bucketOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出口公司：" prop="exportCompany" :rules="{required: true, message: '请选择出口公司', trigger: 'change'}">
        <el-select v-model="shipOrder.exportCompany" :disabled="editSatus>1" class="input-width" placeholder="请选择">
          <el-option v-for="item in exportCompanyOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运输日期：" prop="loadingDate" v-if="!editSatus>0"
                    :rules="{required: true, message: '请选择日期', trigger: 'change' }">
        <el-date-picker type="date" placeholder="选择日期" value-format="yyyy-MM-dd" v-model="shipOrder.loadingDate"
                        class="input-width"></el-date-picker>
      </el-form-item>
      <!--      <el-form-item label="备注：">-->
      <!--        <el-input-->
      <!--            class="input-width"-->
      <!--            type="textarea"-->
      <!--            :rows="5"-->
      <!--            placeholder="请输入内容"-->
      <!--            v-model="shipOrder.remark">-->
      <!--        </el-input>-->
      <!--      </el-form-item>-->
      <el-table ref="bucketGoodsTable"
                :data="shipOrder.goodsDetailList"
                style="width: 100%;" border>
        <el-table-column label="内地客户" prop="localCust" align="center"></el-table-column>
        <el-table-column label="香港客户" prop="hkCust" align="center"></el-table-column>
        <el-table-column label="品类" prop="goodType" align="center"></el-table-column>
        <el-table-column label="规格" prop="packingType" align="center"></el-table-column>
        <el-table-column label="每件重量" prop="unitWeight" align="center"></el-table-column>
        <el-table-column label="整件件数" prop="fclNumber" align="center"></el-table-column>
        <el-table-column label="尾数1重量(Kg)" prop="additionWeight1" align="center"></el-table-column>
        <el-table-column label="尾数2重量(Kg)" prop="additionWeight2" align="center"></el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" v-if="scope.row.state<=2"
                       @click="handleUpdate(scope.$index, scope.row)">修改
            </el-button>
            <el-tag type="success" v-if="scope.row.state>2">已装车确认</el-tag>
            <el-button size="mini"
                       @click="handleCopy(scope.$index, scope.row)">复制
            </el-button>
            <el-button type="danger" size="mini" plain v-if="scope.row.state<=2"
                       @click="handleDeleteGoodsDetail(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-form-item style="padding-top: 20px">
        <el-button type="primary" plain @click="handleAddGoodsDetail()">添加货品</el-button>
        <el-button :disabled="!isChange" type="primary" @click="onSubmit('shipOrderForm')"
                   :class="{ 'flash-btn': isFlashing }">提交
        </el-button>
        <el-button v-if="!editSatus" @click="resetForm('shipOrderForm')">重置</el-button>
        <el-button @click="goBack()">返回</el-button>
      </el-form-item>
    </el-form>

    <el-dialog title="修改货品信息" @close="handleDialogCancel('editOrderForm')"
               :visible.sync="editOrder.dialogVisible" width="30%">
      <el-form :model="editOrder"
               :rules="rules"
               ref="editOrderForm"
               label-width="150px"
               size="small">
        <el-form-item label="大陆客户：" prop="localCust">
          <el-select v-model="editOrder.localCust" class="input-width" placeholder="请选择">
            <el-option v-for="item in localCustOptions"
                       :key="item.enumCode"
                       :label="item.enumValue"
                       :value="item.enumCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="香港客户：" prop="hkCust">
          <el-select v-model="editOrder.hkCust" class="input-width" placeholder="请选择">
            <el-option v-for="item in hkCustOptions"
                       :key="item.enumCode"
                       :label="item.enumValue"
                       :value="item.enumCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品种：" prop="goodType">
          <el-select v-model="editOrder.goodType" class="input-width" placeholder="请选择">
            <el-option v-for="item in goodTypeOptions"
                       :key="item.enumCode"
                       :label="item.enumValue"
                       :value="item.enumCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规格：" prop="packingType">
          <el-select v-model="editOrder.packingType" class="input-width" placeholder="请选择">
            <el-option v-for="item in packingTypeOptions"
                       :key="item.enumCode"
                       :label="item.enumValue"
                       :value="item.enumCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="整件数量：" prop="fclNumber">
          <el-input-number v-model.number="editOrder.fclNumber" :min="0" class="input-width"></el-input-number>
          <el-tag v-if="unPackingGoods&&unPackingGoods.diffNumber!=0"
                  :type="unPackingGoods.diffNumber>0? 'warnning':'danger'">
            {{ (unPackingGoods.diffNumber>0?'剩余未配载'+ unPackingGoods.diffNumber + '件, ' + unPackingGoods.diffWeight + 'Kg'
              :'实际配载超过客户下单'+ (-unPackingGoods.diffNumber) + '件, ' + (-unPackingGoods.diffWeight) + 'Kg') }}
          </el-tag>
        </el-form-item>
        <el-form-item label="每件重量：" prop="unitWeight">
          <el-input v-model="editOrder.unitWeight" clearable class="input-width">
            <template slot="append">Kg</template>
          </el-input>
        </el-form-item>
        <el-form-item label="尾数1重量：" prop="additionWeight1">
          <el-input v-model="editOrder.additionWeight1" clearable class="input-width">
            <template slot="append">Kg</template>
          </el-input>
        </el-form-item>
        <el-form-item label="尾数2重量：" prop="additionWeight2">
          <el-input v-model="editOrder.additionWeight2" clearable class="input-width">
            <template slot="append">Kg</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click.stop="editOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click.prevent="handleDialogConfirm('editOrderForm')">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import {fromBase64} from 'js-base64'
import {fetchOptions} from '@/api/sysEnum'
import {createShipOrder, getGoodsDetail, getUnLoadingGoodsInfo, updateShipOrder} from '@/api/shipOrder'
import {formatDate} from '@/utils/date';

const defaultGoodsDetail = {
  id: null,
  orderLoadingId: null,
  localCust: null,
  hkCust: null,
  goodType: null,
  packingType: null,
  fclNumber: 0,
  unitWeight: 10,
  additionWeight1: 0,
  additionWeight2: 0,
  remark: null
};
const defaultShipOrder = {
  orderLoadingId: null,
  bucketNo: null,
  exportCompany: null,
  plateNumber: null,
  loadingDate: formatDate(new Date(), 'yyyy-MM-dd'),
  goodsDetailList: []
};
export default {
  name: 'addShipOrderDetail',
  data() {
    return {
      editSatus: 0, //0新车配载新桶位(全可编辑), 1已有车配载新桶位(桶位关联信息可编辑), 2已有车配载已有桶位(桶位关联信息不可编辑）
      isChange: false,
      isFlashing: false,
      shipOrder: Object.assign({}, defaultShipOrder),
      editOrder: Object.assign({}, defaultGoodsDetail, {index: 0, dialogVisible: false}),
      stateOptions: [],
      goodTypeOptions: [],
      packingTypeOptions: [],
      hkCustOptions: [],
      localCustOptions: [],
      plateNumberOptions: [],
      exportCompanyOptions: [],
      bucketOptions: [],
      unPackingGoods: null,

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
        fclNumber: [
          {required: true, message: '请填写整件数量', trigger: 'blur'}
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
  watch: {
    editOrderNew: {
      handler(newObj, oldObj) {
        if (newObj.localCust && newObj.hkCust && newObj.goodType && newObj.packingType) {
          let param = {
            loadingDate: this.shipOrder.loadingDate,
            localCust: newObj.localCust,
            hkCust: newObj.hkCust,
            goodType: newObj.goodType,
            packingType: newObj.packingType
          }
          if (!this.unPackingGoods) {
            getUnLoadingGoodsInfo(param).then(response => {
              this.unPackingGoods = response.data;
            })
          }
          if (this.unPackingGoods != null) {
            this.unPackingGoods.diffNumber -= Number(newObj.fclNumber) - Number(oldObj.fclNumber);
            this.unPackingGoods.diffWeight -= Number(newObj.fclNumber)*Number(newObj.unitWeight) - Number(oldObj.fclNumber)*Number(oldObj.unitWeight);

            if ((oldObj.additionWeight1 == 0 || oldObj.additionWeight1 == '') && newObj.additionWeight1 != 0) {
              this.unPackingGoods.diffNumber--;
            } else if (oldObj.additionWeight1 != 0 && (newObj.additionWeight1 == 0 || newObj.additionWeight1 == '')) {
              this.unPackingGoods.diffNumber++;
            }
            this.unPackingGoods.diffWeight -= Number(newObj.additionWeight1) - Number(oldObj.additionWeight1);
            if ((oldObj.additionWeight2 == 0 || oldObj.additionWeight2 == '') && newObj.additionWeight2 != 0) {
              this.unPackingGoods.diffNumber--;
            } else if (oldObj.additionWeight2 != 0 && (newObj.additionWeight2 == 0 || newObj.additionWeight2 == '')) {
              this.unPackingGoods.diffNumber++;
            }
            this.unPackingGoods.diffWeight -= Number(newObj.additionWeight2) - Number(oldObj.additionWeight2);
          }
        }
      },
      deep: true,
      // immediate: true
    }
  },
  computed: {
    editOrderNew() {
      return JSON.parse(JSON.stringify(this.editOrder));
    },
  },
  created() {
    this.getOptions();
    defaultShipOrder.goodsDetailList = [];
    if (this.$route.query.param) {
      let param = JSON.parse(fromBase64(this.$route.query.param));
      if (param.id > 0) {
        this.editSatus = 2;
        getGoodsDetail(param.id).then(response => {
          this.shipOrder = response.data;
          this.shipOrder.loadingDate = param.loadingDate;
        });
      } else {
        this.editSatus = 1;
        this.shipOrder = Object.assign({}, defaultShipOrder);
        this.shipOrder.plateNumber = param.plateNumber;
        this.shipOrder.bucketNo = param.bucketNo;
        this.shipOrder.loadingDate = param.loadingDate;
        this.shipOrder.orderLoadingId = param.orderLoadingId;
      }
    }
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd')
    },
  },
  methods: {
    handleUpdate(index, row) {
      this.editOrder = Object.assign({}, row, {index: index, dialogVisible: true})
    },
    handleCopy(index, row) {
      let rowData = Object.assign({}, row, {
        index: this.shipOrder.goodsDetailList.length,
        dialogVisible: true,
        id: null,
        state: 2,
        fclNumber: 0,
        additionWeight1: 0,
        additionWeight2: 0,
      })
      this.editOrder = Object.assign({}, rowData);
    },
    handleAddGoodsDetail() {
      this.unPackingGoods = null;
      this.editOrder = Object.assign({}, {...defaultGoodsDetail}, {
        index: this.shipOrder.goodsDetailList.length,
        dialogVisible: true,
        state: 2
      })
    },
    handleDeleteGoodsDetail(index) {
      this.$confirm('是否确定移除货物？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.shipOrder.goodsDetailList.splice(index, 1);
        this.isChange = true;
        this.isFlashing = true;
        setTimeout(() => {
          this.isFlashing = false;
        }, 2000);
        this.$message({message: '货物列表已更新，确认无误请提交', type: "warning"});
      })
    },
    handleDialogCancel(formName) {
      this.$refs[formName].clearValidate();
      this.unPackingGoods = null;
    },
    handleDialogConfirm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.editOrder.dialogVisible = false;
          const {dialogVisible, index, ...newOrder} = this.editOrder;
          this.shipOrder.goodsDetailList.splice(this.editOrder.index, 1, newOrder);
          this.isChange = true;
          this.isFlashing = true;
          setTimeout(() => {
            this.isFlashing = false;
          }, 2000);
          this.$message({message: '货物列表已更新，确认无误请提交', type: "warning"});
        } else {
          this.$message({
            message: '验证失败',
            type: 'error',
            duration: 1000
          });
          return false;
        }
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm('是否提交数据', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.shipOrder.orderLoadingId > 0) {
              updateShipOrder(this.shipOrder).then(response => {
                this.$refs[formName].resetFields();
                this.$message({
                  message: '更新成功',
                  type: 'success',
                  duration: 1000
                });
                this.$router.back();
              });
            } else {
              createShipOrder(this.shipOrder).then(response => {
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
      this.shipOrder = Object.assign({}, defaultShipOrder);
    },
    getOptions() {
      fetchOptions({"enumType": "LOCAL_CUST"}).then(response => {
        this.localCustOptions = response.data;
      });
      fetchOptions({"enumType": "HK_CUST"}).then(response => {
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
      fetchOptions({"enumType": "PLATE_NUMBER"}).then(response => {
        this.plateNumberOptions = response.data;
      });
      fetchOptions({"enumType": "BUCKET_NO"}).then(response => {
        this.bucketOptions = response.data;
      });
      fetchOptions({"enumType": "EXPORT_COMPANY"}).then(response => {
        this.exportCompanyOptions = response.data;
      });
    },
    goBack() {
      this.$router.back();
    },
  }
}
</script>
<style scoped>
.form-container {
  width: 1024px;
}

.input-width {
  width: 60%;
}

.flash-btn {
  animation: flash 1s infinite;
}

@keyframes flash {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  75% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
