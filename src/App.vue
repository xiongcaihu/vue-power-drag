<template>
    <div id="app">
        <button @click="pirntList()">print list</button>
        <drag :your-list="myList" :baseWidth="10" :baseHeight="5">
            <div class="chart" v-for="(item,index) in myList" :slot="'slot'+index" :ref="'chart'+index">
                {{item.id}}
            </div>
        </drag>
    </div>
</template>

<script>
    var Highcharts = require('highcharts');

    // 在 Highcharts 加载之后加载功能模块
    require('highcharts/modules/exporting')(Highcharts);

    import drag from './components/drag4/drag.vue';
    import mock from "mockjs"

    export default {
        data() {
            let list = mock.mock({
                "myList|100": [{
                    "id|+1": 1,
                    "text|+1": 1,
                    x: "@integer(1,5)",
                    y: "@integer(1,5)",
                    sizex: "@integer(10,10)",
                    sizey: "@integer(10,10)",
                }]
            })
            return {
                myList: list.myList,
                // myList: [
                //     {
                //     id: 1,
                //     x: 1,
                //     y: 1,
                //     sizex: 1,
                //     sizey: 1
                // }, {
                //     id: 2,
                //     x: 1,
                //     y: 2,
                //     sizex: 1,
                //     sizey: 1
                // }, 
                // ]
                // myList: [{
                //     "id": 1,
                //     "text": 1,
                //     "x": 2,
                //     "y": 2,
                //     "sizex": 2,
                //     "sizey": 2
                // }, {
                //     "id": 2,
                //     "text": 2,
                //     "x": 4,
                //     "y": 4,
                //     "sizex": 1,
                //     "sizey": 2
                // }, {
                //     "id": 3,
                //     "text": 3,
                //     "x": 4,
                //     "y": 3,
                //     "sizex": 2,
                //     "sizey": 2
                // }, {
                //     "id": 4,
                //     "text": 4,
                //     "x": 3,
                //     "y": 2,
                //     "sizex": 2,
                //     "sizey": 1
                // }, {
                //     "id": 5,
                //     "text": 5,
                //     "x": 3,
                //     "y": 3,
                //     "sizex": 2,
                //     "sizey": 2
                // }]
                // myList:[
                //     {
                //         id:1,
                //         x:1,
                //         y:3,
                //         sizex:1,
                //         sizey:1
                //     },
                //     {
                //         id:2,
                //         x:1,
                //         y:1,
                //         sizex:1,
                //         sizey:2
                //     },
                //     {
                //         id:3,
                //         x:1,
                //         y:1,
                //         sizex:1,
                //         sizey:3
                //     },
                // ]
            }
        },
        components: {
            "drag": drag
        },
        name: 'app',
        methods: {
            pirntList() {
                console.dir(JSON.stringify(_.sortBy(this.myList, ['y'])));
            }
        },
        mounted() {
            return;
            let vm = this;
            this.$nextTick(function () {
                _.forEach(this.myList, function (item, index) {
                    let chartNode = vm.$refs['chart' + index][0];
                    // 创建图表
                    Highcharts.chart(chartNode, {
                        chart: {
                            type: 'bar'
                        },
                        title: {
                            text: '堆叠条形图'
                        },
                        xAxis: {
                            categories: ['苹果', '橘子', '梨', '葡萄', '香蕉']
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: '总的水果消费'
                            }
                        },
                        legend: {
                            reversed: true
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
                        series: [{
                            name: '小张',
                            data: [5, 3, 4, 7, 2]
                        }, {
                            name: '小彭',
                            data: [2, 2, 3, 2, 1]
                        }, {
                            name: '小潘',
                            data: [3, 4, 4, 2, 5]
                        }]
                    });
                })
            })
        }
    }

</script>

<style>
    .chart {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

</style>
