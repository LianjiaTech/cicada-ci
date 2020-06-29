<template>
  <Card :bordered="false" dis-hover>
    <p slot="title">{{ id ? '任务设定' : '新建任务' }}</p>
    <Form ref="form" class="form" :label-width="100" :model="config">
      <Divider orientation="left">基本设定</Divider>
      <Row>
        <Col span="12">
          <FormItem label="任务名称" required prop="name">
            <Input class="form-item" v-model="config.name" placeholder="输入任务名称..." />
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="触发分支" required prop="branches">
            <BranchSelect
              :repo_url="project.repo_url"
              :data="config.branches"
              @on-select="onSelectBranches"
            />
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="left">构建设定</Divider>
      <Row>
        <Col span="12">
          <FormItem label="构建器选择" required prop="builder">
            <BuilderSelectWithManage
              :project_id="project_id"
              :data="config.builder"
              @on-select="onSelectBuilder"
            />
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="自动构建" prop="auto_build">
            <i-switch class="switch" v-model="config.auto_build" />
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="禁用缓存" prop="disable_cache">
            <i-switch class="switch" v-model="config.disable_cache" />
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="left">打包设定</Divider>
      <Row>
        <Col span="12">
          <FormItem label="打包配置选择" required prop="packagers">
            <PackagerSelectWithManage
              :multiple="true"
              :data="config.packagers"
              :project_id="project_id"
              @on-select="onSelectPackagers"
            />
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="left">发布设定</Divider>
      <Row>
        <Col span="12">
          <FormItem label="发布器选择" required prop="deployers">
            <DeployerSelectWithManage
              :multiple="true"
              :data="config.deployers"
              :project_id="project_id"
              @on-select="onSelectDeployers"
            />
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="自动发布" prop="auto_deploy">
            <i-switch class="switch" v-model="config.auto_deploy" />
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="left">Hook设定</Divider>
      <Row>
        <Col span="12">
          <FormItem label="构建结果Hook" prop="after_build_hook">
            <Input v-model="config.after_build_hook" placeholder="请输入构建结果反馈url(非必需)" />
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="发布结果Hook" prop="after_deploy_hook">
            <Input v-model="config.after_deploy_hook" placeholder="请输入发布结果反馈url(非必需)" />
          </FormItem>
        </Col>
      </Row>
      <Row>
        <FormItem>
          <Button type="primary" @click="onSave">保存</Button>
          <Button style="margin-left: 15px" @click="onReset">
            {{
            id ? '返回' : '取消'
            }}
          </Button>
          <Button v-if="id" type="error" ghost style="margin-left: 15px" @click="onDelete">删除</Button>
        </FormItem>
      </Row>
    </Form>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue } from 'vue-property-decorator';
import { Form, FormItem } from 'iview';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import { nsJob, nsProject } from '../store';
import { Job, JobConfig } from '../types/job';
import { defaultJobConfig } from '../store/modules/job';
import BranchSelect from '@/components/business/BranchSelect.vue';
import BuilderSelectWithManage from '@/components/combine/BuilderSelectWithManage.vue';
import DeployerSelectWithManage from '@/components/combine/DeployerSelectWithManage.vue';
import PackagerSelectWithManage from '@/components/combine/PackagerSelectWithManage.vue';
import { Builder } from '../types/builder';
import { Packager } from '../types/packager';
import { Deployer } from '../types/deployer';
import { Project } from '../types/project';

@Component({
  components: {
    BranchSelect,
    BuilderSelectWithManage,
    DeployerSelectWithManage,
    PackagerSelectWithManage,
  },
})
export default class ViewJobConfig extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('current', nsProject) project!: Project;
  @State('current', nsJob) job!: Job;
  @Action('querySingle', nsProject) queryProject!: (id: number) => void;
  @Action('create', nsJob) createJob!: (config: JobConfig) => void;
  @Action('update', nsJob) updateJob!: ({
    id,
    config,
  }: {
    id: number;
    config: JobConfig;
  }) => void;
  @Action('querySingle', nsJob) queryJob!: (id: number) => void;
  @Action('delete', nsJob) deleteJob!: (id: number) => void;

  config: JobConfig = { ...defaultJobConfig };

  id = 0;

  project_id = 0;

  async mounted() {
    const { id, project_id } = this.$route.params;
    this.project_id = +project_id;
    await this.queryProject(this.project_id);
    if (id) {
      this.id = +id;
      await this.fetch();
    }
    this.config.project = {
      id: this.project_id,
    };
  }

  beforeDestroy() {
    this.queryJob(0);
  }

  async fetch() {
    await this.queryJob(this.id);
    if (this.error) {
      return;
    }
    const { id, ...config } = this.job;
    this.config = config;
  }

  onSelectBranches(branches: string[]) {
    this.config.branches = branches;
  }

  onSelectBuilder(builder: Builder) {
    this.config.builder = builder;
  }

  onSelectPackagers(packagers: Packager[]) {
    this.config.packagers = packagers;
  }

  onSelectDeployers(deployers: Deployer[]) {
    this.config.deployers = deployers;
  }

  async onSave() {
    const valid = await (this.$refs.form as Form).validate();
    if (!valid) {
      return;
    }
    if (this.id) {
      const { id, ...config } = this.config as Job;
      await this.updateJob({ id: this.id, config });
    } else {
      await this.createJob(this.config);
    }
    if (!this.error) {
      this.$router.go(-1);
    }
  }

  onReset() {
    if (this.id) {
      this.$router.go(-1);
    } else {
      (this.$refs.form as Form).resetFields();
    }
  }

  async onDelete() {
    this.$Modal.confirm({
      title: '提示',
      content: '删除操作不可恢复，请确认是否删除该任务',
      onOk: async () => {
        await this.deleteJob(this.id);
        if (!this.error) {
          this.$router.go(-1);
        }
      },
    });
  }
}
</script>

<style lang="less" scoped>
.form {
  width: 800px;
  text-align: left;
}
</style>
