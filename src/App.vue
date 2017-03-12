<template>
    <div id="app">
        <button @click="pirntList()">print list</button>
        <drag :list="myList">
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

    import drag from './components/drag/drag.vue';
    import mock from "mockjs"

    export default {
        data() {
            let list = mock.mock({
                "myList|10": [{
                    "id|+1": 1,
                    "text|+1": 1,
                    x: "@integer(1,5)",
                    y: "@integer(1,5)",
                    sizex: 1,
                    sizey: 1,
                }]
            })
            return {
                myList: list.myList,
            }
        },
        components: {
            "drag": drag
        },
        name: 'app',
        methods:{
            pirntList(){
                console.dir(JSON.stringify(_.sortBy(this.myList,['y'])));
            }
        },
        mounted() {
            // let array=new Array(10);
            // console.dir(array.fill({
            //     index:-1
            // }));
            // console.dir(array);
            let vm = this;
            return;
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
.chart{
    width: 100%;
    height: 100%;
    overflow: hidden;
}

</style>
