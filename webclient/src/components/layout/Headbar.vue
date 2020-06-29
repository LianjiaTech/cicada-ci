<template>
  <Row>
    <Col span="24" class="right">
      <Dropdown v-if="user.id" style="vertical-align:middle">
        <span class="user">{{ user.account }}</span>
        <Icon type="ios-arrow-down"></Icon>
        <DropdownMenu slot="list">
          <DropdownItem class="no-padding">
            <a class="logout-button" @click="logout" href="/login">登出</a>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </Col>
  </Row>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';
import { State, Action } from 'vuex-class';
import { Component, Vue } from 'vue-property-decorator';
import { nsUser } from '../../store/index';
import CurrentUser from '../../mixins/CurrentUser';

@Component
export default class Headbar extends mixins(CurrentUser) {
  @Action('logout', nsUser) logout!: () => void;
}
</script>

<style scoped lang="less">
.logout-button {
  display: inline-block;
  height: 35px;
  width: 100%;
  line-height: 35px;
}
.no-padding {
  padding: 0;
}
.right {
  text-align: right;
  height: 64px;
  line-height: 30px;
  padding: 17px 0;
  li {
    text-align: center;
  }
}
.help {
  margin-right: 10px;
}
.help-msg {
  font-size: 14px;
}
</style>
