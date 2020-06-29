<template>
  <div ref="chart"></div>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import echarts from 'echarts';
import { ProjectRankingItem } from '../../types/stats';

@Component({})
export default class ProjectRankingChart extends Vue {
  @Prop({ default: [] }) data!: ProjectRankingItem[];
  @Prop({ default: '' }) title!: string;

  @Watch('data')
  onDataChange(val: ProjectRankingItem[]) {
    if (val && val.length) {
      this.legend = val.map(
        item => `id: ${item.project_id} ${item.project_name}`,
      );
      this.seriesData = val.map(item => ({
        name: `id: ${item.project_id} ${item.project_name}`,
        value: item.count,
        id: item.project_id,
      }));
      this.updateRender();
    }
  }

  legend!: string[];

  seriesData!: { name: string; value: number }[];

  chart!: echarts.ECharts;

  mounted() {
    this.chart = echarts.init(this.$refs.chart as HTMLCanvasElement);
    this.chart.on('click', ({ data }: { data: { id: number } }) => {
      this.$router.push(`/project/${data.id}`);
    });
  }

  beforeDestroy() {
    this.chart.off('click');
  }

  updateRender() {
    const option = {
      title: {
        text: this.title,
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}:<br>数量{c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 40,
        data: this.legend,
      },
      series: [
        {
          name: '项目',
          type: 'pie',
          left: 'left',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '24',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: this.seriesData,
        },
      ],
    };
    // @ts-ignore
    this.chart.setOption(option);
  }
}
</script>
