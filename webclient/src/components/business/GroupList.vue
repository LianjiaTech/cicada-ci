<template>
  <Table class="table" stripe :columns="columns" :data="data" :loading="loading">
    <template slot-scope="{ row }" slot="projects">
      <div class="ellipsis">{{ row.projects.map(project => project.name).join() }}</div>
    </template>
    <template slot-scope="{ row }" slot="admins">
      <div class="ellipsis">{{ row.admins.map(admin => admin.name).join() }}</div>
    </template>
    <template slot-scope="{ row }" slot="create_user">
      <div class="ellipsis">{{ row.create_user.name }}</div>
    </template>
    <template slot-scope="{ row }" slot="update_user">
      <div class="ellipsis">{{ row.update_user ? row.update_user.name : '-' }}</div>
    </template>
    <template slot-scope="{ row }" slot="time">
      <div>{{ row.update_time || row.create_time }}</div>
    </template>
    <template slot-scope="{ row }" slot="action">
      <Button class="button" size="small" @click="onEdit(row)">
        <Icon type="ios-settings" />修改
      </Button>
      <Button class="button" icon="md-trash" size="small" @click="onDelete(row.id)">删除</Button>
      <Button class="button" size="small" :to="'/admin/group/' + row.id + '/stats'" @click.stop>
        <Icon type="ios-stats" />统计
      </Button>
    </template>
  </Table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Table, Button, Icon } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import { Group } from '../../types/group';

@Component({
  components: {
    Table,
    Button,
    Icon,
  },
})
export default class GroupList extends mixins(CurrentUser) {
  @Prop({
    default: () => {
      return [];
    },
  })
  data!: Group[];

  columns = [
    { title: 'id', key: 'id', width: 65 },
    {
      title: '分组名称',
      key: 'name',
    },
    {
      title: '组内项目',
      slot: 'projects',
    },
    {
      title: '管理员',
      slot: 'admins',
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
      title: '更新时间',
      slot: 'time',
    },
    {
      title: '操作',
      slot: 'action',
      width: 220,
      align: 'center',
    },
  ];

  loading = false;

  onEdit(row: Group) {
    this.$emit('on-edit', row);
  }

  onDelete(id: number) {
    this.$emit('on-delete', id);
  }
}
</script>

<style less scoped>
.button {
  margin: 0 3px;
}
</style>
