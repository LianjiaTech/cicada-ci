<template>
  <div ref="chart"></div>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import echarts from 'echarts';
import { BuildRecordDailyCount } from '../../types/stats';

@Component({})
export default class DailyCountLineChart extends Vue {
  @Prop({ default: [] }) data!: BuildRecordDailyCount[];

  @Watch('data')
  onDataChange(val: BuildRecordDailyCount[]) {
    if (val && val.length) {
      this.x = val.map(item => item.date);
      this.y1 = val.map(item => item.count_success);
      this.y2 = val.map(item => item.count_fail);
      this.updateRender();
    }
  }

  x!: string[];
  y1!: number[];
  y2!: number[];

  mounted() {}

  updateRender() {
    const Chart = echarts.init(this.$refs.chart as HTMLCanvasElement);

    const option = {
      title: {
        text: '每日数据趋势',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['构建成功数', '构建失败数'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.x,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '构建成功数',
          type: 'line',
          data: this.y1,
          color: 'green',
          smooth: true,
        },
        {
          name: '构建失败数',
          type: 'line',
          data: this.y2,
          color: '#d00',
          smooth: true,
        },
      ],
    };
    // @ts-ignore
    Chart.setOption(option);
  }
}
</script>
