<template>
  <div id="app">
    <Layout :style="{ minHeight: '100vh' }">
      <Sider
        ref="sider"
        breakpoint="md"
        hide-trigger
        collapsible
        :collapsed-width="78"
        v-model="isCollapsed"
      >
        <sidebar :isCollapsed="isCollapsed" />
      </Sider>
      <Layout>
        <Header
          :style="{
            background: '#fff',
            boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)',
          }"
        >
          <div class="header-container">
            <Icon
              @click.native="collapsedSider"
              class="rotateIcon"
              :style="{ transform: `rotateZ(${isCollapsed ? '90' : '0'}deg)` }"
              type="md-menu"
              size="24"
            ></Icon>
            <headbar style="width:600px" />
          </div>
        </Header>
        <Content :style="{ padding: '16px' }">
          <div class="main">
            <router-view :key="$route.name" />
          </div>
        </Content>
        <Footer v-show="user.ucid">
          <div class="footer"></div>
        </Footer>
      </Layout>
    </Layout>
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Message, Layout, Sider, Icon, Content, Header, Footer } from 'iview';
import VueRouter, { RouteRecord } from 'vue-router';
import { mixins } from 'vue-class-component';
import Sidebar from '@/components/layout/Sidebar.vue'; // @ is an alias to /src
import Headbar from '@/components/layout/Headbar.vue'; // @ is an alias to /src
import { nsUser } from './store/index';
import CurrentUser from './mixins/CurrentUser';

Vue.prototype.$Message = Message;

@Component({
  components: {
    Sidebar,
    Headbar,
    Layout,
    Sider,
    Icon,
    Content,
    Header,
    Footer,
  },
})
export default class App extends mixins(CurrentUser) {
  @State('error') error!: string;
  @Action('resetError') resetError: any;
  @Action('getLocalUser', nsUser) getLocalUser: any;

  @Watch('error')
  onErrorChange(val: string, oldVal: string) {
    if (val) {
      this.$Message.error({
        content: this.error,
        duration: 3,
        onClose: () => {
          this.resetError();
        },
      });
    }
  }

  $Message!: Message;

  $router!: VueRouter;

  isCollapsed = false;

  mounted() {
    this.getLocalUser();
  }

  collapsedSider() {
    this.isCollapsed = !this.isCollapsed;
  }
}
</script>

<style lang="less" scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rotateIcon {
  transition: 0.3s;
  margin: 0;
  cursor: pointer;
}
.footer {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7f9;
  color: #333;
  .links {
    a {
      display: inline-block;
      margin-left: 20px;
    }
  }
}
</style>
<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 14px;
}
.main {
  background: #fff;
}
.ivu-layout-footer {
  padding: 0 !important;
}
.ivu-message-custom-content span {
  white-space: pre;
}
.loading-animate {
  animation: ani-loading 1s linear infinite;
}
@keyframes ani-loading {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
