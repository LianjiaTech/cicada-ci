<template>
  <Table
    class="table"
    stripe
    :columns="columns"
    :data="data"
    :loading="loading"
    :row-class-name="
      () => {
        return 'job-row';
      }
    "
    @on-row-click="onClickRow"
  >
    <template slot-scope="{ row }" slot="branches">
      <div class="ellipsis lines">{{ row.branches.join() }}</div>
    </template>
    <template slot-scope="{ row }" slot="builder">
      <div class="ellipsis">{{ row.builder.name }}</div>
    </template>
    <template slot-scope="{ row }" slot="packagers">
      <div class="ellipsis lines">
        {{ row.packagers.map(item => item.package_name).join('\n') }}
      </div>
    </template>
    <template slot-scope="{ row }" slot="deployers">
      <div class="ellipsis lines">
        {{ row.deployers.map(item => item.name).join('\n') }}
      </div>
    </template>
    <template slot-scope="{ row }" slot="create_user">
      <div class="ellipsis">{{ row.create_user.name }}</div>
    </template>
    <template slot-scope="{ row }" slot="update_user">
      <div class="ellipsis">
        {{ row.update_user ? row.update_user.name : '-' }}
      </div>
    </template>
    <template slot-scope="{ row }" slot="time">
      <div class="ellipsis">{{ row.update_time || row.create_time }}</div>
    </template>
    <template slot-scope="{ row }" slot="action">
      <Button
        class="button"
        size="small"
        :to="`/project/${project_id}/job/${row.id}/edit`"
        @click.stop
      >
        <Icon type="ios-settings" />修改
      </Button>
    </template>
  </Table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import { Job } from '../../types/job';

@Component
export default class JobtList extends mixins(CurrentUser) {
  @Prop({
    default: () => {
      return [];
    },
  })
  data!: Job[];

  @Prop({ default: 0 }) project_id!: number;

  columns = [
    {
      title: 'id',
      key: 'id',
      width: 65,
    },
    {
      title: '任务名称',
      key: 'name',
    },
    {
      title: 'git分支',
      slot: 'branches',
    },
    {
      title: '构建器',
      slot: 'builder',
    },
    {
      title: '包名',
      slot: 'packagers',
    },
    {
      title: '发布器',
      slot: 'deployers',
    },
    {
      title: '创建者',
      slot: 'create_user',
    },
    {
      title: '更新者',
      slot: 'update_user',
    },
    {
      title: '配置更新时间',
      slot: 'time',
      width: 150,
    },
    {
      title: '操作',
      slot: 'action',
      align: 'center',
    },
  ];

  loading = false;

  onClickRow(row: Job) {
    this.$emit('on-click-row', row);
  }
}
</script>

<style less scoped>
.button {
  margin: 0 3px;
}
.lines {
  white-space: pre-line;
}
</style>
<style lang="less">
.job-row {
  cursor: pointer;
}
</style>
