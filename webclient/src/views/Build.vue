<template>
  <div class="build-panel">
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
        <BreadcrumbItem :to="`/project/${project_id}/job/${job_id}`">任务: {{ job.name }}</BreadcrumbItem>
        <BreadcrumbItem>构建详情</BreadcrumbItem>
      </Breadcrumb>
      <Row>
        <Col :span="4">
          <Steps :current="currentStep" direction="vertical">
            <Step title="初始化" status="finish"></Step>
            <Step v-if="buildRecord.status === '队列中'" title="队列中" :status="'process'"></Step>
            <Step
              v-if="
                buildRecord.status !== '初始化' &&
                  buildRecord.status !== '队列中'
              "
              title="进行中"
              :status="buildRecord.status === '进行中' ? 'process' : 'finish'"
            ></Step>
            <Step v-if="buildRecord.status === '已完成'" title="已完成" status="finish"></Step>
            <Step v-if="buildRecord.status === '已取消'" title="已取消" status="finish"></Step>
            <Step v-if="buildRecord.status === '已失败'" title="已失败" status="error"></Step>
            <Step v-if="buildRecord.status === '已超时'" title="已超时" status="error"></Step>
          </Steps>
          <Card dis-hover :bordered="false" title="操作">
            <Button v-if="buildRecord.status === BuildStatus.INIT" @click.stop="onClickBuild(id)">构建</Button>
            <Button
              v-if="buildRecord.status === BuildStatus.PROCESSING"
              @click.stop="onClickAbort(id)"
            >取消构建</Button>
            <Button
              v-if="buildRecord.status === BuildStatus.INQUEUE"
              @click.stop="onClickDequeue(id)"
            >取消等待</Button>
            <Button
              v-if="buildRecord.status === BuildStatus.SUCCESS"
              @click.stop="onClickDeploy()"
            >发布</Button>
          </Card>
        </Col>
        <Col :span="7">
          <CellGroup>
            <Cell title="分支" :extra="buildRecord.branch" />
            <Cell title="构建更新时间" :extra="buildRecord.update_time" />
            <Cell title="构建耗时" :extra="buildRecord.duration + ''" />
            <Cell title="构建包">
              <span slot="extra">
                <a
                  v-for="(pack, index) in buildRecord.package_sizes"
                  :key="index"
                  :href="pack.download_url"
                  @click.stop
                >{{ pack.package_name }} ({{ pack.size }})</a>
              </span>
            </Cell>
          </CellGroup>
          <Card dis-hover :bordered="false" title="提交记录">
            <Row :key="commit.id" v-for="commit of buildRecord.commits">
              <Col span="18">{{ commit.message }}</Col>
              <Col span="6" align="right">
                <a :href="commit.url" rel="noopener noreferer" target="_blank">查看详情</a>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col :span="1">
          <span class="hidden"></span>
        </Col>
        <Col :span="12">
          <Card dis-hover>
            <p slot="title">构建日志</p>
            <Button
              shape="circle"
              icon="ios-search"
              slot="extra"
              @click="showBuildLogModal"
              size="small"
            ></Button>
            <textarea class="log" readonly :value="buildRecord.log || '暂无日志'"></textarea>
          </Card>
        </Col>
      </Row>
    </Card>
    <Card title="发布列表" :bordered="false" dis-hover>
      <DeployRecordList :data="deployRecordList" @on-click-log="showDeployLogModal" />
    </Card>
    <DeploySelectModal
      :isShow="showDeployModal"
      :deployers="job.deployers"
      :buildRecord="buildRecord"
      @on-ok="onDeployerSelected"
      @on-visible-change="onDeployModalVisibleChange"
    />
    <Modal v-model="showLogFullScreen" footer-hide transfer class-name="full-screen-modal">
      <pre class="log-full-screen">{{logType === 'deploy' ? deployRecord.log : buildRecord.log}}
        <Spin
  ref="logSpin"
  v-if="buildRecord.status === '进行中' || deployRecord.status === '进行中'"
></Spin>
      </pre>
    </Modal>
  </div>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import ProjectInfoCard from '@/components/business/ProjectInfoCard.vue';
import JobInfoCard from '@/components/business/JobInfoCard.vue';
import DeployRecordList from '@/components/business/DeployRecordList.vue';
import DeploySelectModal from '@/components/business/DeploySelectModal.vue';
import { nsJob, nsProject, nsBuildRecord, nsDeployRecord } from '../store';
import { Job } from '../types/job';
import { Project } from '../types/project';
import { BuildRecord, BuildStatus } from '../types/build-record';
import { initSocket } from '../socket';
import { DeployRecord } from '../types/deploy-record';
import { Deployer } from '../types/deployer';

