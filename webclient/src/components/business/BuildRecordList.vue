<template>
  <Table
    class="table"
    stripe
    :columns="columns"
    :data="data"
    :loading="loading"
    :row-class-name="
      () => {
        return 'build-row';
      }
    "
    @on-row-click="onClickRow"
  >
    <template slot-scope="{ row }" slot="commit">
      {{
      row.commits.length ? row.commits[row.commits.length - 1].message : ''
      }}
    </template>
    <template slot-scope="{ row }" slot="package_sizes">
      <a
        v-for="(pack, index) in row.package_sizes"
        :key="index"
        :href="pack.download_url"
        @click.stop
        class="link-package"
      >{{ pack.package_name }} ({{ pack.size }})</a>
    </template>
    <template slot-scope="{ row }" slot="commitor">
      {{
      row.commits.length ? row.commits[0].author_name || row.commits[0].author.name : ''
      }}
    </template>
    <template slot-scope="{ row }" slot="time">
      <div class="ellipsis">{{ row.update_time || row.create_time }}</div>
    </template>
    <template slot-scope="{ row }" slot="action">
      <Button
        v-if="
          row.status === BuildStatus.INIT || row.status === BuildStatus.ABORT
        "
        @click.stop="onClickBuild(row.id)"
      >构建</Button>
      <Button v-if="row.status === BuildStatus.PROCESSING" @click.stop="onClickAbort(row.id)">取消构建</Button>
      <Button v-if="row.status === BuildStatus.INQUEUE" @click.stop="onClickDequeue(row.id)">取消等待</Button>
      <Button v-if="row.status === BuildStatus.SUCCESS" @click.stop="onClickDeploy(row)">发布</Button>
    </template>
  </Table>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Table, Button } from 'iview';
import CurrentUser from '../../mixins/CurrentUser';
import { BuildRecord, BuildStatus } from '../../types/build-record';

@Component({
  components: {
    Table,
    Button,
  },
})
export default class BuildRecordList extends mixins(CurrentUser) {
  @Prop({
    default: () => {
      return [];
    },
  })
  data!: BuildRecord[];

  @Prop({ default: 0 }) project_id!: number;

  @Prop({ default: 0 }) job_id!: number;

  BuildStatus = BuildStatus;

  columns = [
    {
      title: 'id',
      key: 'id',
      width: 65,
    },
    {
      title: '分支',
      key: 'branch',
    },
    {
      title: '提交信息',
      slot: 'commit',
    },
    {
      title: '提交人',
      slot: 'commitor',
    },
    {
      title: '构建状态',
      key: 'status',
      width: 100,
    },
    {
      title: '构建时长',
      key: 'duration',
      width: 100,
    },
    {
      title: '构建包',
      slot: 'package_sizes',
    },
    {
      title: '更新时间',
      slot: 'time',
      width: 150,
    },
    {
      title: '操作',
      slot: 'action',
      width: 220,
      align: 'center',
    },
  ];

  loading = false;

  onClickRow(row: BuildRecord) {
    this.$emit('on-click-row', row);
  }

  onClickBuild(id: number) {
    this.$emit('on-click-build', id);
  }

  onClickAbort(id: number) {
    this.$emit('on-click-abort', id);
  }
  onClickDequeue(id: number) {
    this.$emit('on-click-dequeue', id);
  }
  onClickDeploy(row: BuildRecord) {
    this.$emit('on-click-deploy', row);
  }
}
</script>

<style less scoped>
.button {
  margin: 0 3px;
}
.lines {
  white-space: pre;
}
.link-package {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<style lang="less">
.build-row {
  cursor: pointer;
}
</style>
