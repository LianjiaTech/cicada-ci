<template>
  <div>
    <Select
      :multiple="multiple"
      :value="data.map(item => item.id)"
      :placeholder="`请选择${name}...`"
      @on-select="onSelect"
    >
      <Option
        v-for="option in list"
        :value="option.id"
        :key="option.id"
        :label="`包名:${option.package_name} (路径:${option.dist_path})`"
      >
        <span>包名:{{ option.package_name }} (路径:{{ option.dist_path }})</span>
        <Button class="option-extra" type="text" size="small" @click.stop="onEdit(option)">
          <Icon type="ios-settings" />修改
        </Button>
      </Option>
      <Option :value="-1">
        <div class="option-create" @click.stop="onCreate">
          <Icon style="vertical-align: top" type="ios-add" size="18" />
          新建{{ name }}
        </div>
      </Option>
    </Select>
    <Modal v-model="isModalShow" footer-hide :closable="false" :mask-closable="false">
      <p ref="elmConfigTitle" slot="header">{{ config.id ? '修改' : '新建' }}{{ name }}</p>
      <PackagerConfig :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Select, Option, Button, Icon, Modal } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import PackagerConfig from '@/components/business/PackagerConfig.vue';
import { BasicPackagerConfig, Packager } from '../../types/packager';
import { defaultPackagerConfig } from '../../store/modules/packager';
import { nsPackager } from '../../store';

@Component({
  components: {
    PackagerConfig,
    Select,
    Option,
    Button,
    Icon,
    Modal,
  },
})
export default class PackagerSelectWithManage extends mixins(CurrentUser) {
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

  @Prop({ default: false }) multiple!: boolean;

  @Prop({ default: [] }) data!: Packager[];

  @Prop({ default: 0 }) project_id!: number;

  @Watch('project_id')
  onProjectIdChange() {
    this.fetch();
  }

  name = '打包器';

  config: BasicPackagerConfig = { ...defaultPackagerConfig };

  isModalShow = false;

  fetch() {
    this.queryList(this.project_id);
  }

  onCreate() {
    this.isModalShow = true;
    this.config = { ...defaultPackagerConfig, project_id: this.project_id };
    (this.$refs.elmConfigTitle as HTMLElement).click();
  }

  onEdit(data: Packager) {
    this.isModalShow = true;
    this.config = { ...data };
    (this.$refs.elmConfigTitle as HTMLElement).click();
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

  onSelect(ids: number[]) {
    const packagers = this.list.filter(item => ids.indexOf(item.id) > -1);
    this.$emit('on-select', packagers);
  }
}
</script>

<style lang="less" scoped>
.option-create {
  margin: -7px -16px;
  padding: 7px 16px;
}
.option-extra {
  float: right;
  margin-top: -3px;
  color: #999;
}
</style>
