import { Module } from 'vuex';
import ajax from '@/ajax';
import { Deployer } from '@/types/deployer';
import { DeployRecord, DeployStatus } from '@/types/deploy-record';
import { dateFormat } from '@/utils';

const CISERVER_HOST = process.env.VUE_APP_CI_SERVER_HOST;

const END_STATUS = [
  DeployStatus.SUCCESS,
  DeployStatus.FAIL,
  DeployStatus.ABORT,
  DeployStatus.TIMEOUT,
];

const deployRecordFormat = (record: DeployRecord) => {
  return {
    ...record,
    duration: record.duration ? record.duration + '秒' : 0,
    create_time: dateFormat(record.create_time, 'YYYY-MM-DD HH:mm:ss'),
    update_time: dateFormat(record.update_time, 'YYYY-MM-DD HH:mm:ss'),
    is_end: END_STATUS.includes(record.status),
  };
};

const defaultDeployRecord: DeployRecord = {
  id: 0,
  build_id: 0,
  deployer_id: 0,
  status: DeployStatus.INIT,
  duration: 0,
};

interface DeployRecordState {
  list: DeployRecord[];
  current: DeployRecord;
}

const defaultState: DeployRecordState = {
  list: [],
  current: { ...defaultDeployRecord },
};

const deployRecordStore: Module<DeployRecordState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: DeployRecordState, payload: DeployRecord[]) => {
      state.list = payload.map(deployRecordFormat);
    },

    resetList: (state: DeployRecordState) => {
      state.list = [];
    },

    updateCurrent: (state: DeployRecordState, payload: DeployRecord) => {
      state.current = deployRecordFormat(payload);
    },

    resetCurrent: (state: DeployRecordState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async queryList(store, build_id: number) {
      if (!build_id) {
        return store.commit('resetList');
      }
      await ajax(
        store,
        {
          url: '/api/deploy-record/list',
          params: { build_id },
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
          url: `/api/deploy-record/${id}`,
          params,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },

    async manualCreate(store, data: { build_id: number; deployer: Deployer }) {
      if (!data.build_id || !data.deployer) {
        return;
      }
      await ajax(
        store,
        {
          url: `${CISERVER_HOST}/deploy-task/create`,
          method: 'post',
          data: { ...data, is_auto: false },
        },
        true,
      );
    },
  },
};

export default deployRecordStore;
