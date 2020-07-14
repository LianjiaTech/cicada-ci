<template>
  <Card :bordered="false" dis-hover>
    <p slot="title">{{ id ? '项目设定' : '新建项目' }}</p>
    <Form ref="form" class="form" :label-width="100" :model="config">
      <Divider orientation="left">基本设定</Divider>
      <Row>
        <Col span="12">
          <FormItem label="项目名称" required prop="name">
            <Input class="form-item" v-model="config.name" placeholder="输入任务名称..." />
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="项目分组" prop="group.id" :rules="groupValidateRule">
            <Select @on-select="onSelectGroup" v-model="config.group.id">
              <Option v-for="option in groups" :value="option.id" :key="option.id">{{ option.name }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem
            label="Git地址"
            required
            prop="repo_url"
            :error="checkRepoStatus === 'failed' ? 'invalid value' : ''"
          >
            <Input
              class="form-item"
              v-model="config.repo_url"
              placeholder="输入git仓库地址..."
              @on-blur="checkRepoAccess"
              :disabled="!!id || checkRepoStatus === 'loading'"
            >
              <Icon
                v-show="checkRepoStatus === 'loading'"
                slot="suffix"
                type="ios-loading"
                class="loading-animate"
              />
              <Icon
                v-if="checkRepoStatus === 'success'"
                slot="suffix"
                type="ios-checkmark"
                size="20"
                color="green"
              />
            </Input>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label prop="clone_with_ssh">
            <span slot="label">CloneWithSSH</span>
            <i-switch
              v-model="config.clone_with_ssh"
              class="switch"
              :disabled="!id && checkRepoStatus !== 'success'"
              @on-change="updateDeployKeyActivity"
            />
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label prop="enable_webhook">
            <span slot="label">
              <HelpTip
                title="WebHook"
                type="underline"
                :message="
                  `webhook用于自动构建。\n当代码提交至git仓库时，git将自动推送消息至hook服务。\n具体参见<a href='https://developer.github.com/webhooks/' target='_blank'>详细说明</a>`
                "
              />
            </span>
            <i-switch
              v-model="config.enable_webhook"
              class="switch"
              :disabled="!id && checkRepoStatus !== 'success'"
              @on-change="updateWebHookActivity"
            />
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="left">人员设定</Divider>
      <FormItem label prop="admins">
        <span slot="label">
          <HelpTip
            title="项目管理员"
            type="underline"
            :message="
              `项目管理员有权\n·查看修改项目和任务设定\n·创建、删除、发布构建\n·查看项目相关统计数据`
            "
          />
        </span>
        <UserSelect :multiple="true" :data="config.admins" @on-select="onSelectAdmins" />
      </FormItem>
      <FormItem label>
        <span slot="label">
          <HelpTip title="项目组管理员" type="underline" :message="`项目组管理员权限与项目管理员相同，有权管理组内所有项目`" />
        </span>
      </FormItem>
      <Divider orientation="left">高级设定</Divider>
      <!-- <FormItem label="依赖安装方式" prop="adv_configs.install_type">
        <Select v-model="config.adv_configs.install_type">
          <Option :value="0">在任务设定中指定安装脚本</Option>
          <Option :value="1">系统自动分析package.json路径</Option>
        </Select>
      </FormItem>-->
      <FormItem label="使用依赖缓存" prop="adv_configs.enable_deps_cache">
        <i-switch class="switch" v-model="config.adv_configs.enable_deps_cache" />
      </FormItem>
      <Row>
        <Col span="24">
          <FormItem>
            <Button type="primary" @click="onSave">保存</Button>
            <Button style="margin-left: 15px" @click="onReset">
              {{
              id ? '返回' : '取消'
              }}
            </Button>
            <Button v-if="id" type="error" ghost style="margin-left: 15px" @click="onDelete">删除</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue } from 'vue-property-decorator';
import {
  Form,
  FormItem,
  Card,
  Divider,
  Row,
  Col,
  Input,
  Button,
  Select,
  Option,
  Icon,
  Switch,
} from 'iview';
import { mixins } from 'vue-class-component';
import CurrentUser from '../mixins/CurrentUser';
import HelpTip from '@/components/common/HelpTip.vue';
import UserSelect from '@/components/business/UserSelect.vue';
import {
  CreateProjectConfig,
  UpdateProjectConfig,
  Project,
} from '../types/project';
import { defaultCreateConfig } from '../store/modules/project';
import { nsProject, nsGithub, nsGroup, nsGitlab } from '../store';
import { User } from '../types/user';
import { GroupBasic } from '../types/group';
import { GithubRepoInfo } from '../store/modules/github';
import { GitlabRepoInfo } from '../store/modules/gitlab';

