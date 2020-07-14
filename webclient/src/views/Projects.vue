<template>
  <Card :bordered="false" dis-hover>
    <Row slot="title">
      <Col class="title" span="2">项目列表</Col>
      <Col span="20">
        <Icon type="ios-funnel-outline" />:
        <Checkbox :value="created" @on-change="onFilterCreated"
          >只看我创建的</Checkbox
        >
        <!-- <Checkbox :value="business" @on-change="changeFilterBusiness">只看我管理的项目组的</Checkbox> -->
        <Input
          class="input"
          search
          size="small"
          placeholder="搜索项目名称..."
          :value="keywords"
          @on-search="onFilterKeywords"
        />
      </Col>
    </Row>
    <ProjectList
      :data="projects.results"
      @on-click-row="onClickRow"
    ></ProjectList>
    <Page
      :total="projects.total"
      :current="page"
      :page-size="page_size"
      size="small"
      align="right"
      @on-change="onPageChange"
    />
  </Card>
</template>

<script lang="ts">
import { State, Action } from 'vuex-class';
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Card, Row, Col, Icon, Checkbox, Input, Page } from 'iview';
import CurrentUser from '../mixins/CurrentUser';
import ProjectList from '@/components/business/ProjectList.vue';
import { nsProject } from '../store';
import { Project, ProjectFilter, ProjectsWithCount } from '../types/project';
import { PaginationOptions } from '../types/common';

@Component({
  components: {
    ProjectList,
    Card,
    Row,
    Col,
    Icon,
    Checkbox,
    Input,
    Page,
  },
})
export default class Jobs extends mixins(CurrentUser) {
  @State('projects', nsProject) projects!: ProjectsWithCount;
  @Action('queryList', nsProject) queryList!: (
    options: PaginationOptions & ProjectFilter,
  ) => void;

  @Prop() page!: number;
  @Prop() created!: boolean;
  @Prop() keywords!: string;

  @Watch('page')
  @Watch('created')
  @Watch('keywords')
  onChange() {
    this.fetch();
  }

  page_size = 10;

  mounted() {
    this.fetch();
  }

  fetch() {
    const { page, page_size, keywords, created } = this;
    this.queryList({ page: page - 1, page_size, keywords, created });
  }

  onClickRow(row: Project) {
    this.$router.push(`/project/${row.id}`);
  }

  onPageChange(page: number) {
    const { keywords, created } = this;
    let query: any = { page };
    if (keywords) {
      query.keywords = keywords;
    }
    if (created) {
      query.created = 'true';
    }
    this.$router.push({
      query,
    });
  }

  onFilterKeywords(keywords: string) {
    this.$router.push({
      query: {
        keywords,
      },
    });
  }

  onFilterCreated(created: boolean) {
    this.$router.push({
      query: {
        created: created ? 'true' : 'false',
      },
    });
  }
}
</script>

<style lang="less" scoped>
.title {
  font-weight: 700;
  line-height: 24px;
}
.table {
  margin-bottom: 20px;
}
.button {
  margin-right: 6px;
}
.input {
  width: 150px;
  margin-left: 10px;
  vertical-align: middle;
}
</style>
