<template>
  <div class="project-panel">
    <ProjectInfoCard :data="project" />
    <Tabs>
      <TabPane label="任务管理" name="job">
        <Card class="card" :bordered="false" dis-hover>
          <Button
            class="extra"
            type="text"
            slot="extra"
            :to="`/project/${id}/job/create`"
          >
            <Icon
              style="vertical-align: top"
              type="ios-add"
              size="18"
            />新建任务
          </Button>
          <JobList :data="jobs" :project_id="id" @on-click-row="onClickRow" />
        </Card>
      </TabPane>
      <TabPane label="构建器管理" name="builder">
        <BuilderManage :project_id="id" />
      </TabPane>
      <TabPane label="打包器管理" name="packager">
        <PackagerManage :project_id="id" />
      </TabPane>
      <TabPane label="发布器管理" name="deployer">
        <DeployerManage :project_id="id" />
      </TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Tabs, TabPane, Card, Button, Icon } from 'iview';
import CurrentUser from '../mixins/CurrentUser';
import ProjectInfoCard from '@/components/business/ProjectInfoCard.vue';
import JobList from '@/components/business/JobList.vue';
import BuilderManage from '@/components/combine/BuilderManage.vue';
import PackagerManage from '@/components/combine/PackagerManage.vue';
import DeployerManage from '@/components/combine/DeployerManage.vue';
import { nsProject, nsJob } from '../store';
import { Project } from '../types/project';
import { Job, JobListFilter } from '../types/job';
import { PaginationOptions } from '../types/common';

@Component({
  components: {
    ProjectInfoCard,
    JobList,
    BuilderManage,
    PackagerManage,
    DeployerManage,
    Tabs,
    TabPane,
    Card,
    Button,
    Icon,
  },
})
export default class Jobs extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('current', nsProject) project!: Project;
  @State('list', nsJob) jobs!: Job[];
  @Action('querySingle', nsProject) getProject!: (id: number) => void;
  @Action('queryList', nsJob) getJobList!: (params: JobListFilter) => void;

  id = 0;

  mounted() {
    if (this.$route.params.id) {
      this.id = +this.$route.params.id;
      this.getProject(this.id);
      this.fetchJobs();
    }
  }

  fetchJobs() {
    this.getJobList({ project_id: this.id });
  }

  onClickRow(row: Job) {
    this.$router.push(`/project/${this.id}/job/${row.id}`);
  }
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 20px;
}
.extra {
  position: absolute;
  top: -65px;
  right: 0;
}
</style>
