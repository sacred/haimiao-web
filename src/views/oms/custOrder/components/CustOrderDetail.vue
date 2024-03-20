<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="custOrder"
             :rules="rules"
             ref="custOrderForm"
             label-width="150px"
             size="small">
      <el-form-item label="大陆客户：" prop="localCust">
        <el-select v-model="custOrder.localCust" class="input-width">
          <el-option v-for="item in localCustOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="香港客户：" prop="hkCust">
        <el-select v-model="custOrder.hkCust" class="input-width">
          <el-option v-for="item in hkCustOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品种：" prop="goodType">
        <el-select v-model="custOrder.goodType" class="input-width">
          <el-option v-for="item in goodTypeOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="规格：" prop="packingType">
        <el-select v-model="custOrder.packingType" class="input-width">
          <el-option v-for="item in packingTypeOptions"
                     :key="item.enumCode"
                     :label="item.enumValue"
                     :value="item.enumCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="整件数量：" prop="fclNumber">
        <el-input-number v-model.number="custOrder.fclNumber" :min="0" class="input-width"></el-input-number>
      </el-form-item>
      <el-form-item label="每件重量：" prop="unitWeight">
        <el-input v-model="custOrder.unitWeight" clearable class="input-width">
          <template slot="append">Kg</template>
        </el-input>
      </el-form-item>
      <el-form-item label="尾数1重量：" prop="additionWeight1">
        <el-input v-model="custOrder.additionWeight1" clearable class="input-width">
          <template slot="append">Kg</template>
        </el-input>
      </el-form-item>
      <el-form-item label="尾数2重量：" prop="additionWeight2">
        <el-input v-model="custOrder.additionWeight2" clearable class="input-width">
          <template slot="append">Kg</template>
        </el-input>
      </el-form-item>
      <el-form-item label="下单日期：" prop="orderDate">
        <el-date-picker type="date" placeholder="选择日期" value-format="yyyy-MM-dd hh:mm:ss" v-model="custOrder.orderDate" class="input-width"></el-date-picker>
      </el-form-item>
      <el-form-item label="备注：">
        <el-input
          class="input-width"
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          v-model="custOrder.remark">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('custOrderForm')">提交</el-button>
        <el-button v-if="!isEdit" @click="resetForm('custOrderForm')">重置</el-button>
        <el-button @click="goBack()">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import {fetchOptions} from '@/api/sysEnum'
import {createCustOrder, updateCustOrder, getCustOrderInfo} from '@/api/custOrder'
import {formatDate} from '@/utils/date';
  const defaultCustOrder = {
    id: null,
    localCust: null,
    hkCust: null,
    goodType: null,
    packingType: null,
    fclNumber: 0,
    unitWeight: 10,
    additionWeight1: 0,
    additionWeight2: 0,
    orderDate: formatDate(new Date(), 'yyyy-MM-dd'),
    remark: null
  };
  export default {
    name: 'custOrderDetail',
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        custOrder: Object.assign({}, defaultCustOrder),
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
            {pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '只能输入数值，限2位小数',trigger: 'blur'}
          ],
          additionWeight1: [
            {pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '只能输入数值，限2位小数',trigger: 'blur'}
          ],
          additionWeight2: [
            {pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '只能输入数值，限2位小数',trigger: 'blur'}
          ],
          orderDate: [
            {required: true, message: '请选择日期', trigger: 'change' }
          ]
        },
        stateOptions: [],
        goodTypeOptions: [],
        packingTypeOptions: [],
        hkCustOptions: [],
        localCustOptions: [],
      }
    },
    mounted(){
      this.getOptions();
      if(this.isEdit){
        getCustOrderInfo(this.$route.query.id).then(response=>{
          this.custOrder=response.data;
        });
      }
    },
    filters: {
      formatDate(time) {
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd')
      },
    },
    methods:{
      querySearch(queryString, cb) {
        let lists = this.localCustOptions;
        lists.map(item=>{
          item.value = item.enumValue;
        });
        let results = queryString ? lists.filter(item=>{return item.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0}) : lists;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      handleSelect(item) {
        console.log(item.enumCode + "--" + item.enumValue);
      },
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('是否提交数据', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if(this.isEdit){
                updateCustOrder(this.custOrder).then(response=>{
                  this.$refs[formName].resetFields();
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration:1000
                  });
                  this.$router.back();
                });
              }else{
                let newCustOrder = {};
                newCustOrder.localCust = this.custOrder.localCust;
                newCustOrder.hkCust = this.custOrder.hkCust;
                newCustOrder.orderDetailDtoList = [];
                newCustOrder.orderDetailDtoList.push({...this.custOrder});
                createCustOrder(newCustOrder).then(response=>{
                  this.$refs[formName].resetFields();
                  this.$message({
                    message: '提交成功',
                    type: 'success',
                    duration:1000
                  });
                  this.$router.back();
                });
              }
            });
          } else {
            this.$message({
              message: '验证失败',
              type: 'error',
              duration:1000
            });
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.custOrder = Object.assign({},defaultCustOrder);
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
</style>


