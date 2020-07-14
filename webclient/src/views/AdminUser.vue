<template>
  <Card dis-hover :bordered="false">
    <p slot="title">人员管理</p>
    <Row class="search-box">
      <Col span="6">
        <UserSelect @on-select="onSelectUser" />
      </Col>
      <Col span="12">
        <Button
          class="add-button"
          type="primary"
          :disabled="!selectedUser || !selectedUser.id"
          @click.stop="updateAdminLevel(selectedUser, 1)"
        >添加管理员</Button>
      </Col>
    </Row>
    <Table class="table" stripe :columns="columns" :data="admins">
      <template slot="type" slot-scope="{row}">{{admin_types[row.admin_level]}}</template>
      <template slot="action" slot-scope="{row}">
        <Button
          v-if="row.admin_level === 1"
          type="default"
          size="small"
          @click.stop="updateAdminLevel(row, 0)"
        >取消管理员</Button>
      </template>
    </Table>
  </Card>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Card, Row, Col, Button, Table } from 'iview';
import { nsUser } from '../store/index';
import { User } from '../types/user';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import UserSelect from '@/components/business/UserSelect.vue';

@Component({
  components: {
    UserSelect,
    Card,
    Row,
    Col,
    Button,
    Table,
  },
})
export default class AdminMember extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('admins', nsUser) admins!: User[];
  @Action('setError') setError!: (mes: string) => void;
  @Action('fetchAdmins', nsUser) fetchAdmins!: () => void;
  @Action('updateAdmin', nsUser) updateAdmin!: (params: {
    id: number;
    admin_level: number;
  }) => void;

  admin_types = {
    '1': '管理员',
    '2': '超级管理员',
  };

  columns = [
    {
      title: 'id',
      key: 'id',
    },
    {
      title: 'name',
      key: 'name',
    },
    {
      title: 'account',
      key: 'account',
    },
    {
      title: '类型',
      slot: 'type',
    },
    {
      title: '操作',
      slot: 'action',
    },
  ];

  selectedUser: User | null = null;

  onSelectUser(user: User) {
    this.selectedUser = user;
  }

  async updateAdminLevel({ id, admin_level }: User, newLevel: number) {
    if (admin_level > 1) {
      return this.setError('不能变更超级管理员权限');
    }
    await this.updateAdmin({
      id,
      admin_level: newLevel,
    });
    if (!this.error) {
      this.fetchAdmins();
      this.selectedUser = null;
    }
  }

  mounted() {
    this.fetchAdmins();
  }
}
</script>

<style lang="less">
.search-box {
  margin-bottom: 20px;
  .add-button {
    margin-left: 20px;
  }
}
</style>
