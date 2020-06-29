<template>
  <Card dis-hover :bordered="false" title="项目数据统计">
    <Card dis-hover :bordered="false" title="数据总计">
      <BuildRecordCountTable :data="summaryCountStats" scope="project" />
    </Card>
    <Card dis-hover :bordered="false">
      <span slot="title">
        区间数据统计
        <DatePicker
          class="date-picker"
          type="daterange"
          placement="top-start"
          placeholder="选择日期范围"
          :clearable="false"
          :start-date="start_date"
          :value="[start_date, end_date]"
          @on-change="onDateChange"
        ></DatePicker>
      </span>
      <DailyCountLineChart style="height: 200px" :data="dailyCountStats" />
    </Card>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import BuildRecordCountTable from '@/components/stats/BuildRecordCountTable.vue';
import DailyCountLineChart from '@/components/stats/DailyCountLineChart.vue';
import { nsBuildRecord } from '../store';
import { BuildRecordSummaryCount, BuildRecordDailyCount } from '../types/stats';

@Component({
  components: {
    BuildRecordCountTable,
    DailyCountLineChart,
  },
})
export default class ProjectStats extends mixins(CurrentUser) {
  @State('summaryCountStats', nsBuildRecord)
  summaryCountStats!: BuildRecordSummaryCount[];
  @State('dailyCountStats', nsBuildRecord)
  dailyCountStats!: BuildRecordDailyCount[];
  @Action('querySummaryCountStats', nsBuildRecord) querySummaryCountStats!: (
    project_id: number,
  ) => void;
  @Action('queryDailyCountStats', nsBuildRecord)
  queryDailyCountStats!: (options: {
    project_id: number;
    start_date?: string;
    end_date?: string;
  }) => void;

  id = 0;

  start_date = new Date(Date.now() - 8.64e7 * 6);

  end_date = new Date();

  mounted() {
    this.id = +this.$route.params.id;
    if (this.id) {
      this.querySummaryCountStats(this.id);
      this.fetchRangeStats();
    }
  }

  beforeDestroy() {
    this.queryDailyCountStats({ project_id: 0 });
  }

  fetchRangeStats() {
    const start_date = new Date(this.start_date).toLocaleDateString();
    const end_date = new Date(this.end_date).toLocaleDateString();
    const project_id = this.id;
    this.queryDailyCountStats({ project_id, start_date, end_date });
  }

  onDateChange([start_date, end_date]: [string, string]) {
    this.start_date = new Date(start_date);
    this.end_date = new Date(end_date);
    this.fetchRangeStats();
  }
}
</script>