@Component({
  components: {
    ProjectInfoCard,
    JobInfoCard,
    DeployRecordList,
    DeploySelectModal,
  },
})
export default class Jobs extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('current', nsProject) project!: Project;
  @State('current', nsJob) job!: Job;
  @State('current', nsBuildRecord) buildRecord!: BuildRecord;
  @State('list', nsDeployRecord) deployRecordList!: DeployRecord[];
  @State('current', nsDeployRecord) deployRecord!: DeployRecord;
  @Action('querySingle', nsProject) getProject!: (id: number) => void;
  @Action('querySingle', nsJob) getJob!: (id: number) => void;
  @Action('querySingle', nsBuildRecord) getBuildRecord!: ({
    id,
    showLog,
  }: {
    id: number;
    showLog: boolean;
  }) => void;
  @Action('addToBuildQueue', nsBuildRecord) addToBuildQueue!: (
    id: number,
  ) => void;
  @Action('removeFromBuildQueue', nsBuildRecord) removeFromBuildQueue!: (
    id: number,
  ) => void;
  @Action('abortBuild', nsBuildRecord) abortBuild!: (id: number) => void;
  @Action('queryList', nsDeployRecord) getDeployRecordList!: (
    build_id: number,
  ) => void;
  @Action('querySingle', nsDeployRecord) getDeployRecord!: ({
    id,
    showLog,
  }: {
    id: number;
    showLog: boolean;
  }) => void;
  @Action('manualCreate', nsDeployRecord) createDeploy!: (options: {
    build_id: number;
    deployer: Deployer;
  }) => void;

  project_id = 0;

  job_id = 0;

  id = 0;

  showLogFullScreen = false;

  currentStep = 0;

  socket!: SocketIOClient.Socket;

  BuildStatus = BuildStatus;

  logType: 'build' | 'deploy' = 'build';

  showDeployModal = false;

  mounted() {
    this.id = +this.$route.params.id;
    this.project_id = +this.$route.params.project_id;
    this.job_id = +this.$route.params.job_id;
    if (this.project_id) {
      this.getProject(this.project_id);
    }
    if (this.job_id) {
      this.getJob(this.job_id);
    }
    this.fetchBuildRecord();
    this.initSocketEvents();
    this.getDeployRecordList(this.id);
  }

  beforeDestroy() {
    this.closeSocket();
    this.getBuildRecord({ id: 0, showLog: false });
    this.getDeployRecordList(0);
    this.getDeployRecord({ id: 0, showLog: false });
  }

  async initSocketEvents() {
    this.socket = initSocket();
    this.socket.on('build.status.change', ({ id }: { id: number }) => {
      if (id === this.id) {
        this.fetchBuildRecord();
      }
    });
    this.socket.on('build.log.change', async ({ id }: { id: number }) => {
      if (id === this.id) {
        await this.fetchBuildRecord();
        if (this.$refs.logSpin) {
          const spinEl = (this.$refs.logSpin as Vue).$el;
          spinEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    this.socket.on(
      'deploy.status.change',
      ({ build_id }: { build_id: number }) => {
        if (build_id === this.id) {
          this.getDeployRecordList(build_id);
        }
      },
    );
    this.socket.on(
      'deploy.log.change',
      async ({ build_id, id }: { build_id: number; id: number }) => {
        if (build_id === this.id && this.showLogFullScreen) {
          await this.getDeployRecord({ id, showLog: true });
          if (this.$refs.logSpin) {
            const spinEl = (this.$refs.logSpin as Vue).$el;
            spinEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      },
    );
  }

  closeSocket() {
    if (this.socket) {
      this.socket.off('build.status.change');
      this.socket.off('build.log.change');
      this.socket.off('deploy.status.change');
      this.socket.off('deploy.log.change');
      this.socket.close();
    }
  }

  async fetchBuildRecord() {
    await this.getBuildRecord({ id: this.id, showLog: true });
  }

  showBuildLogModal() {
    this.showLogFullScreen = true;
    this.logType = 'build';
  }

  showDeployLogModal(deploy_id: number) {
    this.showLogFullScreen = true;
    this.logType = 'deploy';
    this.getDeployRecord({ id: deploy_id, showLog: true });
  }

  async onClickBuild(id: number) {
    await this.addToBuildQueue(id);
  }

  async onClickAbort(id: number) {
    await this.abortBuild(id);
  }

  async onClickDequeue(id: number) {
    await this.removeFromBuildQueue(id);
  }

  async onClickDeploy(buildRecord: BuildRecord) {
    this.showDeployModal = true;
  }

  async onDeployerSelected(deployers: Deployer[]) {
    deployers.forEach(deployer => {
      this.createDeploy({
        build_id: this.buildRecord.id,
        deployer,
      });
    });
  }

  onDeployModalVisibleChange(visible: boolean) {
    this.showDeployModal = visible;
  }
}
</script>

<style lang="less" scoped>
.log {
  height: 200px;
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
  outline: none;
  border: 0 none;
  resize: none;
  font-family: sans-serif;
  color: #2c3e50;
}
.log-full-screen {
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: sans-serif;
  font-size: 14px;
}
.button {
  display: inline-block;
  margin: 0 10px 10px 0;
}
.hidden {
  display: block;
  height: 1px;
}
</style>

<style lang="less">
.full-screen-modal {
  .ivu-modal {
    position: absolute;
    left: 0;
    right: 0;
    width: 95% !important;
    height: 90%;
    top: 0;
    bottom: 0;
    margin: auto;
  }
  .ivu-modal-content {
    padding: 15px;
    height: 100%;
    .ivu-modal-body {
      height: 100%;
      overflow-y: auto;
    }
  }
}
</style>
