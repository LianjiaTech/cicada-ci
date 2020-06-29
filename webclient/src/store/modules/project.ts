import { Module } from 'vuex';
import {
  CreateProjectConfig,
  UpdateProjectConfig,
  ProjectsWithCount,
  ProjectFilter,
  Project,
} from '@/types/project';
import ajax from '@/ajax';
import { PaginationOptions } from '@/types/common';
import { dateFormat } from '@/utils';

export const defaultCreateConfig: CreateProjectConfig = {
  name: '',
  repo_url: '',
  ssh_url: '',
  clone_with_ssh: false,
  repo_id: 0,
  enable_webhook: false,
  group: { id: 0, name: '' },
  admins: [],
  adv_configs: {
    install_type: 0,
    enable_deps_cache: false,
  },
};

interface ProjectState {
  projects: ProjectsWithCount;
  current: Project;
}

const defaultState: ProjectState = {
  projects: {
    total: 0,
    results: [],
  },
  current: { id: 0, ...defaultCreateConfig },
};

const projectStore: Module<ProjectState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: ProjectState, payload: ProjectsWithCount) => {
      state.projects = {
        total: payload.total,
        results: payload.results.map((project: Project) => {
          return {
            ...project,
            create_time: dateFormat(project.create_time, 'YYYY-MM-DD HH:mm:ss'),
            update_time: dateFormat(project.update_time, 'YYYY-MM-DD HH:mm:ss'),
          };
        }),
      };
    },
    updateCurrent: (state: ProjectState, payload: Project) => {
      state.current = {
        ...payload,
        create_time: dateFormat(payload.create_time, 'YYYY-MM-DD HH:mm:ss'),
        update_time: dateFormat(payload.update_time, 'YYYY-MM-DD HH:mm:ss'),
      };
    },
    resetCurrent: (state: ProjectState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async create(store, config: CreateProjectConfig) {
      await ajax(
        store,
        {
          url: '/api/project',
          method: 'post',
          data: config,
        },
        true,
      );
    },

    async update(
      store,
      { id, config }: { id: number; config: UpdateProjectConfig },
    ) {
      await ajax(
        store,
        {
          url: `/api/project/${id}`,
          method: 'put',
          data: config,
        },
        true,
      );
    },

    async delete(store, id: number) {
      await ajax(
        store,
        {
          url: `/api/project/${id}`,
          method: 'delete',
        },
        true,
      );
    },

    async queryList(
      store,
      params: PaginationOptions & ProjectFilter = {
        page: 0,
        page_size: 10,
        keywords: '',
        created: false,
      },
    ) {
      await ajax(
        store,
        {
          url: '/api/project/list',
          params,
          mutationType: 'updateList',
        },
        true,
      );
    },

    async querySingle(store, id = 0) {
      if (!id) {
        return store.commit('resetCurrent');
      }
      await ajax(
        store,
        {
          url: `/api/project/${id}`,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },
  },
};

export default projectStore;
