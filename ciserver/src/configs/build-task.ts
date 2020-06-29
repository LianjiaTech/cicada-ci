import * as os from 'os';

export default {
  workspace: '~/work/cicada-ci/workspace'.replace('~', os.homedir()),
  packspace: '~/work/cicada-ci/packspace'.replace('~', os.homedir()),
  cachespace: '~/work/cicada-ci/cachespace'.replace('~', os.homedir()),
};
