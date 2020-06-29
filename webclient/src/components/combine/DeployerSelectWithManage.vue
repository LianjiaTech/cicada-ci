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
        :label="option.name"
      >
        <span>{{ option.name }}</span>
        <Button
          class="option-extra"
          type="text"
          size="small"
          @click.stop="onEdit(option)"
        >
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
    <Modal
      v-model="isModalShow"
      footer-hide
      :closable="false"
      :mask-closable="false"
    >
      <p ref="elmConfigTitle" slot="header">
        {{ config.id ? '修改' : '新建' }}{{ name }}
      </p>
      <DeployerConfig :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import DeployerConfig from '@/components/business/DeployerConfig.vue';
import { BasicDeployerConfig, Deployer } from '../../types/deployer';
import { defaultDeployerConfig } from '../../store/modules/deployer';
import { nsDeployer } from '../../store';

@Component({
  components: {
    DeployerConfig,
  },
})
export default class DeployerSelectWithManage extends mixins(CurrentUser) {
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

  @Prop({ default: false }) multiple!: boolean;

  @Prop({ default: [] }) data!: Deployer[];

  @Prop({ default: 0 }) project_id!: number;

  @Watch('project_id')
  onProjectIdChange() {
    this.fetch();
  }

  name = '发布器';

  config: BasicDeployerConfig = { ...defaultDeployerConfig };

  isModalShow = false;

  fetch() {
    this.queryList(this.project_id);
  }

  onCreate() {
    this.isModalShow = true;
    this.config = { ...defaultDeployerConfig, project_id: this.project_id };
    (this.$refs.elmConfigTitle as HTMLElement).click();
  }

  onEdit(data: Deployer) {
    this.isModalShow = true;
    this.config = { ...data };
    (this.$refs.elmConfigTitle as HTMLElement).click();
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

  onSelect(ids: number[]) {
    const deployers = this.list.filter(item => ids.indexOf(item.id) > -1);
    this.$emit('on-select', deployers);
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
