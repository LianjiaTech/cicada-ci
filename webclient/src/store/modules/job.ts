import { Module } from 'vuex';
import { JobConfig, Job, JobListFilter } from '@/types/job';
import ajax from '@/ajax';
import { dateFormat } from '@/utils';
import { defaultBuilderConfig } from './builder';

export const defaultJobConfig: JobConfig = {
  name: '',
  project: { id: 0 },
  branches: [],
  builder: { id: 0, ...defaultBuilderConfig },
  packagers: [],
  deployers: [],
  auto_build: false,
  auto_deploy: false,
  after_build_hook: '',
  after_deploy_hook: '',
  disable_cache: false,
};

interface JobState {
  list: Job[];
  current: Job;
}

const defaultState: JobState = {
  list: [],
  current: { id: 0, ...defaultJobConfig },
};

const jobStore: Module<JobState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: JobState, payload: Job[]) => {
      state.list = payload.map((job: Job) => {
        return {
          ...job,
          create_time: dateFormat(job.create_time, 'YYYY-MM-DD HH:mm:ss'),
          update_time: dateFormat(job.update_time, 'YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    updateCurrent: (state: JobState, payload: Job) => {
      state.current = {
        ...payload,
        create_time: dateFormat(payload.create_time, 'YYYY-MM-DD HH:mm:ss'),
        update_time: dateFormat(payload.update_time, 'YYYY-MM-DD HH:mm:ss'),
      };
    },
    resetCurrent: (state: JobState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async create(store, config: JobConfig) {
      await ajax(
        store,
        {
          url: '/api/job',
          method: 'post',
          data: config,
        },
        true,
      );
    },

    async update(store, { id, config }: { id: number; config: JobConfig }) {
      await ajax(
        store,
        {
          url: `/api/job/${id}`,
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
          url: `/api/job/${id}`,
          method: 'delete',
        },
        true,
      );
    },

    async queryList(
      store,
      params: JobListFilter = {
        project_id: 0,
      },
    ) {
      await ajax(
        store,
        {
          url: '/api/job/list',
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
          url: `/api/job/${id}`,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },
  },
};

export default jobStore;
