import Vue from 'vue'
import Router from 'vue-router'
import my from '../App.vue'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    component: my
  }]
})
