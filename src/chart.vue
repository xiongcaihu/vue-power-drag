<template>
    <div id="chartVue">
        <div class="head">
            <b><router-link to="/" class="arrow">&larr;</router-link></b>
            <span>嵌入100个highchart实例的例子</span>
            <b @click="addChart()">增加一个highchart实例框</b>
            <b @click="addItemBox()">增加一个无内容框</b>
        </div>
        <power-drag ref="cyGridster" :your-list="myList" :base-margin-left="baseMarginLeft" :base-margin-top="baseMarginTop" :base-width="baseWidth"
            :base-height="baseHeight" :drag-start="dragStart" :dragging="dragging" :drag-end="dragEnd" :resize-start="resizeStart"
            :resizing="resizing" :resize-end="resizeEnd">
            <template v-for="(item,index) in myList" :slot="'slot'+index">
                <div class="dragHandle">
                    <div class="tool">
                        <span @click="deleteItem(index)">删除此框</span>
                    </div>
                    <div class="chart" :ref="'chart'+index"></div>
                </div>
            </template>
        </power-drag>
    </div>
</template>

<script>
    var Highcharts = require('highcharts');

    let chartInstanceBox = {} //乘装highchart实例的对象

    // 在 Highcharts 加载之后加载功能模块
    // require('highcharts/modules/exporting')(Highcharts);

    import drag from './components/drag/drag.vue';
    import mock from "mockjs"
    import _ from "lodash";

    export default {
        data() {
            let list = mock.mock({
                "myList|10-20": [{
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
                baseWidth: 0,
                baseHeight: 0
            }
        },
        components: {
            'power-drag': drag
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
                    let chart = new Highcharts.chart(vm.$refs['chart' + (vm.myList.length - 1)][0], mock.mock({
                        chart: {
                            'type|1': ['line', 'spline', 'column']
                        },
                        title: {
                            align: 'left',
                            text: '@title(2,3)'
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            'data|1-10': ['@integer(1,100)']
                        }]
                    }));

                    chartInstanceBox['chart' + (vm.myList.length - 1)] = chart;
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
                //注意，这里删除布局框并不会删除里面的组件，组件需要自己用v-if来控制销毁，如果是highchart，必须手动调用chartInstance.$destroy()
            },
            /**
                e:事件对象
                item：拖动对象
                index：拖动对象下标
             */
            dragStart(e, item, index) {},
            dragging(e, item, index) {},
            dragEnd(e, item, index) {},
            resizeStart(e, item, index) {},
            resizing(e, item, index) {},
            resizeEnd(e, item, index) {
                chartInstanceBox['chart' + index].reflow();
            }
        },
        created() {
            //屏幕适配，使得当前布局能在所有分辨率下适用，示例是在1366*638分辨率下完成
            let screenWidth = window.innerWidth;
            let screenHeight = window.innerHeight;
            this.baseWidth = 90.8333 * (screenWidth / 1366);
            this.baseHeight = 100 * (screenHeight / 638);
            this.baseMarginLeft = 20 * (screenWidth / 1366);
            this.baseMarginTop = 20 * (screenHeight / 638);

            this.$nextTick(function () {
                $(".dragAndResize").css("width", "calc(100% - " + (this.baseMarginLeft) + "px)")
            })
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

            gridster.init();
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

    a {
        text-decoration: none;
        color: black;
    }

    #chartVue {
        width: 100%;
        padding: 1.5em 0 1.5em 0;
        .head {
            height:50px;
            border-bottom:1px dashed;

            b {
                cursor: pointer;
                font-weight: bold;
                margin-left: 1rem;
            }

            .arrow {
                font-size: 20px;

                position: relative;
                top: 2px;
                margin-right:10px;
            }
        } //拖动布局容器样式
        .dragAndResize {
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
    }

</style>
