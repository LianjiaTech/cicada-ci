import { State } from 'vuex-class';
import { Component, Vue } from 'vue-property-decorator';
import { User } from '../types/user';
import { nsUser } from '../store/index';

@Component
export default class CurrentUser extends Vue {
  @State('current', nsUser) user!: User;
}
