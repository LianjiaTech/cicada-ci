<template>
  <Card :bordered="false" dis-hover>
    <Button class="extra" type="text" slot="extra" @click="onCreate">
      <Icon style="vertical-align: top" type="ios-add" size="18" />
      新建{{name}}
    </Button>
    <PackagerList :data="list" @on-edit="onEdit" @on-delete="onDelete" />
    <Modal v-model="isModalShow" footer-hide :closable="false" :mask-closable="false">
      <p slot="header">{{config.id ? '修改' : '新建'}}{{name}}</p>
      <PackagerConfig :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Card, Button, Icon, Modal } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import PackagerList from '@/components/business/PackagerList.vue';
import PackagerConfig from '@/components/business/PackagerConfig.vue';
import { BasicPackagerConfig, Packager } from '../../types/packager';
import { defaultPackagerConfig } from '../../store/modules/packager';
import { nsPackager } from '../../store';
@Component({
  components: {
    PackagerConfig,
    PackagerList,
    Card,
    Button,
    Icon,
    Modal,
  },
})
export default class PackagerManage extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('list', nsPackager) list!: Packager[];
  @Action('create', nsPackager) create!: (config: BasicPackagerConfig) => void;
  @Action('queryList', nsPackager) queryList!: (project_id: number) => void;
  @Action('querySingle', nsPackager) querySingle!: (id: number) => void;
  @Action('update', nsPackager) update!: ({
    id,
    config,
  }: {
    id: number;
    config: BasicPackagerConfig;
  }) => void;
  @Action('delete', nsPackager) delete!: (id: number) => void;

  @Prop({ default: 0 }) project_id!: number;

  @Watch('project_id')
  onProjectIdChange() {
    this.fetch();
  }

  config: BasicPackagerConfig = { ...defaultPackagerConfig };

  name = '打包器';

  isModalShow = false;

  fetch() {
    this.queryList(this.project_id);
  }

  onCreate() {
    this.isModalShow = true;
    this.config = { ...defaultPackagerConfig, project_id: this.project_id };
  }

  onEdit(data: Packager) {
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

  async onSave(data: Packager) {
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