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
            <el-select v-model="listQuery.enumType" class="input-width" placeholder="全部" @change="handleSearchList()">
              <el-option v-for="item in SysEnumMap"
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
      <el-button size="mini" class="btn-add" @click="handleAdd()" style="margin-left: 20px">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="sysTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="排序" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="数据类型" align="center">
          <template slot-scope="scope">{{ scope.row.enumType |formatOptionData(SysEnumMap) }}</template>
        </el-table-column>
        <el-table-column label="数据编码" align="center">
          <template slot-scope="scope">{{ scope.row.enumCode }}</template>
        </el-table-column>
        <el-table-column label="数据值" align="center">
          <template slot-scope="scope">{{ scope.row.enumValue }}</template>
        </el-table-column>
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
        <el-table-column label="操作人" align="center">
          <template slot-scope="scope">{{ scope.row.operator }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatCreateTime }}</template>
        </el-table-column>
        <el-table-column label="最后更新时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.updateTime | formatCreateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
        :title="isEdit?'编辑通用数据':'添加通用数据'"
        :visible.sync="dialogVisible"
        width="40%">
      <el-form :model="formData"
               ref="sysForm"
               label-width="150px" size="small">
        <el-form-item label="数据类型：">
          <el-select v-model="formData.enumType" class="input-width" placeholder="全部" :disabled="isEdit?true:false" @change="handleEnumChange">
            <el-option v-for="item in SysEnumMap"
                       :key="item.enumCode"
                       :label="item.enumValue"
                       :value="item.enumCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据编码：">
          <el-input v-model="formData.enumCode" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="数据值：">
          <el-input v-model="formData.enumValue" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item :label="enumMapValue" v-if="enumMapValue != null">
          <el-input v-model="formData.enumMapValue" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="排序：">
          <el-input v-model="formData.sort" style="width: 250px"></el-input>
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
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {fetchOptions, listOptions, addOptions, updateOptions} from '@/api/sysEnum'
import {formatDate} from '@/utils/date';

const defaultQuery = {
  enumType: "GOOD_TYPE",
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
    this.fetchOptions();
    this.getList();
  },
  filters: {
    formatCreateTime(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    formatOptionData(code, options) {
      for (let item of options) {
        if (item.enumCode == code) {
          return item.enumValue;
        }
      }
      return code;
    }
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultQuery);
    },
    handleSearchList() {
      this.getList();
    },
    handleAdd() {
      this.dialogVisible = true;
      this.isEdit = false;
      this.formData = Object.assign({}, defaultData);
      this.handleEnumChange(this.formData.enumType);
    },
    handleUpdate(index, row) {
      this.dialogVisible = true;
      this.isEdit = true;
      this.formData = Object.assign({}, row);
      this.handleEnumChange(this.formData.enumType);
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
    handleDialogConfirm() {
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
<style></style>


