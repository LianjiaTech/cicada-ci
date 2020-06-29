<template>
  <Table class="table" stripe :columns="columns" :data="data">
    <template slot-scope="{row}" slot="deployer">
      <div class="ellipsis">{{row.deployer.name}}</div>
    </template>
    <template slot-scope="{row}" slot="end_time">
      <div class="ellipsis">{{row.is_end ? row.update_time : ''}}</div>
    </template>
    <template slot-scope="{row}" slot="create_user">
      <div class="ellipsis">{{row.create_user.name}}</div>
    </template>
    <template slot-scope="{row}" slot="action">
      <Button class="button" size="small" @click="onClickLog(row.id)">
        <Icon type="ios-paper" />日志
      </Button>
    </template>
  </Table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { DeployRecord, DeployStatus } from '../../types/deploy-record';

@Component
export default class DeployRecordList extends Vue {
  @Prop({
    default: () => {
      return [];
    },
  })
  data!: DeployRecord[];

  columns = [
    {
      title: 'id',
      key: 'id',
      width: 65,
    },
    {
      title: '发布器名',
      slot: 'deployer',
    },
    {
      title: '发布状态',
      key: 'status',
    },
    {
      title: '发布开始时间',
      key: 'create_time',
    },
    {
      title: '发布结束时间',
      slot: 'end_time',
    },
    {
      title: '发布用时',
      key: 'duration',
    },
    {
      title: '发布者',
      slot: 'create_user',
    },
    {
      title: '操作',
      slot: 'action',
      width: 220,
      align: 'center',
    },
  ];

  DeployStatus = DeployStatus;

  onClickLog(id: number) {
    this.$emit('on-click-log', id);
  }
}
</script>