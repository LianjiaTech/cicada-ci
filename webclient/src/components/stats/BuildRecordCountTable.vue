<template>
  <Table :columns="columns" :data="data"></Table>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Table } from 'iview';
import { BuildRecordSummaryCount } from '../../types/stats';

const basicColumns = [
  { title: '构建记录数', key: 'count_total' },
  { title: '成功构建数', key: 'count_success' },
  { title: '缓存构建数', key: 'count_cache' },
  { title: '失败构建数', key: 'count_fail' },
  { title: '超时构建数', key: 'count_timeout' },
];

@Component({
  components: {
    Table,
  },
})
export default class BuildRecordCountTable extends Vue {
  @Prop({ default: [] }) data!: BuildRecordSummaryCount[];

  @Prop({ default: 'global' }) scope!: 'global' | 'project';
  @Watch('scope')
  onScopeChange() {
    if (this.scope === 'project') {
      this.updateProjectColumns();
    }
  }

  columns = [...basicColumns];

  updateProjectColumns() {
    this.columns = [
      {
        title: 'jobId',
        key: 'job_id',
      },
      ...basicColumns,
    ];
  }
}
</script>
