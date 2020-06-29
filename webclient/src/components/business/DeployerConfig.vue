<template>
  <Form class="form" ref="form" :label-width="120" :model="data">
    <FormItem label="发布器名称" required prop="name">
      <Input class="form-item" v-model="data.name" placeholder="输入发布器名称..." />
    </FormItem>
    <FormItem label="发布脚本" required prop="scripts">
      <Input type="textarea" :rows="4" v-model="data.scripts" />
    </FormItem>
    <FormItem label="限定分支" prop="branch_filter">
      <Input class="form-item" v-model="data.branch_filter" placeholder="输入分支名称..." />
    </FormItem>
    <FormItem>
      <div class="modal-button">
        <Button @click="onCancel" size="large">取消</Button>
        <Button @click="onSave" style="margin-left:10px;" type="primary" size="large">确认</Button>
      </div>
    </FormItem>
  </Form>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import { Deployer, BasicDeployerConfig } from '../../types/deployer';
import { defaultDeployerConfig } from '../../store/modules/deployer';
import { Form } from 'iview';

interface ComponentDeployerConfig {
  reset: () => void;
}

@Component({})
export default class DeployerConfig extends mixins(CurrentUser)
  implements ComponentDeployerConfig {
  @Prop({
    default: () => {
      return { ...defaultDeployerConfig };
    },
  })
  data!: BasicDeployerConfig;

  @Watch('data')
  onDataChange() {
    this.reset();
  }

  reset() {
    (this.$refs.form as Form).resetFields();
  }

  async onSave() {
    const valid = await (this.$refs.form as Form).validate();
    if (!valid) {
      return;
    }
    this.$emit('on-save', this.data);
  }

  onCancel() {
    this.$emit('on-cancel');
  }
}
</script>

<style lang="less" scoped>
.form {
  width: 420px;
  text-align: left;
  padding-top: 20px;
}
.modal-button {
  display: flex;
  justify-content: flex-end;
  width: 300px;
}
</style>