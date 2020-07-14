<template>
  <Card :bordered="false" dis-hover>
    <Button class="extra" type="text" slot="extra" @click="onCreate">
      <Icon style="vertical-align: top" type="ios-add" size="18" />
      新建{{name}}
    </Button>
    <DeployerList :data="list" @on-edit="onEdit" @on-delete="onDelete" />
    <Modal v-model="isModalShow" footer-hide :closable="false" :mask-closable="false">
      <p slot="header">{{config.id ? '修改' : '新建'}}{{name}}</p>
      <DeployerConfig :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Card, Button, Icon, Modal } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import DeployerList from '@/components/business/DeployerList.vue';
import DeployerConfig from '@/components/business/DeployerConfig.vue';
import { BasicDeployerConfig, Deployer } from '../../types/deployer';
import { defaultDeployerConfig } from '../../store/modules/deployer';
import { nsDeployer } from '../../store';
@Component({
  components: {
    DeployerConfig,
    DeployerList,
    Card,
    Button,
    Icon,
    Modal,
  },
})
export default class DeployerManage extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('list', nsDeployer) list!: Deployer[];
  @Action('create', nsDeployer) create!: (config: BasicDeployerConfig) => void;
  @Action('queryList', nsDeployer) queryList!: (project_id: number) => void;
  @Action('querySingle', nsDeployer) querySingle!: (id: number) => void;
  @Action('update', nsDeployer) update!: ({
    id,
    config,
  }: {
    id: number;
    config: BasicDeployerConfig;
  }) => void;
  @Action('delete', nsDeployer) delete!: (id: number) => void;

  @Prop({ default: 0 }) project_id!: number;

  @Watch('project_id')
  onProjectIdChange() {
    this.fetch();
  }

  config: BasicDeployerConfig = { ...defaultDeployerConfig };

  name = '发布器';

  isModalShow = false;

  fetch() {
    this.queryList(this.project_id);
  }

  onCreate() {
    this.isModalShow = true;
    this.config = { ...defaultDeployerConfig, project_id: this.project_id };
  }

  onEdit(data: Deployer) {
    this.isModalShow = true;
    this.config = data;
  }

  onDelete(id: number) {
    this.$Modal.confirm({
      title: '提示',
      content: '删除操作不可恢复，请确认是否删除该' + this.name,
      onOk: async () => {
        await this.delete(id);
        if (!this.error) {
          this.fetch();
        }
      },
    });
  }

  async onSave(data: Deployer) {
    const { id, ...config } = data;
    if (id) {
      await this.update({ id, config });
    } else {
      await this.create(config);
    }
    if (!this.error) {
      this.isModalShow = false;
      this.fetch();
    }
  }

  onCancel() {
    this.isModalShow = false;
  }
}
</script>
<style lang="less" scoped>
.extra {
  position: absolute;
  top: -65px;
  right: 0;
}
</style>