<template>
  <Card dis-hover :bordered="false" title="项目数据统计">
    <Card dis-hover :bordered="false" title="数据总计">
      <BuildRecordCountTable :data="summaryCountStats" scope="global" />
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
      <Divider />
      <Row>
        <Col span="12">
          <ProjectRankingChart
            style="height: 400px"
            :data="projectSuccessRankingStats"
            title="构建成功数Top10"
          />
        </Col>
        <Col span="12">
          <ProjectRankingChart
            style="height: 400px"
            :data="projectFailRankingStats"
            title="构建失败数Top10"
          />
        </Col>
      </Row>
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
import ProjectRankingChart from '@/components/stats/ProjectRankingChart.vue';
import { nsGlobalStats } from '../store';
import {
  BuildRecordSummaryCount,
  BuildRecordDailyCount,
  ProjectRankingItem,
} from '../types/stats';
import { BuildStatus } from '../types/build-record';

@Component({
  components: {
    BuildRecordCountTable,
    DailyCountLineChart,
    ProjectRankingChart,
  },
})
export default class GlobalStats extends mixins(CurrentUser) {
  @State('summaryCountStats', nsGlobalStats)
  summaryCountStats!: BuildRecordSummaryCount[];
  @State('dailyCountStats', nsGlobalStats)
  dailyCountStats!: BuildRecordDailyCount[];
  @State('projectSuccessRankingStats', nsGlobalStats)
  projectSuccessRankingStats!: ProjectRankingItem[];
  @State('projectFailRankingStats', nsGlobalStats)
  projectFailRankingStats!: ProjectRankingItem[];
  @Action('querySummaryCountStats', nsGlobalStats)
  querySummaryCountStats!: () => void;
  @Action('queryDailyCountStats', nsGlobalStats)
  queryDailyCountStats!: (options: {
    start_date: string;
    end_date: string;
  }) => void;
  @Action('queryProjectRankingStats', nsGlobalStats)
  queryProjectRankingStats!: (options: {
    start_date: string;
    end_date: string;
    rank_status: string;
  }) => void;

  id = 0;

  start_date = new Date(Date.now() - 8.64e7 * 30);

  end_date = new Date();

  BuildStatus = BuildStatus;

  mounted() {
    this.querySummaryCountStats();
    this.fetchRangeStats();
  }

  fetchRangeStats() {
    const start_date = new Date(this.start_date).toLocaleDateString();
    const end_date = new Date(this.end_date).toLocaleDateString();
    this.queryDailyCountStats({ start_date, end_date });
    this.queryProjectRankingStats({
      start_date,
      end_date,
      rank_status: this.BuildStatus.SUCCESS,
    });
    this.queryProjectRankingStats({
      start_date,
      end_date,
      rank_status: this.BuildStatus.FAIL,
    });
  }

  onDateChange([start_date, end_date]: [string, string]) {
    this.start_date = new Date(start_date);
    this.end_date = new Date(end_date);
    this.fetchRangeStats();
  }
}
</script>
