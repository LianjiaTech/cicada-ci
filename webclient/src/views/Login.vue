<template>
  <Card :bordered="false" dis-hover>
    <p slot="title">登录</p>
    <Row type="flex">
      <Col span="4" class="divider-right">
        <!-- <Button
          class="login-button"
          icon="md-contact"
          size="large"
          @click="showSpin = true"
          :to="oauthGitlabUrl"
        >Login With Gitlab</Button>-->
        <Button
          class="login-button"
          icon="logo-github"
          size="large"
          @click="showSpin = true"
          :to="oauthGithubUrl"
        >Login With Github</Button>
      </Col>
      <Col span="6">
        <!-- 开源系统中不包含用户中心完整模块，实际登录由使用方自行对接各自内部实现 -->
        <Form v-if="false" class="form" :label-width="80">
          <FormItem>
            <span slot="label">
              用户名
              <HelpTip message="开源系统中不包含用户中心完整模块，实际登录由使用方自行对接各自内部实现" />
            </span>
            <Input v-model="username" class="form-item" placeholder="请输入用户名..."></Input>
          </FormItem>
          <FormItem>
            <span slot="label">
              密码
              <HelpTip message="开源系统中不包含用户中心完整模块，实际登录由使用方自行对接各自内部实现" />
            </span>
            <Input v-model="password" type="password" class="form-item" placeholder="请输入密码..." />
          </FormItem>
          <FormItem>
            <Button :disabled="!username || !password">登录</Button>
          </FormItem>
        </Form>
      </Col>
    </Row>
    <Spin size="large" fix v-if="showSpin"></Spin>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue } from 'vue-property-decorator';
import VueRouter from 'vue-router';
import { Card, Row, Col, Button, Form, FormItem, Input } from 'iview';
import { nsUser } from '../store/index';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import HelpTip from '@/components/common/HelpTip.vue';

@Component({
  components: {
    HelpTip,
    Card,
    Row,
    Col,
    Button,
    Form,
    FormItem,
    Input,
  },
})
export default class Login extends mixins(CurrentUser) {
  @State('oauthGithubUrl', nsUser) oauthGithubUrl!: string;
  @State('oauthGitlabUrl', nsUser) oauthGitlabUrl!: string;
  @Action('setError') setError!: (err: string) => void;
  @Action('login', nsUser) login: any;
  @Action('getLocalUser', nsUser) getLocalUser!: () => void;
  @Action('getOauthGithubUrl', nsUser) getOauthGithubUrl!: (
    state: string,
  ) => void;
  @Action('getOauthGitlabUrl', nsUser) getOauthGitlabUrl!: (
    state: string,
  ) => void;

  $router!: VueRouter;

  username = '';

  password = '';

  showSpin = false;

  redirectPath = '';

  mounted() {
    this.getLocalUser();
    const { query } = this.$router.currentRoute;
    this.redirectPath = (query && (query.redirectPath as string)) || '';
    this.getOauthGithubUrl(this.redirectPath);
    //this.getOauthGitlabUrl(this.redirectPath);
    if (this.user.id) {
      this.afterLogin();
    }
    if (this.$route.query.errorMsg) {
      this.setError(this.$route.query.errorMsg + '');
    }
  }

  async doLogin() {
    this.showSpin = true;
    const { username, password } = this;
    const ret = await this.login({ username, password });
    this.showSpin = false;
    if (this.user.id) {
      this.afterLogin();
    }
  }

  afterLogin() {
    const { query } = this.$router.currentRoute;
    if (this.redirectPath) {
      this.$router.replace(this.redirectPath);
    } else {
      this.$router.replace('/');
    }
  }
}
</script>

<style scoped>
.form-item {
  width: 250px;
}
.divider-right {
  margin-right: 20px;
}
.login-button {
  display: block;
  margin-bottom: 10px;
}
</style>
