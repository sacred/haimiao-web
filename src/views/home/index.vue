<template>
  <div class="app-container">
    <div class="total-layout">
      <el-date-picker
          :clearable="false"
          v-model="currDate"
          @change="handleChange"
          value-format="yyyy-MM-dd"
          type="date"
          placeholder="请选择时间">
      </el-date-picker>
      <el-row>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_order" class="total-icon">
            <div class="total-title">当天承运件数</div>
            <div class="total-value">{{summaryNumber}}件</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_today_amount" class="total-icon">
            <div class="total-title">当天承运重量</div>
            <div class="total-value">{{ summaryWeight }}Kg</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">当天运费总额</div>
            <div class="total-value">￥{{summaryFee}}</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div style="padding-top: 50px; display: flex; justify-content: space-between;">
      <span ref="pieChart" style="width: 400px; height: 500px;"></span>
      <span ref="categoryChart" style="width: 700px; height: 400px;"></span>
    </div>
  </div>
</template>

<script>
import img_home_order from '@/assets/images/home_order.png';
import img_home_today_amount from '@/assets/images/home_today_amount.png';
import img_home_yesterday_amount from '@/assets/images/home_yesterday_amount.png';
import {getCurrSummary, getLastWeekSummary} from '@/api/shipOrder';
import {formatDate} from '@/utils/date';

const color = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570'];
export default {
  name: 'home',
  data() {
    return {
      img_home_order,
      img_home_today_amount,
      img_home_yesterday_amount,
      pieChart: null,
      categoryChart: null,
      summaryWeight: 0,
      summaryNumber: 0,
      summaryFee: 0,
      currDate: formatDate(new Date(), 'yyyy-MM-dd')
    }
  },
  created() {
    this.getData();
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    handleChange() {
      this.getData();
      this.initCharts();
    },
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, 'MM-dd')
    },
    getData() {
      let param = {currDate: this.currDate};
      //当天统计
      getCurrSummary(param).then(response => {
        let data = [];
        response.data.forEach((o) => {
          data.push({value: o.totalWeight, name: o.goodType})
        })
        this.setPie(data);
      });
      //近一周统计
      getLastWeekSummary(param).then(response => {
        let seriasCustMap = new Map();
        let seriasDateFeeMap = new Map();
        let seriasDateWeightMap = new Map();
        let seriasDateNumberMap = new Map();
        let legendData = [], xAxisData = [], seriesData = []
        response.data.forEach((o) => {
          if (!legendData.includes(o.localCust) && o.localCust) {
            legendData.push(o.localCust);
          }
          if (!xAxisData.includes(this.formatDate(o.loadingDate))) {
            xAxisData.push(this.formatDate(o.loadingDate));
          }
          if (o.localCust) {
            seriasCustMap.set(this.formatDate(o.loadingDate) + '@' + o.localCust, o.freightFee)
          }
          seriasDateFeeMap.set(this.formatDate(o.loadingDate), this.toFloat(seriasDateFeeMap.get(this.formatDate(o.loadingDate))) + this.toFloat(o.freightFee));
          seriasDateWeightMap.set(this.formatDate(o.loadingDate), this.toFloat(seriasDateWeightMap.get(this.formatDate(o.loadingDate))) + this.toFloat(o.totalWeight));
          seriasDateNumberMap.set(this.formatDate(o.loadingDate), this.toFloat(seriasDateNumberMap.get(this.formatDate(o.loadingDate))) + this.toFloat(o.totalNumber));
        })
        // console.log(JSON.stringify(seriasCustMap));
        for (let i = 0; i < legendData.length; i++) {
          let fee = 0;
          let feeData = [];
          for (let j = 0; j < xAxisData.length; j++) {
            if (seriasCustMap.get(xAxisData[j] + '@' + legendData[i])) {
              fee = seriasCustMap.get(xAxisData[j] + '@' + legendData[i]);
            } else {
              fee = 0;
            }
            feeData.push(fee);
          }
          // console.log(legendData[i] + "==="+ JSON.stringify(feeData))
          seriesData.push({
            name: legendData[i],
            type: 'bar',
            stack: 'Total',
            barWidth: '40%', // 设置合适的宽度
            data: feeData
          })
        }
        //总件数
        seriesData.push({
          name: '总件数',
          type: 'line',
          data: Array.from(seriasDateNumberMap.values())
        })
        //总重量
        seriesData.push({
          name: '总重量',
          type: 'line',
          data: Array.from(seriasDateWeightMap.values())
        })
        //总运费
        seriesData.push({
          name: '总运费',
          type: 'line',
          data: Array.from(seriasDateFeeMap.values())
        })
        this.summaryWeight = seriasDateWeightMap.get(this.formatDate(param.currDate));
        this.summaryNumber = seriasDateNumberMap.get(this.formatDate(param.currDate));
        this.summaryFee = seriasDateFeeMap.get(this.formatDate(param.currDate));
        this.setCategory(legendData, xAxisData, seriesData);
      });
    },
    toFloat(value, defaultValue = 0) {
      const intValue = parseFloat(value);
      return isNaN(intValue) ? defaultValue : intValue;
    },
    initCharts() {
      this.pieChart = this.$echarts.init(this.$refs["pieChart"]);
      this.categoryChart = this.$echarts.init(this.$refs["categoryChart"]);
    },
    setPie(data) {
      var option;
      option = {
        color: color,
        title: {
          text: '当天发货占比',
          subtext: '',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '品种',
            type: 'pie',
            radius: '50%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      option && this.pieChart.setOption(option);
    },
    setCategory(legendData, xAxisData, seriesData) {
      var option;
      option = {
        color: color,
        title: {
          text: '近7天客户发货量(运费)'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          // data: ['海淼', '王老大', '四哥', '肥婆', '三弟']
          data: legendData,
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          // data: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            margin: 20 // 增加标签与轴线之间的距离
          }
        },
        series: seriesData
        // series: [
        //   {
        //     name: '海淼',
        //     type: 'line',
        //     stack: 'Total',
        //     data: [120, 132, 101, 134, 90, 230, 210]
        //   },
        //   {
        //     name: '王老大',
        //     type: 'line',
        //     stack: 'Total',
        //     data: [220, 182, 191, 234, 290, 330, 310]
        //   }
        // ]
      };
      option && this.categoryChart.setOption(option);
    },
  }
}
</script>

<style scoped>
.app-container {
  margin-left: 80px;
  margin-right: 80px;
}

.total-frame {
  border: 1px solid #DCDFE6;
  padding: 20px;
  height: 100px;
}

.total-icon {
  color: #409EFF;
  width: 60px;
  height: 60px;
}

.total-title {
  position: relative;
  font-size: 16px;
  color: #909399;
  left: 70px;
  top: -50px;
}

.total-value {
  position: relative;
  font-size: 18px;
  color: #606266;
  left: 70px;
  top: -40px;
}
</style>
