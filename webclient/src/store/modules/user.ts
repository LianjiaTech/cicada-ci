import { Module } from 'vuex';
import { User } from '@/types/user';
import ajax from '@/ajax';
import { getCookie } from '@/utils';

interface UserState {
  current: User;
  oauthGithubUrl: string;
  oauthGitlabUrl: string;
  searchResults: User[];
  admins: User[];
}

const defaultState: UserState = {
  current: {
    id: 0,
    name: '',
    account: '',
    from: 'github',
    admin_level: -1,
    is_admin: false,
    is_super_admin: false,
  },
  oauthGithubUrl: '',
  oauthGitlabUrl: '',
  searchResults: [],
  admins: [],
};

const userStore: Module<UserState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {
    currentUser: (state: UserState) => {
      return { ...state.current };
    },
  },
  mutations: {
    updateCurrentUser(state: UserState, payload: User) {
      state.current = {
        ...payload,
        is_admin: payload.admin_level! > 0,
        is_super_admin: payload.admin_level === 2,
      };
    },

    resetCurrentUser(state: UserState) {
      state.current = { ...defaultState.current };
    },

    updateOauthGithubUrl(state: UserState, payload: string) {
      state.oauthGithubUrl = payload;
    },

    updateOauthGitlabUrl(state: UserState, payload: string) {
      state.oauthGitlabUrl = payload;
    },

    updateSearchResults(state: UserState, payload: User[]) {
      state.searchResults = payload.map(item => {
        const { id, name, account, from, admin_level } = item;
        return { id, name, account, from, admin_level };
      });
    },

    updateAdmins(state: UserState, payload: User[]) {
      state.admins = payload;
    },
  },
  actions: {
    async login(store, { username = '', password = '' }) {
      await ajax(
        store,
        {
          url: '/api/user/login',
          method: 'post',
          data: {
            username,
            password,
          },
          mutationType: 'updateCurrentUser',
        },
        true,
      );
    },
    async logout(store) {
      await ajax(
        store,
        {
          url: '/api/user/logout',
          method: 'post',
          mutationType: 'resetCurrentUser',
        },
        true,
      );
    },

    async getOauthGithubUrl(store, state = '') {
      await ajax(store, {
        url: '/oauth/github/authurl',
        params: {
          state,
        },
        mutationType: 'updateOauthGithubUrl',
      });
    },

    async getOauthGitlabUrl(store, state = '') {
      await ajax(store, {
        url: '/oauth/gitlab/authurl',
        params: {
          state,
        },
        mutationType: 'updateOauthGitlabUrl',
      });
    },

    async search(store, keyword = '') {
      await ajax(
        store,
        {
          url: '/api/user/search',
          params: {
            keyword,
          },
          mutationType: 'updateSearchResults',
        },
        true,
      );
    },

    getLocalUser(store) {
      const localUser = getCookie('user');
      if (!localUser) {
        return;
      }
      try {
        const user = JSON.parse(localUser);
        store.commit('updateCurrentUser', user);
      } catch (e) {
        store.commit('parseLocalUserError');
      }
    },

    async fetchAdmins(store) {
      return await ajax(
        store,
        {
          url: '/api/user/admins',
          params: {
            page: 0,
            page_size: 100, //上限，不设分页
          },
          mutationType: 'updateAdmins',
        },
        true,
      );
    },

    async updateAdmin(store, { id, admin_level }) {
      return await ajax(
        store,
        {
          url: `/api/user/${id}`,
          method: 'put',
          data: { admin_level },
        },
        true,
      );
    },
  },
};

export default userStore;
