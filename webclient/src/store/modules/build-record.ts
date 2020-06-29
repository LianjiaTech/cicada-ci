import { Module } from 'vuex';
import {
  BuildRecord,
  BuildRecordsWithCount,
  BuildRecordsFilter,
  BuildStatus,
} from '@/types/build-record';
import ajax from '@/ajax';
import { PaginationOptions } from '@/types/common';
import { dateFormat, sizeFormat } from '@/utils';
import { BuildRecordSummaryCount, BuildRecordDailyCount } from '@/types/stats';

const CISERVER_HOST = process.env.VUE_APP_CI_SERVER_HOST;

const buildRecordFormat = (record: BuildRecord) => {
  return {
    ...record,
    duration: record.duration ? record.duration + '秒' : 0,
    create_time: dateFormat(record.create_time, 'YYYY-MM-DD HH:mm:ss'),
    update_time: dateFormat(record.update_time, 'YYYY-MM-DD HH:mm:ss'),
    package_sizes: record.package_sizes
      ? record.package_sizes.map(({ package_name, size }) => ({
          package_name,
          size: sizeFormat(size as number),
          download_url: `${CISERVER_HOST}/download/${record.id}/${package_name}`,
        }))
      : [],
  };
};

export const defaultBuildRecord: BuildRecord = {
  id: 0,
  project_id: 0,
  job_id: 0,
  branch: '',
  commits: [],
  commitor: '',
  source: '',
  duration: 0,
  package_sizes: [],
  status: BuildStatus.INIT,
};

interface BuildRecordState {
  records: BuildRecordsWithCount;
  current: BuildRecord;
  summaryCountStats: BuildRecordSummaryCount[];
  dailyCountStats: BuildRecordDailyCount[];
}

const defaultState: BuildRecordState = {
  records: {
    total: 0,
    results: [],
  },
  current: { ...defaultBuildRecord },
  summaryCountStats: [],
  dailyCountStats: [],
};

const buildRecordStore: Module<BuildRecordState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: BuildRecordState, payload: BuildRecordsWithCount) => {
      state.records = {
        total: payload.total,
        results: payload.results.map(buildRecordFormat),
      };
    },
    updateCurrent: (state: BuildRecordState, payload: BuildRecord) => {
      state.current = buildRecordFormat(payload);
    },
    resetList: (state: BuildRecordState) => {
      state.records = { total: 0, results: [] };
    },
    resetCurrent: (state: BuildRecordState) => {
      state.current = { ...defaultState.current };
    },
    updateSummaryCountStats: (
      state: BuildRecordState,
      payload: BuildRecordSummaryCount[],
    ) => {
      state.summaryCountStats = payload;
    },
    resetSummaryCountStats: (state: BuildRecordState) => {
      state.summaryCountStats = [];
    },
    updateDailyCountStats: (
      state: BuildRecordState,
      payload: BuildRecordDailyCount[],
    ) => {
      state.dailyCountStats = payload;
    },
    resetDailyCountStats: (state: BuildRecordState) => {
      state.dailyCountStats = [];
    },
  },
  actions: {
    async queryList(
      store,
      params: PaginationOptions & BuildRecordsFilter = {
        page: 0,
        page_size: 10,
        project_id: 0,
        job_id: 0,
      },
    ) {
      if (!params.project_id || !params.job_id) {
        return store.commit('resetList');
      }
      await ajax(
        store,
        {
          url: '/api/build-record/list',
          params,
          mutationType: 'updateList',
        },
        true,
      );
    },

    async querySingle(store, { id = 0, showLog = false }) {
      if (!id) {
        return store.commit('resetCurrent');
      }
      const params = showLog ? { showLog } : {};
      await ajax(
        store,
        {
          url: `/api/build-record/${id}`,
          params,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },

    async addToBuildQueue(store, id = 0) {
      if (!id) {
        return;
      }
      await ajax(
        store,
        {
          url: `${CISERVER_HOST}/build-queue/${id}/add`,
          method: 'post',
        },
        true,
      );
    },

    async removeFromBuildQueue(store, id = 0) {
      if (!id) {
        return;
      }
      await ajax(
        store,
        {
          url: `${CISERVER_HOST}/build-queue/${id}/remove`,
          method: 'post',
        },
        true,
      );
    },

    async abortBuild(store, id = 0) {
      if (!id) {
        return;
      }
      await ajax(
        store,
        {
          url: `${CISERVER_HOST}/build-task/${id}/abort`,
          method: 'post',
        },
        true,
      );
    },

    async manualCreate(store, { job_id = 0, branch = '', from = '' }) {
      if (!job_id || !branch) {
        return;
      }
      await ajax(
        store,
        {
          url: `${CISERVER_HOST}/hook/manualCreate`,
          method: 'post',
          data: { job_id, branch, from },
        },
        true,
      );
    },

    async querySummaryCountStats(store, id = 0) {
      if (!id) {
        return store.commit('resetSummaryCountStats');
      }
      await ajax(
        store,
        {
          url: `/api/build-record/stats/summary-count`,
          params: { project_id: id },
          mutationType: 'updateSummaryCountStats',
        },
        true,
      );
    },

    async queryDailyCountStats(
      store,
      params: { project_id: number; start_date?: string; end_date?: string },
    ) {
      if (!params.project_id) {
        return store.commit('resetDailyCountStats');
      }
      await ajax(
        store,
        {
          url: `/api/build-record/stats/daily-count`,
          params,
          mutationType: 'updateDailyCountStats',
        },
        true,
      );
    },
  },
};

export default buildRecordStore;
