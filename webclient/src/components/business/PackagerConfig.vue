<template>
  <Form class="form" ref="form" :label-width="120" :model="data">
    <FormItem label="包名" required prop="package_name">
      <Input
        class="form-item"
        v-model="package_name"
        @on-change="updatePackageName"
        placeholder="输入包名..."
      >
        <span slot="append">.tar.gz</span>
      </Input>
    </FormItem>
    <FormItem label="打包目标路径" required prop="dist_path">
      <Input class="form-item" v-model="data.dist_path" placeholder="输入打包目标路径, 例如dist..." />
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
import { Packager, BasicPackagerConfig } from '../../types/packager';
import { defaultPackagerConfig } from '../../store/modules/packager';
import { Form } from 'iview';

interface ComponentPackagerConfig {
  reset: () => void;
}

@Component({})
export default class PackagerConfig extends mixins(CurrentUser)
  implements ComponentPackagerConfig {
  @Prop({
    default: () => {
      return { ...defaultPackagerConfig };
    },
  })
  data!: BasicPackagerConfig;

  @Watch('data')
  onDataChange(val: BasicPackagerConfig) {
    this.reset();
    this.package_name = val.package_name.replace(/\.tar\.gz$/, '');
  }

  package_name: string = '';

  reset() {
    (this.$refs.form as Form).resetFields();
  }

  updatePackageName() {
    this.data.package_name = this.package_name;
    if (!/\.tar\.gz$/.test(this.data.package_name)) {
      this.data.package_name = this.data.package_name + '.tar.gz';
    }
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