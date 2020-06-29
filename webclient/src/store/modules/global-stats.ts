import { Module } from 'vuex';
import ajax from '@/ajax';
import {
  BuildRecordSummaryCount,
  BuildRecordDailyCount,
  ProjectRankingItem,
} from '@/types/stats';
import { BuildStatus } from '@/types/build-record';

interface GlobalStatsState {
  summaryCountStats: BuildRecordSummaryCount[];
  dailyCountStats: BuildRecordDailyCount[];
  projectSuccessRankingStats: ProjectRankingItem[];
  projectFailRankingStats: ProjectRankingItem[];
}

const defaultState: GlobalStatsState = {
  summaryCountStats: [],
  dailyCountStats: [],
  projectSuccessRankingStats: [],
  projectFailRankingStats: [],
};

const globalStatsStore: Module<GlobalStatsState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateSummaryCountStats: (
      state: GlobalStatsState,
      payload: BuildRecordSummaryCount[],
    ) => {
      state.summaryCountStats = payload;
    },
    updateDailyCountStats: (
      state: GlobalStatsState,
      payload: BuildRecordDailyCount[],
    ) => {
      state.dailyCountStats = payload;
    },
    updateProjectSuccessRankingStats: (
      state: GlobalStatsState,
      payload: ProjectRankingItem[],
    ) => {
      state.projectSuccessRankingStats = payload;
    },
    updateProjectFailRankingStats: (
      state: GlobalStatsState,
      payload: ProjectRankingItem[],
    ) => {
      state.projectFailRankingStats = payload;
    },
  },
  actions: {
    async querySummaryCountStats(store) {
      await ajax(
        store,
        {
          url: `/api/build-record/stats/summary-count`,
          mutationType: 'updateSummaryCountStats',
        },
        true,
      );
    },

    async queryDailyCountStats(
      store,
      params: { start_date: string; end_date: string },
    ) {
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

    async queryProjectRankingStats(
      store,
      params: {
        start_date: string;
        end_date: string;
        rank_status: BuildStatus.SUCCESS | BuildStatus.FAIL;
      },
    ) {
      const mutationType =
        params.rank_status === BuildStatus.FAIL
          ? 'updateProjectFailRankingStats'
          : 'updateProjectSuccessRankingStats';
      await ajax(
        store,
        {
          url: `/api/build-record/stats/project-ranking`,
          params,
          mutationType,
        },
        true,
      );
    },
  },
};

export default globalStatsStore;
