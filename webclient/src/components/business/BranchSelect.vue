<template>
  <Select
    :value="data"
    placeholder="搜索分支..."
    filterable
    :multiple="multiple"
    :loading="loading"
    @on-select="onSelect($event)"
  >
    <Option v-for="(option, index) in branches" :value="option" :key="index">
      {{
      option
      }}
    </Option>
  </Select>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Select, Option } from 'iview';
import { nsGithub, nsGitlab } from '../../store';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';

@Component({
  components: {
    Select,
    Option,
  },
})
export default class BranchSelect extends mixins(CurrentUser) {
  @State('branches', nsGithub) githubBranches!: string[];
  @State('branches', nsGitlab) gitlabBranches!: string[];
  @Action('getBranches', nsGithub) getGithubBranches!: (
    repo_url: string,
  ) => void;
  @Action('getBranches', nsGitlab) getGitlabBranches!: (
    repo_url: string,
  ) => void;

  @Prop({ default: true }) multiple!: boolean;

  @Prop() repo_url!: string;
  @Watch('repo_url')
  onRepoChange() {
    this.fetch();
  }

  @Prop({
    default: () => {
      return [];
    },
  })
  data!: string[];

  branches: string[] = [];

  loading = false;

  mounted() {
    this.fetch();
  }

  beforeDestroy() {
    this.getBranches('');
  }

  async fetch(query: string = '') {
    this.loading = true;
    await this.getBranches(this.repo_url);
    this.loading = false;
  }

  async getBranches(repo_url: string) {
    switch (this.user.from) {
      case 'github':
        await this.getGithubBranches(repo_url);
        this.branches = [...this.githubBranches];
        break;
      case 'gitlab':
        await this.getGitlabBranches(repo_url);
        this.branches = [...this.gitlabBranches];
        break;
      default:
    }
  }

  onSelect(value: string | string[]) {
    this.$emit('on-select', value);
  }
}
</script>
