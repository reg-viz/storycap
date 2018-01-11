import { configure, addDecorator } from '@storybook/vue';
import { initScreenshot } from '../../../lib/';

import Vue from 'vue'
import Vuex from 'vuex'

import MyButton from '../src/stories/Button.vue'

Vue.component('my-button', MyButton)
Vue.use(Vuex)

addDecorator(initScreenshot());

configure(() => {
  require('../src/stories');
}, module);
