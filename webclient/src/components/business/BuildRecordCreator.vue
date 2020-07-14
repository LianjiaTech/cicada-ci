<template>
  <div class="comp-build-creator">
    <HelpTip message="主要用于在没有push新代码情况下调试构建过程：
点击创建后将自动获取所选分支最新代码并生成构建
" />创建构建:
    <BranchSelect
      style="width: 100px; margin-right: 10px"
      :repo_url="repo_url"
      :multiple="false"
      @on-select="onSelectBranch"
    />
    <Button type="primary" :disabled="!branch" @click="onSubmit">创建</Button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Button } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import HelpTip from '@/components/common/HelpTip.vue';
import BranchSelect from '@/components/business/BranchSelect.vue';

@Component({
  components: {
    HelpTip,
    BranchSelect,
    Button,
  },
})
export default class BuildRecordList extends mixins(CurrentUser) {
  @Prop({ default: '' }) repo_url!: string;

  branch = '';

  onSelectBranch(branch: string) {
    this.branch = branch;
  }

  onSubmit() {
    this.$emit('on-submit', this.branch);
  }
}
</script>
