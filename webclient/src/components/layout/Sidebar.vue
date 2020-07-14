<template>
  <div id="nav" :class="menuitemClass">
    <header>
      <router-link to="/">
        <img src="@/assets/cicada.png" />
        <span>青蝉系统</span>
      </router-link>
    </header>
    <Menu :active-name="activeKey" theme="dark" width="auto" class="menu-item">
      <MenuItem v-for="item in menuData" :name="item.key" :to="item.to" :key="item.key">
        <Icon :type="item.icon" />
        <span>{{ item.name }}</span>
      </MenuItem>
    </Menu>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import VueRouter, { RouteRecord } from 'vue-router';
import { mixins } from 'vue-class-component';
import { Menu, Icon, MenuItem } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import { User } from '../../types/user';

interface IFMenuItem {
  key: string;
  to: string;
  name: string;
  icon: string;
  visible_level: number;
}

const defaultMenuData: IFMenuItem[] = [
  {
    key: '1-1',
    to: '/projects',
    name: '项目列表',
    icon: 'md-list',
    visible_level: 0,
  },
  {
    key: '1-2',
    to: '/project/create',
    name: '新建项目',
    icon: 'md-add',
    visible_level: 0,
  },
  {
    key: '1-3',
    to: '/stats',
    name: '数据看板',
    icon: 'md-stats',
    visible_level: 0,
  },
  {
    key: '1-4',
    to: '/admin/group',
    name: '分组管理',
    icon: 'md-people',
    visible_level: 1,
  },
  {
    key: '1-5',
    to: '/admin/user',
    name: '人员管理',
    icon: 'md-lock',
    visible_level: 2,
  },
];

@Component({
  components: {
    Menu,
    Icon,
    MenuItem,
  },
})
export default class Sidebar extends mixins(CurrentUser) {
  @Prop(Boolean) isCollapsed!: boolean;

  @Watch('$route')
  onRouteChange(val: RouteRecord, oldVal: RouteRecord) {
    this.updateMenu();
  }

  menuData: IFMenuItem[] = [];

  activeKey = '1-1';

  mounted() {
    this.updateMenu();
  }

  updateMenu() {
    this.menuData = defaultMenuData.filter(v => {
      const admin_level = this.user ? this.user.admin_level : -1;
      return v.visible_level <= admin_level;
    });
  }

  updateActiveKey() {
    const path = this.$route.path;
    const activeMenu =
      this.menuData.length && this.menuData.find(item => item.to === path);
    if (activeMenu) {
      this.activeKey = activeMenu.key;
    }
  }

  get menuitemClass() {
    return this.isCollapsed ? 'collapsed' : '';
  }
}
</script>

<style scoped lang="less">
#nav {
  box-sizing: border-box;
  text-align: left;
  header {
    color: #fff;
    font-size: 24px;
    padding: 0px 30px;
    margin-bottom: 20px;
    line-height: 64px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 3px 2px;
    transition: font-size 0.2s ease 0.2s;
    white-space: nowrap;
    a {
      color: #fff;
    }
    img {
      width: 32px;
      vertical-align: text-top;
      transform: rotate(45deg);
      transition: transform 1.2s ease 0.2s;
    }
    span {
      margin-left: 5px;
    }
  }
  .menu-item {
    white-space: nowrap;
  }
  .menu-item span {
    display: inline-block;
    overflow: hidden;
    width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: font-size 0.2s ease 0.2s, width 0.2s ease 0.2s;
    font-size: 14px;
  }
  .menu-item i {
    transform: translateX(0px);
    transition: font-size 0.2s ease, transform 0.2s ease;
    vertical-align: text-top;
    font-size: 18px;
  }

  &.collapsed {
    header {
      span {
        display: none;
        font-size: 0;
      }
      img {
        transform: rotate(360deg);
      }
    }
    .menu-item {
      span {
        width: 0px;
        font-size: 0;
        display: none;
      }
      i {
        transform: translateX(5px);
        font-size: 26px;
      }
    }
  }
}
</style>
