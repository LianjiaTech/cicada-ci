<template>
  <Form class="form" ref="form" :label-width="120" :model="data">
    <FormItem label="构建器名称" required prop="name">
      <Input class="form-item" v-model="data.name" placeholder="输入构建器名称..." />
    </FormItem>
    <FormItem label="依赖安装脚本" required prop="install_scripts">
      <Input type="textarea" :rows="2" v-model="data.install_scripts" />
    </FormItem>
    <FormItem label="构建脚本" required prop="build_scripts">
      <Input type="textarea" :rows="4" v-model="data.build_scripts" />
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
import { Form, FormItem, Input, Button } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import { Builder, BasicBuilderConfig } from '../../types/builder';
import { defaultBuilderConfig } from '../../store/modules/builder';

interface ComponentBuilderConfig {
  reset: () => void;
}

@Component({
  components: {
    Form,
    FormItem,
    Input,
    Button,
  },
})
export default class BuilderConfig extends mixins(CurrentUser)
  implements ComponentBuilderConfig {
  @Prop({
    default: () => {
      return { ...defaultBuilderConfig };
    },
  })
  data!: BasicBuilderConfig;

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