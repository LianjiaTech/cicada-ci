<template>
  <Card :bordered="false" dis-hover>
    <Button class="extra" type="text" slot="extra" @click="onCreate">
      <Icon style="vertical-align: top" type="ios-add" size="18" />
      新建{{name}}
    </Button>
    <BuilderList :data="list" @on-edit="onEdit" @on-delete="onDelete" />
    <Modal v-model="isModalShow" footer-hide :closable="false" :mask-closable="false">
      <p slot="header">{{config.id ? '修改' : '新建'}}{{name}}</p>
      <BuilderConfig :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import BuilderList from '@/components/business/BuilderList.vue';
import BuilderConfig from '@/components/business/BuilderConfig.vue';
import { BasicBuilderConfig, Builder } from '../../types/builder';
import { defaultBuilderConfig } from '../../store/modules/builder';
import { nsBuilder } from '../../store';
@Component({
  components: {
    BuilderConfig,
    BuilderList,
  },
})
export default class BuilderManage extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('list', nsBuilder) list!: Builder[];
  @Action('create', nsBuilder) create!: (config: BasicBuilderConfig) => void;
  @Action('queryList', nsBuilder) queryList!: (project_id: number) => void;
  @Action('querySingle', nsBuilder) querySingle!: (id: number) => void;
  @Action('update', nsBuilder) update!: ({
    id,
    config,
  }: {
    id: number;
    config: BasicBuilderConfig;
  }) => void;
  @Action('delete', nsBuilder) delete!: (id: number) => void;

  @Prop({ default: 0 }) project_id!: number;

  @Watch('project_id')
  onProjectIdChange() {
    this.fetch();
  }

  config: BasicBuilderConfig = { ...defaultBuilderConfig };

  name = '构建器';

  isModalShow = false;

  fetch() {
    this.queryList(this.project_id);
  }

  onCreate() {
    this.isModalShow = true;
    this.config = { ...defaultBuilderConfig, project_id: this.project_id };
  }

  onEdit(data: Builder) {
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

  async onSave(data: Builder) {
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