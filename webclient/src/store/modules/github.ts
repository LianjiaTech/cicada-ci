import { Module } from 'vuex';
import ajax from '@/ajax';

export interface GithubRepoInfo {
  id: number;
  ssh_url: string;
}

interface GithubState {
  repo: GithubRepoInfo;
  branches: string[];
}

const defaultState: GithubState = {
  repo: { id: 0, ssh_url: '' },
  branches: [],
};

const githubStore: Module<GithubState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateRepoInfo(state: GithubState, payload: GithubRepoInfo) {
      state.repo = payload;
    },
    resetRepoInfo(state: GithubState) {
      state.repo = { ...defaultState.repo };
    },
    updateBranches(state: GithubState, payload: string[]) {
      state.branches = payload;
    },
    resetBranches(state: GithubState) {
      state.branches = [];
    },
  },
  actions: {
    async getGithubRepoInfo(store, repo_url: string) {
      if (!repo_url) {
        store.commit('resetRepoInfo');
      }
      await ajax(
        store,
        {
          url: '/api/github/repo',
          params: { repo_url },
          mutationType: 'updateRepoInfo',
        },
        true,
      );
    },

    async updateGithubWebHookActivity(
      store,
      data: { repo_url: string; active: boolean },
    ) {
      await ajax(
        store,
        {
          url: '/api/github/repo/hook',
          method: 'post',
          data,
        },
        true,
      );
    },

    async updateGithubDeployKeyActivity(
      store,
      data: { repo_url: string; active: boolean },
    ) {
      await ajax(
        store,
        {
          url: '/api/github/repo/deploy-key',
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
          url: '/api/github/branches',
          params: { repo_url },
          mutationType: 'updateBranches',
        },
        true,
      );
    },
  },
};

export default githubStore;
