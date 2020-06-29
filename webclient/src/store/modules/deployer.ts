import { Module } from 'vuex';
import { BasicDeployerConfig, Deployer } from '@/types/deployer';
import ajax from '@/ajax';
import { dateFormat } from '@/utils';

export const defaultDeployerConfig: BasicDeployerConfig = {
  project_id: 0,
  name: '',
  scripts: '',
  branch_filter: '',
};

interface DeployerState {
  list: Deployer[];
  current: Deployer;
}

const defaultState: DeployerState = {
  list: [],
  current: { id: 0, ...defaultDeployerConfig },
};

const deployerStore: Module<DeployerState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: DeployerState, payload: Deployer[]) => {
      state.list = payload.map((job: Deployer) => {
        return {
          ...job,
          create_time: dateFormat(job.create_time, 'YYYY-MM-DD HH:mm:ss'),
          update_time: dateFormat(job.update_time, 'YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    updateCurrent: (state: DeployerState, payload: Deployer) => {
      state.current = {
        ...payload,
        create_time: dateFormat(payload.create_time, 'YYYY-MM-DD HH:mm:ss'),
        update_time: dateFormat(payload.update_time, 'YYYY-MM-DD HH:mm:ss'),
      };
    },
    resetList: (state: DeployerState) => {
      state.list = [];
    },
    resetCurrent: (state: DeployerState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async create(store, config: BasicDeployerConfig) {
      await ajax(
        store,
        {
          url: '/api/deployer',
          method: 'post',
          data: config,
        },
        true,
      );
    },

    async update(
      store,
      { id, config }: { id: number; config: BasicDeployerConfig },
    ) {
      await ajax(
        store,
        {
          url: `/api/deployer/${id}`,
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
          url: `/api/deployer/${id}`,
          method: 'delete',
        },
        true,
      );
    },

    async queryList(store, project_id: number = 0) {
      if (!project_id) {
        return store.commit('resetList');
      }
      await ajax(
        store,
        {
          url: '/api/deployer/list',
          params: { project_id },
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
          url: `/api/deployer/${id}`,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },
  },
};

export default deployerStore;
