<template>
  <Select
    :value="multiple ? selectedUser.map(item => item.id) : selectedUser && selectedUser.id"
    placeholder="搜索用户..."
    filterable
    remote
    :multiple="multiple"
    :remote-method="searchUser"
    :loading="search_loading"
    @on-select="onSelect($event)"
  >
    <Option
      v-for="option in search_options"
      :value="option.id"
      :key="option.id"
    >{{`${option.name}(${option.account})`}}</Option>
  </Select>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Select, Option } from 'iview';
import { nsUser } from '../../store/index';
import { User } from '../../types/user';

@Component({ components: { Select, Option } })
export default class UserSelect extends Vue {
  @State('searchResults', nsUser) searchResults!: User[];
  @Action('search', nsUser) search!: (keyword: string) => void;

  @Prop({ default: false }) multiple!: boolean;

  @Prop({}) data!: User | User[];

  @Watch('data')
  onDataChange() {
    this.selectedUser = this.data;
    if ((this.data as User[]).length) {
      this.search_options = [...(this.data as User[])];
    }
  }

  selectedUser: User | User[] | null = null;
  search_loading = false;
  search_options: User[] = [];

  created() {
    this.selectedUser = this.multiple ? [] : null;
  }

  async searchUser(query: string) {
    if (query !== '') {
      this.search_loading = true;
      await this.search(query);
      this.search_options = [...this.searchResults];
      this.search_loading = false;
    } else {
      this.search_loading = false;
      this.search_options = [];
    }
  }

  onSelect(value: number | number[]) {
    if (typeof value === 'number') {
      this.selectedUser = this.search_options.find(
        item => item.id === value,
      ) as User;
    } else if (value.map) {
      const options = [
        ...(this.selectedUser as User[]),
        ...this.search_options,
      ];
      this.selectedUser = value.map(id => {
        return options.find(item => item.id === id);
      }) as User[];
    }

    this.$emit('on-select', this.selectedUser);
  }
}
</script>