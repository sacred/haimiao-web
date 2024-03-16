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
          <el-form-item label="数据类型：">
            <el-select v-model="listQuery.enumType" required class="input-width" placeholder="全部" @change="handleSearchList()">
              <el-option v-for="item in SysEnumMap"
                         :key="item.enumCode"
                         :label="item.enumValue"
                         :value="item.enumCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据编码：">
            <el-input v-model="listQuery.enumCode" class="input-width" placeholder="数据编码" clearable></el-input>
          </el-form-item>
          <el-form-item label="数据值：">
            <el-input v-model="listQuery.enumValue" class="input-width" placeholder="数据值" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()" style="margin-left: 20px">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="sysTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="排序" prop="sort" width="80" align="center"></el-table-column>
        <el-table-column label="数据类型" prop="enumType" :formatter="formatOptionData" align="center"></el-table-column>
        <el-table-column label="数据编码" prop="enumCode" align="center"></el-table-column>
        <el-table-column label="数据值" prop="enumValue" align="center"></el-table-column>
        <el-table-column :label="enumMapValue" prop="enumMapValue" v-if="enumMapValue!=null" width="180" align="center"></el-table-column>
        <el-table-column label="是否启用" width="140" align="center">
          <template slot-scope="scope">
            <el-switch
                @change="handleStatusChange(scope.$index, scope.row)"
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.state">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="operator" align="center"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" :formatter="formatCreateTime" width="180" align="center"></el-table-column>
        <el-table-column label="最后更新时间" prop="updateTime" :formatter="formatCreateTime" width="180" align="center"></el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog @close="handleClose" @open="handleOpen"
        :title="isEdit?'编辑通用数据':'添加通用数据'"
        :visible.sync="dialogVisible"
        width="40%">
      <el-form :model="formData" :rules="rules"
               ref="sysForm"
               label-width="35%" size="small">
        <el-form-item label="数据类型：">
          <el-select v-model="formData.enumType" class="input-width" placeholder="全部" :disabled="isEdit?true:false" @change="handleEnumChange">
            <el-option v-for="item in SysEnumMap"
                       :key="item.enumCode"
                       :label="item.enumValue"
                       :value="item.enumCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据编码：" prop="enumCode">
          <el-input v-model="formData.enumCode" class="input-width"></el-input>
        </el-form-item>
        <el-form-item label="数据值：" prop="enumValue">
          <el-input v-model="formData.enumValue" class="input-width"></el-input>
        </el-form-item>
        <el-form-item :label="enumMapValue" v-if="enumMapValue != null" prop="enumMapValue">
          <el-input v-model="formData.enumMapValue" class="input-width"></el-input>
        </el-form-item>
        <el-form-item label="排序：" prop="sort">
          <el-input-number v-model.number="formData.sort" :min=0 class="input-width"></el-input-number>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="formData.state">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm('sysForm')" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {fetchOptions, listOptions, addOptions, updateOptions} from '@/api/sysEnum'
import {formatDate} from '@/utils/date';

const defaultQuery = {
  enumType: "PACKING_TYPE",
  enumCode: null,
  enumValue: null
};
const defaultData = {
  id: null,
  enumType: defaultQuery.enumType,
  enumCode: null,
  enumValue: null,
  sort: 0,
  state: 1
};
export default {
  name: "sysEnumList",
  data() {
    return {
      rules: {
        enumCode: [
          {required: true, message: '请输入数据编码', trigger: 'blur'}
        ],
        enumValue: [
          {required: true, message: '请输入数据值', trigger: 'blur'}
        ],
        enumMapValue: [
          {required: true, message: '请选择', trigger: 'blur'}
        ],
        sort: [
          {required: true, message: '请选择', trigger: 'blur'}
        ],
      },
      listQuery: Object.assign({}, defaultQuery),
      listLoading: true,

      formData: Object.assign({}, defaultData),
      isEdit: false,

      dialogVisible: false,
      list: [],
      SysEnumMap: [],
      enumMapValue: null
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
  methods: {
    formatCreateTime(row, column, cellValue, index) {
      let date = new Date(cellValue);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    formatOptionData(row, column, cellValue, index) {
      for (let item of this.SysEnumMap) {
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
    handleOpen(e){
      this.$nextTick(()=>{
        this.$refs["sysForm"].clearValidate();
      })
    },
    handleClose(){
      this.$nextTick(()=>{
        this.$refs["sysForm"].resetFields();
      })
    },
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultQuery);
    },
    handleSearchList() {
      this.handleEnumChange(this.listQuery.enumType);
      this.getList();
    },
    handleAdd() {
      this.dialogVisible = true;
      this.isEdit = false;
      this.formData = Object.assign({}, defaultData);
    },
    handleUpdate(index, row) {
      this.dialogVisible = true;
      this.isEdit = true;
      this.formData = Object.assign({}, row);
    },
    handleStatusChange(index, row) {
      this.$confirm('是否要修改该状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const {id, enumType, state} = row;
        updateOptions({id, enumType, state}).then(response => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          });
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改'
        });
        this.getList();
      });
    },
    handleEnumChange(value) {
      for (let item of this.SysEnumMap) {
        if (item.enumCode == value) {
          this.enumMapValue = item.enumMapValue;
          break;
        }
      }
    },
    handleDialogConfirm(form) {
      this.$confirm('是否要确认?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.isEdit) {
          updateOptions(this.formData).then(response => {
            this.$message({
              message: '修改成功！',
              type: 'success'
            });
            this.dialogVisible = false;
            this.getList();
          })
        } else {
          addOptions(this.formData).then(response => {
            this.$message({
              message: '添加成功！',
              type: 'success'
            });
            this.dialogVisible = false;
            this.getList();
          })
        }
      })
    },
    getList() {
      this.listLoading = true;
      listOptions(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data;
      });
    },
    fetchOptions() {
      let param = {"enumType": "SYS_ENUM_MAP"};
      fetchOptions(param).then(response => {
        this.SysEnumMap = response.data;
      });
    },
  }
}
</script>
<style scoped>
.input-width {
  width: 203px;
}
</style>


