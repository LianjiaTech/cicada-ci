import axios, { AxiosRequestConfig } from 'axios';
import { ActionContext } from 'vuex';

interface AjaxConfigs extends AxiosRequestConfig {
  mutationType?: string;
}

const ajax = (
  store: ActionContext<any, any>,
  configs: AjaxConfigs = {
    url: '',
    method: 'get',
    params: {},
    data: {},
    mutationType: '',
  },
  withCredentials = false,
) => {
  const { url, method, params, data, mutationType = '' } = configs;
  return axios({
    url: url,
    method,
    params,
    data,
    withCredentials,
  })
    .then(res => {
      if (res.data.code) {
        let message = res.data.message;
        if (typeof message === 'object') {
          message = JSON.stringify(message);
        }
        store.commit(
          'updateError',
          { message: `${message}\nfrom: ${url}` },
          { root: true },
        );
      } else {
        if (mutationType) {
          store.commit(mutationType, res.data.data);
        }
      }
    })
    .catch(err => {
      store.commit(
        'updateError',
        { message: `${err}\nfrom: ${url}` },
        { root: true },
      );
    });
};

export default ajax;
