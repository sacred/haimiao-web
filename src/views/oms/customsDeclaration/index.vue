<template>
  <div class="app-container">
    <el-tabs type="border-card">
      <el-tab-pane v-for="item in list"
                   :key="item.exportCompany"
                   :label="item.exportCompany">
        <el-card>
          <el-descriptions :column="4" :title="'报关公司：'+item.exportCompany">
            <template v-slot:extra>
              <el-button type="primary" plain size="mini" @click="goBack">返回</el-button>
            </template>
            <el-descriptions-item label="运单编号">{{ item.loadingNo }}</el-descriptions-item>
            <el-descriptions-item label="车牌号码">{{ item.plateNumber }}</el-descriptions-item>
            <el-descriptions-item label="运输日期">{{ item.loadingDate | formatDate }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <div class="table-container">
          <el-table ref="customerDeclarationTable" :show-summary="true"
                    :data="item.goodsExportList"
                    style="width: 100%;"
                    v-loading="listLoading" border>
            <el-table-column label="报关名称" prop="goodType" align="center"></el-table-column>
            <el-table-column label="合计件数（件）" prop="totalNumber"  align="center"></el-table-column>
            <el-table-column label="合计重量（Kg）" prop="totalWeight" align="center"></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import {loadCustomsDeclaration} from '@/api/shipOrder'
import {formatDate} from '@/utils/date';

export default {
  name: "customerDeclarationList",
  data() {
    return {
      list: [],
      currTabeName: null,
      listLoading: true,
    }
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd')
    },
  },
  created() {
    this.getList(this.$route.query.id);
  },
  methods: {
    getList(id) {
      this.listLoading = true;
      loadCustomsDeclaration(id).then(response => {
        this.listLoading = false;
        this.list = response.data;
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
  width: 203px;
}
</style>


