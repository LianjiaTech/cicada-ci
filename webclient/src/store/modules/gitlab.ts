import { Module } from 'vuex';
import ajax from '@/ajax';

export interface GitlabRepoInfo {
  id: number;
  ssh_url_to_repo: string;
}

interface GitlabState {
  repo: GitlabRepoInfo;
  branches: string[];
}

const defaultState: GitlabState = {
  repo: { id: 0, ssh_url_to_repo: '' },
  branches: [],
};

const gitlabStore: Module<GitlabState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateRepoInfo(state: GitlabState, payload: GitlabRepoInfo) {
      state.repo = payload;
    },
    resetRepoInfo(state: GitlabState) {
      state.repo = { ...defaultState.repo };
    },
    updateBranches(state: GitlabState, payload: string[]) {
      state.branches = payload;
    },
    resetBranches(state: GitlabState) {
      state.branches = [];
    },
  },
  actions: {
    async getGitlabRepoInfo(store, repo_url: string) {
      if (!repo_url) {
        store.commit('resetRepoInfo');
      }
      await ajax(
        store,
        {
          url: '/api/gitlab/repo',
          params: { repo_url },
          mutationType: 'updateRepoInfo',
        },
        true,
      );
    },

    async updateGitlabWebHookActivity(
      store,
      data: { repo_url: string; active: boolean },
    ) {
      await ajax(
        store,
        {
          url: '/api/gitlab/repo/hook',
          method: 'post',
          data,
        },
        true,
      );
    },

    async updateGitlabDeployKeyActivity(
      store,
      data: { repo_url: string; active: boolean },
    ) {
      await ajax(
        store,
        {
          url: '/api/gitlab/repo/deploy-key',
          method: 'post',
          data,
        },
        true,
      );
    },

    async getBranches(store, repo_url = '') {
      if (!repo_url) {
        return store.commit('resetBranches');
      }
      await ajax(
        store,
        {
          url: '/api/gitlab/branches',
          params: { repo_url },
          mutationType: 'updateBranches',
        },
        true,
      );
    },
  },
};

export default gitlabStore;