@Component({
  components: {
    HelpTip,
    UserSelect,
    Form,
    FormItem,
    Card,
    Divider,
    Row,
    Col,
    Input,
    Button,
    Select,
    Option,
    Icon,
    'i-switch': Switch,
  },
})
export default class ProjectConfig extends mixins(CurrentUser) {
  @State('error') error!: string;
  @State('current', nsProject) project!: Project;
  @State('all', nsGroup) groups!: GroupBasic[];
  @State('repo', nsGithub) githubRepo!: GithubRepoInfo;
  @State('repo', nsGitlab) gitlabRepo!: GitlabRepoInfo;
  @Action('setError') setError!: (message: string) => void;
  @Action('create', nsProject) createProject!: (
    config: CreateProjectConfig,
  ) => void;
  @Action('update', nsProject) updateProject!: ({
    id,
    config,
  }: {
    id: number;
    config: UpdateProjectConfig;
  }) => void;
  @Action('querySingle', nsProject) queryProject!: (id: number) => void;
  @Action('getGithubRepoInfo', nsGithub) getGithubRepoInfo!: (
    repo_url: string,
  ) => void;
  @Action('updateGithubWebHookActivity', nsGithub)
  updateGithubWebHookActivity!: (data: {
    repo_url: string;
    active: boolean;
  }) => void;
  @Action('updateGithubDeployKeyActivity', nsGithub)
  updateGithubDeployKeyActivity!: (data: {
    repo_url: string;
    active: boolean;
  }) => void;
  @Action('getGitlabRepoInfo', nsGitlab) getGitlabRepoInfo!: (
    repo_url: string,
  ) => void;
  @Action('updateGitlabWebHookActivity', nsGitlab)
  updateGitlabWebHookActivity!: (data: {
    repo_url: string;
    active: boolean;
  }) => void;
  @Action('updateGitlabDeployKeyActivity', nsGitlab)
  updateGitlabDeployKeyActivity!: (data: {
    repo_url: string;
    active: boolean;
  }) => void;
  @Action('queryAll', nsGroup) queryGroups!: () => void;
  @Action('delete', nsProject) deleteProject!: (id: number) => void;

  config: CreateProjectConfig = { ...defaultCreateConfig };

  checkRepoStatus: 'init' | 'loading' | 'success' | 'failed' = 'init';

  groupValidateRule = [
    {
      //required: true,
      pattern: /^[0-9]*$/,
      message: 'group is required',
    },
  ];

  id = 0;

  mounted() {
    if (this.$route.params.id) {
      this.id = +this.$route.params.id;
      this.fetch();
    }
    this.queryGroups();
  }

  beforeDestroy() {
    this.queryProject(0);
  }

  async fetch() {
    await this.queryProject(this.id);
    if (this.error) {
      return;
    }
    const { id, ...config } = this.project;
    if (!config.group) {
      config.group = this.config.group;
    }
    this.config = config;
  }

  async checkRepoAccess() {
    this.checkRepoStatus = 'loading';
    switch (this.user.from) {
      case 'github':
        await this.getGithubRepoInfo(this.config.repo_url);
        break;
      case 'gitlab':
        await this.getGitlabRepoInfo(this.config.repo_url);
        break;
      default:
        this.setError('source platform undefined');
        this.config.repo_url = '';
    }
    if (!this.error) {
      this.checkRepoStatus = 'success';
      switch (this.user.from) {
        case 'github':
          this.config.repo_id = this.githubRepo.id;
          this.config.ssh_url = this.githubRepo.ssh_url;
          break;
        case 'gitlab':
          this.config.repo_id = this.gitlabRepo.id;
          this.config.ssh_url = this.gitlabRepo.ssh_url_to_repo;
          break;
        default:
      }
    } else {
      this.checkRepoStatus = 'failed';
    }
  }

  async updateDeployKeyActivity(active: boolean) {
    switch (this.user.from) {
      case 'github':
        await this.updateGithubDeployKeyActivity({
          repo_url: this.config.repo_url,
          active,
        });
        break;
      case 'gitlab':
        await this.updateGitlabDeployKeyActivity({
          repo_url: this.config.repo_url,
          active,
        });
        break;
      default:
        this.setError('source platform undefined');
    }
  }

  async updateWebHookActivity(active: boolean) {
    switch (this.user.from) {
      case 'github':
        await this.updateGithubWebHookActivity({
          repo_url: this.config.repo_url,
          active,
        });
        break;
      case 'gitlab':
        await this.updateGitlabWebHookActivity({
          repo_url: this.config.repo_url,
          active,
        });
        break;
      default:
        this.setError('source platform undefined');
    }
  }

  onSelectGroup(id: number) {
    this.config.group = this.groups.find(
      group => group.id === id,
    ) as GroupBasic;
  }

  onSelectAdmins(admins: User[]) {
    this.config.admins = admins;
  }

  async onSave() {
    const valid = await (this.$refs.form as Form).validate();
    if (!valid) {
      return;
    }
    const config = { ...this.config };
    if (!this.config.group.id) {
      delete config.group;
    }
    if (this.id) {
      delete config.repo_url;
      await this.updateProject({ id: this.id, config });
    } else {
      await this.createProject(config);
    }
    if (!this.error) {
      this.$router.push('/projects');
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
      content: '删除操作不可恢复，请确认是否删除该项目',
      onOk: async () => {
        await this.deleteProject(this.id);
        if (!this.error) {
          this.$router.replace('/projects');
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
