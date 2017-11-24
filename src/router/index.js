import Vue from 'vue'
import Router from 'vue-router'
import index from '../index.vue'
import baseVue from '../base.vue'
import chartVue from '../chart.vue'
import power500 from '../power500.vue'
import power1000 from '../power1000.vue'
import test from '../test.vue'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        component: index
    },{
        path: '/test',
        component: test
    }, {
        path: '/base',
        component: baseVue
    }, {
        path: '/chart',
        component: chartVue
    }, {
        path: '/power500',
        component: power500
    }, {
        path: '/power1000',
        component: power1000
    }]
})
