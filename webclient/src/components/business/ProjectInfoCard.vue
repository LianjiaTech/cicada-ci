<template>
  <Card class="card" dis-hover>
    <p slot="title">项目信息</p>
    <Button type="text" :to="'/project/' + data.id + '/edit'" slot="extra">
      <Icon type="ios-settings" />设定
    </Button>
    <Button type="text" :to="'/project/' + data.id + '/stats'" slot="extra">
      <Icon type="ios-stats" />数据统计
    </Button>
    <Row>
      <Col span="12" class="nowrap">项目名称：{{ data.name }}</Col>
      <Col span="12" class="nowrap"
        >项目分组：{{ data.group ? data.group.name : '无' }}</Col
      >
    </Row>
    <Row>
      <Col span="12" class="nowrap">仓库地址：{{ data.repo_url }}</Col>
      <Col span="12" class="nowrap"
        >启用WebHook：{{ data.enable_webhook ? '是' : '否' }}</Col
      >
    </Row>
    <Row>
      <Col span="12" class="nowrap"
        >创建者：{{ data.create_user ? data.create_user.name : '' }}</Col
      >
      <Col span="12" class="nowrap">创建时间：{{ data.create_time }}</Col>
    </Row>
  </Card>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import { Project } from '../../types/project';

@Component({
  components: {},
})
export default class ProjectInfoCard extends mixins(CurrentUser) {
  @Prop() data!: Project;
}
</script>

<style scoped>
.nowrap {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
