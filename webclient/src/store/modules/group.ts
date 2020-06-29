import { Module } from 'vuex';
import {
  CreateGroupConfig,
  Group,
  GroupBasic,
  GroupsWithCount,
} from '@/types/group';
import ajax from '@/ajax';
import { PaginationOptions } from '@/types/common';
import { dateFormat } from '@/utils';

export const defaultCreateConfig: CreateGroupConfig = {
  name: '',
  admins: [],
};

interface GroupState {
  groups: GroupsWithCount;
  all: GroupBasic[];
  current: Group;
}

const defaultState: GroupState = {
  groups: {
    total: 0,
    results: [],
  },
  all: [],
  current: { id: 0, projects: [], ...defaultCreateConfig },
};

const groupStore: Module<GroupState, any> = {
  namespaced: true,
  state: { ...defaultState },
  getters: {},
  mutations: {
    updateList: (state: GroupState, payload: GroupsWithCount) => {
      state.groups = {
        total: payload.total,
        results: payload.results.map((group: Group) => {
          return {
            ...group,
            create_time: dateFormat(group.create_time, 'YYYY-MM-DD HH:mm:ss'),
            update_time: dateFormat(group.update_time, 'YYYY-MM-DD HH:mm:ss'),
          };
        }),
      };
    },
    updateAll(state: GroupState, payload: GroupBasic[]) {
      state.all = [...payload];
    },
    updateCurrent: (state: GroupState, payload: Group) => {
      state.current = {
        ...payload,
        create_time: dateFormat(payload.create_time, 'YYYY-MM-DD HH:mm:ss'),
        update_time: dateFormat(payload.update_time, 'YYYY-MM-DD HH:mm:ss'),
      };
    },
    resetCurrent: (state: GroupState) => {
      state.current = { ...defaultState.current };
    },
  },
  actions: {
    async create(store, config: CreateGroupConfig) {
      await ajax(
        store,
        {
          url: '/api/group',
          method: 'post',
          data: config,
        },
        true,
      );
    },

    async update(
      store,
      { id, config }: { id: number; config: CreateGroupConfig },
    ) {
      await ajax(
        store,
        {
          url: `/api/group/${id}`,
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
          url: `/api/group/${id}`,
          method: 'delete',
        },
        true,
      );
    },

    async queryList(
      store,
      params: PaginationOptions = {
        page: 0,
        page_size: 10,
      },
    ) {
      await ajax(
        store,
        {
          url: '/api/group/list',
          params,
          mutationType: 'updateList',
        },
        true,
      );
    },

    async queryAll(store) {
      await ajax(
        store,
        {
          url: '/api/group/all',
          mutationType: 'updateAll',
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
          url: `/api/group/${id}`,
          mutationType: 'updateCurrent',
        },
        true,
      );
    },
  },
};

export default groupStore;
