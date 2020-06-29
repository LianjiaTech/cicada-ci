import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from '@/types/root';
import userStore from './modules/user';
import projectStore from './modules/project';
import jobStore from './modules/job';
import groupStore from './modules/group';
import githubStore from './modules/github';
import gitlabStore from './modules/gitlab';
import builderStore from './modules/builder';
import packagerStore from './modules/packager';
import deployerStore from './modules/deployer';
import buildRecordStore from './modules/build-record';
import deployRecordStore from './modules/deploy-record';
import globalStatsStore from './modules/global-stats';

Vue.use(Vuex);

export const nsUser = { namespace: 'user' };
export const nsProject = { namespace: 'project' };
export const nsJob = { namespace: 'job' };
export const nsGroup = { namespace: 'group' };
export const nsGithub = { namespace: 'github' };
export const nsGitlab = { namespace: 'gitlab' };
export const nsBuilder = { namespace: 'builder' };
export const nsPackager = { namespace: 'packager' };
export const nsDeployer = { namespace: 'deployer' };
export const nsBuildRecord = { namespace: 'buildRecord' };
export const nsDeployRecord = { namespace: 'deployRecord' };
export const nsGlobalStats = { namespace: 'globalStats' };

const store: StoreOptions<RootState> = {
  modules: {
    user: userStore,
    project: projectStore,
    job: jobStore,
    group: groupStore,
    github: githubStore,
    gitlab: gitlabStore,
    builder: builderStore,
    packager: packagerStore,
    deployer: deployerStore,
    buildRecord: buildRecordStore,
    deployRecord: deployRecordStore,
    globalStats: globalStatsStore,
  },
  state: {
    error: '',
  },
  mutations: {
    resetError(state: RootState) {
      state.error = '';
    },
    updateError(state: RootState, { message }) {
      state.error = message;
    },
  },
  actions: {
    setError(store, error: string) {
      store.commit('updateError', { message: error });
    },
    resetError(store) {
      store.commit('resetError');
    },
  },
};

export default new Vuex.Store<RootState>(store);
