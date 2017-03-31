// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import index from "./index.vue"
import "normalize.css"

Vue.config.debug = true;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: "<router-view></router-view>",
})
