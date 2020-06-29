<template>
  <div>
    <Select
      :value="data && data.id"
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
      <BuilderConfig :data="config" @on-save="onSave" @on-cancel="onCancel" />
    </Modal>
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import BuilderConfig from '@/components/business/BuilderConfig.vue';
import { BasicBuilderConfig, Builder } from '../../types/builder';
import { defaultBuilderConfig } from '../../store/modules/builder';
import { nsBuilder } from '../../store';

@Component({
  components: {
    BuilderConfig,
  },
})
export default class BuilderSelectWithManage extends mixins(CurrentUser) {
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

  @Prop({ default: null }) data!: Builder;

  @Prop({ default: 0 }) project_id!: number;

  @Watch('project_id')
  onProjectIdChange() {
    this.fetch();
  }

  name = '构建器';

  config: BasicBuilderConfig = { ...defaultBuilderConfig };

  isModalShow = false;

  fetch() {
    this.queryList(this.project_id);
  }

  onCreate() {
    this.isModalShow = true;
    this.config = { ...defaultBuilderConfig, project_id: this.project_id };
    (this.$refs.elmConfigTitle as HTMLElement).click();
  }

  onEdit(data: Builder) {
    this.isModalShow = true;
    this.config = { ...data };
    (this.$refs.elmConfigTitle as HTMLElement).click();
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
      await this.fetch();
    }
  }

  onCancel() {
    this.isModalShow = false;
  }

  onSelect(id: number) {
    const builder = this.list.find(item => item.id === id);
    this.$emit('on-select', builder);
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
