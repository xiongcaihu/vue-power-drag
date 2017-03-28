<template>
    <div id="demo">
        <div class="head">
            <span @click="addChart()">Add Chart</span>
            <span @click="addItemBox()">Add Item Box</span>
        </div>
        <cy-gridster ref="cyGridster" :your-list="myList" :base-width="100" :base-height="100" :drag-start="dragStart" :dragging="dragging"
            :drag-end="dragEnd" :resize-start="resizeStart" :resizing="resizing" :resize-end="resizeEnd">
            <template v-for="(item,index) in myList" :slot="'slot'+index">
                <div class="dragHandle">
                    <div class="tool">
                        <span @click="deleteItem(index)">Delete This Item</span>
                    </div>
                    <div class="chart" :ref="'chart'+index"></div>
                </div>
            </template>
        </cy-gridster>
    </div>
</template>

<script>
    var Highcharts = require('highcharts');

    let chartInstanceBox = {} //乘装highchart实例的对象

    // 在 Highcharts 加载之后加载功能模块
    // require('highcharts/modules/exporting')(Highcharts);

    import drag from './components/vueGridster/drag.vue';
    import mock from "mockjs"
    import _ from "lodash";

    export default {
        data() {
            let list = mock.mock({
                "myList|1-3": [{
                    "id|+1": 1,
                    x: 1,
                    y: 1,
                    sizex: 6,
                    sizey: 6,
                }, {
                    "id|+1": 3,
                    x: 7,
                    y: 1,
                    sizex: 6,
                    sizey: 3,
                }, {
                    "id|+1": 4,
                    x: 7,
                    y: 1,
                    sizex: 6,
                    sizey: 3,
                }]
            })
            return {
                myList: list.myList,
            }
        },
        components: {
            'cy-gridster': drag
        },
        name: 'app',
        methods: {
            addChart() {
                let vm = this;
                let gridster = this.$refs['cyGridster']; //获取gridster实例

                gridster.addItemBox({
                    id: 1111,
                    x: 1,
                    y: 1,
                    sizex: 6,
                    sizey: 2
                })

                gridster.$nextTick(function () {
                    //调用addItemBox后，会在this.myList中增加一个item，而增加的位置，每次都是最后
                    let chart=new Highcharts.chart(vm.$refs['chart' + (vm.myList.length - 1)][0], mock.mock({
                        chart:{
                            'type|1':['line','spline','column']
                        },
                        title:{
                            align:'left',
                            text:'@title(2,3)'
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            'data|1-10': ['@integer(1,100)']
                        }]
                    }));

                    chartInstanceBox['chart'+(vm.myList.length-1)]=chart;
                })
            },
            addItemBox() {
                let gridster = this.$refs['cyGridster']; //获取gridster实例

                gridster.addItemBox({
                    id: 1111,
                    x: 1,
                    y: 1,
                    sizex: 6,
                    sizey: 2
                })
            },
            deleteItem(index) {
                let gridster = this.$refs['cyGridster']; //获取gridster实例

                gridster.removeItem(index); //此时会在this.myList的index位置将item置为{}，目的是为了不让vue重新渲染整个v-for。
            },
            /**
                e:事件对象
                item：拖动对象
                index：拖动对象下标
             */
            dragStart(e, item, index) {
            },
            dragging(e, item, index) {
            },
            dragEnd(e, item, index) {
            },
            resizeStart(e, item, index) {
            },
            resizing(e, item, index) {
            },
            resizeEnd(e, item, index) {
                chartInstanceBox['chart'+index].reflow();        
            }
        },
        mounted() {
            let vm = this;

            let gridster = vm.$refs['cyGridster']; //获取gridster实例
            gridster.afterInitOk(function () {
                _.forEach(vm.myList, function (item, index) {
                    let chartNode = vm.$refs['chart' + index][0];
                    // 创建图表
                    let chart = new Highcharts.chart(chartNode, mock.mock({
                        chart: {
                            "type|1": ['bar', 'column', 'line', 'spline']
                        },
                        title: {
                            align: 'left',
                            text: '@title(1,3)'
                        },
                        plotOptions: {
                            line: {
                                marker: {
                                    enabled: false
                                }
                            }
                        },
                        xAxis: {
                            "categories|5": ['@city()']
                        },
                        credits: {
                            enabled: false
                        },
                        "series|1-3": [{
                            "name": '@region()',
                            "data|5": ['@integer(1,100)']
                        }]
                    }));

                    chartInstanceBox['chart' + index] = chart;
                });
            })
        }
    }

</script>

<style lang='less'>
    body {
        overflow-x: hidden;
        & * {
            box-sizing: border-box;
        }
    }

    #demo {
        width: 100%;
        padding: 1.5rem 1.5rem 1.5rem 0;

        .head {
            position: absolute;
            left: .5rem;
            top: 1rem;
            z-index:9;

            span {
                cursor: pointer;
                font-weight: bold;
                margin-left: 1rem;
            }
        }
    }

    //拖动布局容器样式
    .dragAndResize {
        width: e('calc(100% - 1.5rem)');
        //布局框样式
        .item {}
        
        .dragHandle {
            //拖动手柄样式
            padding: 1.5rem!important;
            height: 100%; //自定义内容样式
            .tool {
                position: absolute;
                right: .5rem;
                top: .5rem;
                cursor: pointer;
                font-weight: bold;
            }

            .chart {
                width: 100%;
                height: 100%;
                overflow: hidden;
                cursor: default;
            }
        }
    }

</style>
