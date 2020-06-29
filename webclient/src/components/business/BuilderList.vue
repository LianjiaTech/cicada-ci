<template>
  <Table class="table" stripe :columns="columns" :data="data" :loading="loading">
    <template slot-scope="{row}" slot="create_user">
      <div class="ellipsis">{{row.create_user.name}}</div>
    </template>
    <template slot-scope="{row}" slot="update_user">
      <div class="ellipsis">{{row.update_user ? row.update_user.name : '-'}}</div>
    </template>
    <template slot-scope="{row}" slot="time">
      <div class="ellipsis">{{row.update_time || row.create_time}}</div>
    </template>
    <template slot-scope="{row}" slot="action">
      <Button class="button" size="small" @click="onEdit(row)">
        <Icon type="ios-settings" />修改
      </Button>
      <Button class="button" size="small" @click="onDelete(row.id)">
        <Icon type="ios-trash" />删除
      </Button>
    </template>
  </Table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import { Builder } from '../../types/builder';

@Component
export default class BuilderList extends mixins(CurrentUser) {
  @Prop({
    default: () => {
      return [];
    },
  })
  data!: Builder[];

  columns = [
    {
      title: 'id',
      key: 'id',
      width: 65,
    },
    {
      title: '构建器名称',
      key: 'name',
    },
    {
      title: '安装脚本',
      key: 'install_scripts',
      ellipsis: true,
    },
    {
      title: '构建脚本',
      key: 'build_scripts',
      ellipsis: true,
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

  onEdit(row: Builder) {
    const data = this.data.find(item => item.id === row.id);
    this.$emit('on-edit', data);
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