<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="shipOrder"
             ref="shipOrderForm"
             label-width="200px"
             size="small">
      <el-form-item label="车牌号码：" prop="plateNumber" :rules="{required: true, message: '请选择车牌号码', trigger: 'change'}">
        <el-select v-model="shipOrder.plateNumber" :disabled="isEdit" class="input-width" filterable placeholder="请选择">
          <el-option v-for="item in plateNumberOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="桶位：" prop="bucketNo" :rules="{required: true, message: '请选择装载的桶位', trigger: 'change'}">
        <el-select v-model="shipOrder.bucketNo" :disabled="isEdit" class="input-width" filterable placeholder="请选择">
          <el-option v-for="item in bucketOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出口公司：" prop="exportCompany" :rules="{required: true, message: '请选择出口公司', trigger: 'change'}">
        <el-select v-model="shipOrder.exportCompany" :disabled="isEdit" class="input-width" placeholder="请选择">
          <el-option v-for="item in exportCompanyOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运输日期：" prop="loadingDate" v-if="!isEdit"
                    :rules="{required: true, message: '请选择日期', trigger: 'change' }">
        <el-date-picker type="date" placeholder="选择日期" value-format="yyyy-MM-dd" v-model="shipOrder.loadingDate"
                        class="input-width"></el-date-picker>
      </el-form-item>
      <el-form-item label="备注：">
        <el-input
            class="input-width"
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
            v-model="shipOrder.remark">
        </el-input>
      </el-form-item>
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
            <el-button size="mini"
                       @click="handleCopy(scope.$index, scope.row)">复制
            </el-button>
            <el-button type="danger" size="mini" plain v-if="scope.row.state<=2"
                       @click="handleDeleteGoodsDetail(scope.$index, scope.row)">删除
            </el-button>
            <el-button size="mini" type="success" plain v-if="scope.row.state===3"
                       @click="handleUpdate(scope.$index, scope.row)">配载核查
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-form-item style="padding-top: 20px">
        <el-button type="primary" plain @click="handleAddGoodsDetail">添加货品</el-button>
        <el-button :disabled="!isChange" type="primary" @click="onSubmit('shipOrderForm')"
                   :class="{ 'flash-btn': isFlashing }">提交
        </el-button>
        <el-button v-if="!isEdit" @click="resetForm('shipOrderForm')">重置</el-button>
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
import {fetchOptions} from '@/api/sysEnum'
import {getGoodsDetail, updateShipOrder} from '@/api/shipOrder'
import {formatDate} from '@/utils/date';

const defaultGoodsDetail = {
  id: null,
  localCust: null,
  hkCust: null,
  goodType: null,
  packingType: null,
  fclNumber: 0,
  unitWeight: 10,
  additionWeight1: 0,
  additionWeight2: 0,
  state: 2,
  remark: null
};
const defaultShipOrder = {
  bucketNo: null,
  exportCompany: null,
  plateNumber: null,
  loadingDate: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
  goodsDetailList: []
};
export default {
  name: 'addShipOrderDetail',
  data() {
    return {
      isEdit: false,
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
  mounted() {
    this.isEdit = false;
    this.getOptions();
    if (this.$route.query.id > 0) {
      this.isEdit = true;
      getGoodsDetail(this.$route.query.id).then(response => {
        this.shipOrder = response.data;
        this.defaultShipOrder = Object.assign({}, response.data);
      });
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
      this.editOrder = Object.assign({}, row, {
        index: this.shipOrder.goodsDetailList.length,
        dialogVisible: true,
        id: null
      })
    },
    handleAddGoodsDetail() {
      this.editOrder = Object.assign({}, Object.assign({}, defaultGoodsDetail), {
        index: this.shipOrder.goodsDetailList.length,
        dialogVisible: true
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
      this.$refs[formName].resetFields();
      this.$refs['editOrderForm'].clearValidate()
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
            updateShipOrder(this.shipOrder.goodsDetailList).then(response => {
              this.$refs[formName].resetFields();
              this.$message({
                message: '更新成功',
                type: 'success',
                duration: 1000
              });
              this.$router.back();
            });
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
