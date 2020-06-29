import { Module } from 'vuex';
import { BasicPackagerConfig, Packager } from '@/types/packager';
import ajax from '@/ajax';
import { dateFormat } from '@/utils';

export const defaultPackagerConfig: BasicPackagerConfig = {
  project_id: 0,
  package_name: '',
  dist_path: '',
};

interface PackagerState {
  list: Packager[];
  current: Packager;
}

const defaultState: PackagerState = {
  list: [],
  current: { id: 0, ...defaultPackagerConfig },
};

const packagerStore: Module<PackagerState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: PackagerState, payload: Packager[]) => {
      state.list = payload.map((job: Packager) => {
        return {
          ...job,
          create_time: dateFormat(job.create_time, 'YYYY-MM-DD HH:mm:ss'),
          update_time: dateFormat(job.update_time, 'YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    updateCurrent: (state: PackagerState, payload: Packager) => {
      state.current = {
        ...payload,
        create_time: dateFormat(payload.create_time, 'YYYY-MM-DD HH:mm:ss'),
        update_time: dateFormat(payload.update_time, 'YYYY-MM-DD HH:mm:ss'),
      };
    },
    resetList: (state: PackagerState) => {
      state.list = [];
    },
    resetCurrent: (state: PackagerState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async create(store, config: BasicPackagerConfig) {
      await ajax(
        store,
        {
          url: '/api/packager',
          method: 'post',
          data: config,
        },
        true,
      );
    },

    async update(
      store,
      { id, config }: { id: number; config: BasicPackagerConfig },
    ) {
      await ajax(
        store,
        {
          url: `/api/packager/${id}`,
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
          url: `/api/packager/${id}`,
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
          url: '/api/packager/list',
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
          url: `/api/packager/${id}`,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },
  },
};

export default packagerStore;
