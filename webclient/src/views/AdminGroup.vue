<template>
  <Card :bordered="false" dis-hover>
    <p slot="title">分组管理</p>
    <Button slot="extra" @click="showCreate" icon="md-add">新增</Button>
    <GroupList :data="groups.results" @on-edit="showEdit" @on-delete="onDelete" />
    <Page
      :total="groups.total"
      :current="page"
      :page-size="page_size"
      size="small"
      align="right"
      @on-change="onPageChange"
    />
    <Modal v-model="isModalShow" footer-hide :closable="false" :mask-closable="false">
      <p slot="header">{{config.id ? '修改' : '新建'}}分组</p>
      <GroupConfig ref="compConfig" :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import GroupList from '@/components/business/GroupList.vue';
import GroupConfig from '@/components/business/GroupConfig.vue';
import { defaultCreateConfig } from '../store/modules/group';
import { CreateGroupConfig, Group, GroupsWithCount } from '../types/group';
import { PaginationOptions } from '../types/common';
import { nsGroup } from '../store';

@Component({
  components: {
    GroupList,
    GroupConfig,
  },
})
export default class Jobs extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('groups', nsGroup) groups!: GroupsWithCount;
  @Action('create', nsGroup) createGroup!: (config: CreateGroupConfig) => void;
  @Action('update', nsGroup) updateGroup!: ({
    id,
    config,
  }: {
    id: number;
    config: CreateGroupConfig;
  }) => void;
  @Action('delete', nsGroup) deleteGroup!: (id: number) => void;
  @Action('queryList', nsGroup) queryList!: (
    options: PaginationOptions,
  ) => void;

  config: CreateGroupConfig = { ...defaultCreateConfig };

  isModalShow = false;

  isEdit = false;

  page = 1;

  page_size = 10;

  mounted() {
    this.fetch();
  }

  fetch() {
    const { page, page_size } = this;
    this.queryList({ page: page - 1, page_size });
  }

  showCreate() {
    this.isModalShow = true;
    this.isEdit = false;
    this.config = { ...defaultCreateConfig };
  }

  showEdit(group: Group) {
    this.isModalShow = true;
    this.isEdit = true;
    this.config = { ...group };
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetch();
  }

  onDelete(id: number) {
    this.$Modal.confirm({
      title: '提示',
      content: '删除操作不可恢复，请确认是否删除该分组',
      onOk: async () => {
        await this.deleteGroup(id);
        if (!this.error) {
          this.fetch();
        }
      },
    });
  }

  async onSave(data: CreateGroupConfig | Group) {
    if (this.isEdit) {
      const { id, name, admins } = data as Group;
      await this.updateGroup({ id, config: { name, admins } });
    } else {
      await this.createGroup(data);
    }
    if (!this.error) {
      this.isModalShow = false;
      this.page = 1;
      this.fetch();
    }
  }

  onCancel() {
    this.isModalShow = false;
  }
}
</script>

<style lang="less" scoped>
</style>