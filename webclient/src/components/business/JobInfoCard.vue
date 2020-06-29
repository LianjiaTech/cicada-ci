<template>
  <Card class="card" dis-hover>
    <p slot="title">任务信息</p>
    <Button
      type="text"
      :to="`/project/${data.project_id}/job/${data.id}/edit`"
      slot="extra"
    >
      <Icon type="ios-settings" />设定
    </Button>
    <Row>
      <Col span="8" class="nowrap">任务名称：{{ data.name }}</Col>
      <Col span="8" class="nowrap"
        >自动构建：{{ data.auto_build ? '是' : '否' }}</Col
      >
      <Col span="8" class="nowrap"
        >自动发布：{{ data.auto_deploy ? '是' : '否' }}</Col
      >
    </Row>
    <Row>
      <Col span="8" class="nowrap">构建器：{{ data.builder.name }}</Col>
      <Col span="8" class="nowrap"
        >打包器：{{ data.packagers.map(item => item.package_name).join() }}</Col
      >
      <Col span="8" class="nowrap"
        >发布器：{{ data.deployers.map(item => item.name).join() }}</Col
      >
    </Row>
    <Row>
      <Col span="8" class="nowrap"
        >创建者：{{ data.create_user ? data.create_user.name : '-' }}</Col
      >
      <Col span="8" class="nowrap"
        >更新者：{{ data.update_user ? data.update_user.name : '-' }}</Col
      >
      <Col span="8" class="nowrap"
        >更新时间：{{ data.update_time || data.create_time }}</Col
      >
    </Row>
  </Card>
</template>

<script lang="ts">
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../../mixins/CurrentUser';
import { Job } from '../../types/job';

@Component({
  components: {},
})
export default class JobInfoCard extends mixins(CurrentUser) {
  @Prop() data!: Job;
}
</script>

<style scoped>
.nowrap {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
