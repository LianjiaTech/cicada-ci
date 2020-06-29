<template>
  <Tooltip theme="light" :transfer="true" max-width="360" placement="right">
    <p slot="content" v-html="message"></p>
    <span class="tip-title" v-if="title" :class="'tip-type-' + type">{{title}}</span>
    <Icon class="icon-help" v-if="type === 'icon'" type="ios-help-circle-outline" />
  </Tooltip>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class HelpTip extends Vue {
  @Prop({ default: '' }) message!: string;
  @Prop({ default: '' }) title!: string;
  @Prop({ default: 'icon' }) type!: string;
}
</script>

<style less scoped>
.icon-help {
  vertical-align: unset;
}
.tip-type-underline {
  text-decoration: dashed gray underline;
  text-underline-position: under;
}
</style>