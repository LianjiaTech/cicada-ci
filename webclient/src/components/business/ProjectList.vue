<template>
  <Table
    class="table"
    stripe
    :columns="columns"
    :data="data"
    :loading="loading"
    :row-class-name="
      () => {
        return 'project-row';
      }
    "
    @on-row-click="onClickRow"
  >
    <template slot-scope="{ row }" slot="group">
      <div class="ellipsis">{{ row.group ? row.group.name : '无' }}</div>
    </template>
    <template slot-scope="{ row }" slot="create_user">
      <div class="ellipsis">{{ row.create_user.name }}</div>
    </template>
    <template slot-scope="{ row }" slot="time">
      <div class="ellipsis">{{ row.update_time || row.create_time }}</div>
    </template>
    <template slot-scope="{ row }" slot="action">
      <Button
        v-if="
          true ||
            user.is_super_admin ||
            row.visitor_membership ||
            row.is_business_owner
        "
        class="button"
        size="small"
        :to="'/project/' + row.id + '/edit'"
        @click.stop
      >
        <Icon type="ios-settings" />修改
      </Button>
      <Button
        class="button"
        size="small"
        :to="'/project/' + row.id + '/stats'"
        @click.stop
      >
        <Icon type="ios-stats" />数据统计
      </Button>
    </template>
  </Table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Table, Button, Icon } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import { Project } from '../../types/project';

@Component({
  components: {
    Table,
    Button,
    Icon,
  },
})
export default class ProjectList extends mixins(CurrentUser) {
  @Prop({
    default: () => {
      return [];
    },
  })
  data!: Project[];

  columns = [
    { title: 'id', key: 'id', width: 65 },
    {
      title: '项目名称',
      key: 'name',
    },
    {
      title: '项目分组',
      slot: 'group',
    },
    {
      title: 'git地址',
      key: 'repo_url',
      width: 300,
    },
    {
      title: '创建者',
      slot: 'create_user',
    },
    {
      title: '配置更新时间',
      slot: 'time',
      width: 150,
    },
    {
      title: '操作',
      slot: 'action',
      width: 220,
      align: 'center',
    },
  ];

  loading = false;

  onClickRow(row: Project) {
    this.$emit('on-click-row', row);
  }
}
</script>

<style less scoped>
.button {
  margin: 0 3px;
}
</style>
<style lang="less">
.project-row {
  cursor: pointer;
}
</style>
