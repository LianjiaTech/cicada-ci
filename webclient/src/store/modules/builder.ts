import { Module } from 'vuex';
import { BasicBuilderConfig, Builder } from '@/types/builder';
import ajax from '@/ajax';
import { dateFormat } from '@/utils';

export const defaultBuilderConfig: BasicBuilderConfig = {
  project_id: 0,
  name: '',
  install_scripts: '',
  build_scripts: '',
};

interface BuilderState {
  list: Builder[];
  current: Builder;
}

const defaultState: BuilderState = {
  list: [],
  current: { id: 0, ...defaultBuilderConfig },
};

const builderStore: Module<BuilderState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: BuilderState, payload: Builder[]) => {
      state.list = payload.map((job: Builder) => {
        return {
          ...job,
          create_time: dateFormat(job.create_time, 'YYYY-MM-DD HH:mm:ss'),
          update_time: dateFormat(job.update_time, 'YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    updateCurrent: (state: BuilderState, payload: Builder) => {
      state.current = {
        ...payload,
        create_time: dateFormat(payload.create_time, 'YYYY-MM-DD HH:mm:ss'),
        update_time: dateFormat(payload.update_time, 'YYYY-MM-DD HH:mm:ss'),
      };
    },
    resetList: (state: BuilderState) => {
      state.list = [];
    },
    resetCurrent: (state: BuilderState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async create(store, config: BasicBuilderConfig) {
      await ajax(
        store,
        {
          url: '/api/builder',
          method: 'post',
          data: config,
        },
        true,
      );
    },

    async update(
      store,
      { id, config }: { id: number; config: BasicBuilderConfig },
    ) {
      await ajax(
        store,
        {
          url: `/api/builder/${id}`,
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
          url: `/api/builder/${id}`,
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
          url: '/api/builder/list',
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
          url: `/api/builder/${id}`,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },
  },
};

export default builderStore;
