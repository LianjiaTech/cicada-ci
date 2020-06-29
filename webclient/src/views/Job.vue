<template>
  <div class="job-panel">
    <Row>
      <Col span="12">
        <ProjectInfoCard :data="project" />
      </Col>
      <Col span="12">
        <JobInfoCard :data="job" />
      </Col>
    </Row>
    <Card class="card" :bordered="false" dis-hover>
      <Breadcrumb slot="title">
        <BreadcrumbItem to="/projects">项目列表</BreadcrumbItem>
        <BreadcrumbItem :to="`/project/${project_id}`">项目: {{ project.name }}</BreadcrumbItem>
        <BreadcrumbItem>任务: {{ job.name }}</BreadcrumbItem>
      </Breadcrumb>
      <Collapse simple value="tools" style="border-width: 0; margin-top: -15px">
        <Panel name="tools">
          调试工具栏
          <Row slot="content">
            <Col>
              <BuildRecordCreator :repo_url="project.repo_url" @on-submit="onCreateBuild" />
            </Col>
          </Row>
        </Panel>
      </Collapse>
      <BuildRecordList
        :data="buildRecords.results"
        @on-click-row="onClickRow"
        @on-click-build="onClickBuild"
        @on-click-abort="onClickAbort"
        @on-click-dequeue="onClickDequeue"
        @on-click-deploy="onClickDeploy"
      />
      <Page
        :total="buildRecords.total"
        :current="page"
        :page-size="page_size"
        size="small"
        align="right"
        @on-change="onPageChange"
      />
    </Card>
    <DeploySelectModal
      :isShow="showDeployModal"
      :deployers="job.deployers"
      :buildRecord="targetBuildRecord"
      @on-ok="onDeployerSelected"
      @on-visible-change="onDeployModalVisibleChange"
    />
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import ProjectInfoCard from '@/components/business/ProjectInfoCard.vue';
import JobInfoCard from '@/components/business/JobInfoCard.vue';
import BuildRecordList from '@/components/business/BuildRecordList.vue';
import BuildRecordCreator from '@/components/business/BuildRecordCreator.vue';
import DeploySelectModal from '@/components/business/DeploySelectModal.vue';
import { nsJob, nsProject, nsBuildRecord, nsDeployRecord } from '../store';
import { Job } from '../types/job';
import { Project } from '../types/project';
import {
  BuildRecordsWithCount,
  BuildRecordsFilter,
  BuildRecord,
} from '../types/build-record';
import { Deployer } from '../types/deployer';
import { PaginationOptions } from '../types/common';
import { initSocket } from '../socket';
import { defaultBuildRecord } from '../store/modules/build-record';

@Component({
  components: {
    ProjectInfoCard,
    JobInfoCard,
    BuildRecordList,
    BuildRecordCreator,
    DeploySelectModal,
  },
})
export default class Jobs extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('current', nsProject) project!: Project;
  @State('current', nsJob) job!: Job;
  @State('records', nsBuildRecord) buildRecords!: BuildRecordsWithCount;
  @Action('querySingle', nsProject) getProject!: (id: number) => void;
  @Action('querySingle', nsJob) getJob!: (id: number) => void;
  @Action('queryList', nsBuildRecord) getBuildRecords!: (
    options: PaginationOptions & BuildRecordsFilter,
  ) => void;
  @Action('addToBuildQueue', nsBuildRecord) addToBuildQueue!: (
    id: number,
  ) => void;
  @Action('removeFromBuildQueue', nsBuildRecord) removeFromBuildQueue!: (
    id: number,
  ) => void;
  @Action('abortBuild', nsBuildRecord) abortBuild!: (id: number) => void;
  @Action('manualCreate', nsBuildRecord) createBuild!: (options: {
    job_id: number;
    branch: string;
    from: string;
  }) => void;
  @Action('manualCreate', nsDeployRecord) createDeploy!: (options: {
    build_id: number;
    deployer: Deployer;
  }) => void;

  id = 0;

  project_id = 0;

  page = 1;

  page_size = 10;

  socket!: SocketIOClient.Socket;

  showDeployModal = false;

  targetBuildRecord: BuildRecord = { ...defaultBuildRecord };

  mounted() {
    this.id = +this.$route.params.id;
    this.project_id = +this.$route.params.project_id;
    if (this.project_id) {
      this.getProject(this.project_id);
    }
    if (this.id) {
      this.getJob(this.id);
    }
    this.fetchBuildRecords();
    this.initBuildSocket();
  }

  beforeDestroy() {
    this.closeSocket();
    this.getBuildRecords({ page: 0, page_size: 10, project_id: 0, job_id: 0 });
  }

  async initBuildSocket() {
    this.socket = initSocket();
    this.socket.on('build.status.change', ({ job_id }: { job_id: number }) => {
      if (job_id === this.id) {
        this.fetchBuildRecords();
      }
    });

    //todo deploy socket
  }

  closeSocket() {
    if (this.socket) {
      this.socket.off('build.status.change');
      this.socket.close();
    }
  }

  fetchBuildRecords() {
    const { page, page_size, project_id, id } = this;
    this.getBuildRecords({ page: page - 1, page_size, project_id, job_id: id });
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchBuildRecords();
  }

  onClickRow(row: BuildRecord) {
    this.$router.push(
      `/project/${this.project_id}/job/${this.id}/build/${row.id}`,
    );
  }

  async onClickBuild(id: number) {
    await this.addToBuildQueue(id);
  }

  async onClickDequeue(id: number) {
    await this.removeFromBuildQueue(id);
  }

  async onClickAbort(id: number) {
    await this.abortBuild(id);
  }

  async onClickDeploy(buildRecord: BuildRecord) {
    this.showDeployModal = true;
    this.targetBuildRecord = buildRecord;
  }

  async onDeployerSelected(deployers: Deployer[]) {
    deployers.forEach(deployer => {
      this.createDeploy({
        build_id: this.targetBuildRecord.id,
        deployer,
      });
    });
  }

  onDeployModalVisibleChange(visible: boolean) {
    this.showDeployModal = visible;
  }

  async onCreateBuild(branch: string) {
    await this.createBuild({
      job_id: this.id,
      branch,
      from: this.user.from,
    });
  }
}
</script>
