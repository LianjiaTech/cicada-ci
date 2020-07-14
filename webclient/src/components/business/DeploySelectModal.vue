<template>
  <Modal :value="isShow" title="选择发布方式" @on-ok="onOk" @on-visible-change="onVisibleChange">
    <RadioGroup v-model="deployType" class="modal-tab" @on-change="onChangeTab">
      <Radio label="default">
        默认发布
        <HelpTip message="默认发布将依次对所有符合分支过滤条件的发布器" />
      </Radio>
      <Radio label="select">指定发布器</Radio>
    </RadioGroup>
    <div v-if="deployType === 'default'">
      <Row>
        <Col span="3">构建分支:</Col>
        <Col span="7">{{ buildRecord.branch }}</Col>
      </Row>
      <Row v-for="(deployer, index) in deployers" :key="deployer.id">
        <Col span="3">发布器:</Col>
        <Col span="4" class="nowrap">{{ deployer.name }}</Col>
        <Col span="3">限定分支:</Col>
        <Col span="3">{{ deployer.branch_filter || '无' }}</Col>
        <Col span="3">
          <Icon
            size="24"
            class="icon-deploy-mark"
            :class="deployerMatched[index] ? 'matched' : 'unmatched'"
            :type="deployerMatched[index] ? 'ios-checkmark' : 'ios-close'"
          />
        </Col>
      </Row>
    </div>
    <div v-if="deployType === 'select'">
      <Select style="width:150px;margin-top:10px;" v-model="selectedDeployerId">
        <Option
          v-for="item in deployers"
          :key="item.id"
          :value="item.id"
          :label="item.name"
        >{{ item.name }}</Option>
      </Select>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import {
  Modal,
  RadioGroup,
  Radio,
  Row,
  Col,
  Icon,
  Select,
  Option,
} from 'iview';
import { Deployer } from '../../types/deployer';
import { BuildRecord } from '../../types/build-record';
import HelpTip from '../common/HelpTip.vue';

@Component({
  components: {
    HelpTip,
    Modal,
    RadioGroup,
    Radio,
    Row,
    Col,
    Icon,
    Select,
    Option,
  },
})
export default class DeploySelectModal extends Vue {
  @Prop({ default: false }) isShow!: boolean;
  @Prop({ default: () => [] }) deployers!: Deployer[];
  @Prop({ default: null }) buildRecord!: BuildRecord;

  @Watch('deployers')
  onDeployersChange(val: Deployer[]) {
    if (val.length) {
      this.selectedDeployerId = val[0].id;
      this.checkDeployerMatched();
    }
  }

  @Watch('buildRecord')
  onBuildRecordChange(val: BuildRecord) {
    if (val) {
      this.checkDeployerMatched();
    }
  }

  deployType: 'default' | 'select' = 'default';

  selectedDeployerId: number = 0;

  deployerMatched: boolean[] = [];
  selectedDeployers: Deployer[] = [];

  checkDeployerMatched() {
    if (!this.deployers.length || !this.buildRecord) {
      return;
    }
    this.deployerMatched = this.deployers.map(
      ({ branch_filter }) =>
        !branch_filter ||
        branch_filter.split(',').includes(this.buildRecord.branch),
    );
  }

  onChangeTab() {
    if (this.deployType === 'select') {
      this.selectedDeployerId = this.deployers[0].id;
    }
  }

  updateSelectedDeployers() {
    if (this.deployType === 'select') {
      this.selectedDeployers = this.deployers.filter(
        deployer => deployer.id === this.selectedDeployerId,
      );
    } else {
      this.selectedDeployers = this.deployers.filter(
        (deployer, index) => this.deployerMatched[index],
      );
    }
  }

  onOk() {
    this.updateSelectedDeployers();
    this.$emit('on-ok', this.selectedDeployers);
  }

  onVisibleChange(visible: boolean) {
    this.$emit('on-visible-change', visible);
  }
}
</script>

<style scoped>
.icon-deploy-mark {
  line-height: 20px;
}
.matched {
  color: darkcyan;
}
.unmatched {
  color: brown;
}
.nowrap {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.modal-tab {
  margin-bottom: 10px;
}
</style>
