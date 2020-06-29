<template>
  <Form class="form" ref="form" :label-width="120" :model="data">
    <FormItem label="分组名称" required prop="name">
      <Input class="form-item" v-model="data.name" placeholder="输入分组名称..." />
    </FormItem>
    <FormItem label="管理员" required prop="admins">
      <UserSelect :multiple="true" :data="data.admins" @on-select="onSelectAdmins" />
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
import { Group, CreateGroupConfig } from '../../types/group';
import { defaultCreateConfig } from '../../store/modules/group';
import { User } from '../../types/user';
import UserSelect from '@/components/business/UserSelect.vue';
import { Form } from 'iview';

interface ComponentGroupConfig {
  reset: () => void;
}

@Component({
  components: {
    UserSelect,
  },
})
export default class GroupConfig extends mixins(CurrentUser)
  implements ComponentGroupConfig {
  @Prop({
    default: () => {
      return { ...defaultCreateConfig };
    },
  })
  data!: CreateGroupConfig;

  @Watch('data')
  onDataChange() {
    this.reset();
  }

  reset() {
    (this.$refs.form as Form).resetFields();
  }

  onSelectAdmins(admins: User[]) {
    this.data.admins = admins;
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
