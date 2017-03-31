<template>
    <div id="demo">
        <!-- <button @click="getList">getList</button> -->
        <div class="head">
            <router-link to="/" class="arrow">&larr;</router-link>
            <span>基本应用</span>
        </div>
        <power-drag ref="cyGridster" :your-list="myList" :base-margin-left="baseMarginLeft" :base-margin-top="baseMarginTop" :base-width="baseWidth"
            :base-height="baseHeight">
            <!-- <div v-for="(item,index) in myList" :slot="'slot'+index">
            
            </div> -->
        </power-drag>
    </div>
</template>

<script>
    import drag from './components/drag/drag.vue';
    import mock from "mockjs"
    import _ from "lodash";

    export default {
        data() {
            let list = mock.mock({
                // "myList|10": [{
                //     "id|+1": 1,
                //     x: '@integer(1,5)',
                //     y: '@integer(1,5)',
                //     sizex: '@integer(1,3)',
                //     sizey: '@integer(1,3)',
                // }]
                myList: [{
                    "id": 1,
                    "x": 10,
                    "y": 1,
                    "sizex": 3,
                    "sizey": 2
                }, {
                    "id": 2,
                    "x": 8,
                    "y": 1,
                    "sizex": 2,
                    "sizey": 2
                }, {
                    "id": 4,
                    "x": 1,
                    "y": 1,
                    "sizex": 1,
                    "sizey": 1
                }, {
                    "id": 6,
                    "x": 4,
                    "y": 1,
                    "sizex": 2,
                    "sizey": 1
                }, {
                    "id": 8,
                    "x": 6,
                    "y": 1,
                    "sizex": 2,
                    "sizey": 1
                }, {
                    "id": 10,
                    "x": 2,
                    "y": 1,
                    "sizex": 2,
                    "sizey": 2
                }, {
                    "id": 3,
                    "x": 6,
                    "y": 2,
                    "sizex": 1,
                    "sizey": 1
                }, {
                    "id": 5,
                    "x": 4,
                    "y": 2,
                    "sizex": 2,
                    "sizey": 1
                }, {
                    "id": 7,
                    "x": 1,
                    "y": 2,
                    "sizex": 1,
                    "sizey": 1
                }, {
                    "id": 9,
                    "x": 7,
                    "y": 2,
                    "sizex": 1,
                    "sizey": 1
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
            getList() {
                let gridster = this.$refs['cyGridster']; //获取gridster实例
                console.log(JSON.stringify(gridster.getList()));
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
            let gridster = this.$refs['cyGridster']; //获取gridster实例
            gridster.init(); //在适当的时候初始化布局组件
        }
    }

</script>

<style lang='less' scoped>
    body {
        overflow-x: hidden;
        & * {
            box-sizing: border-box;
        }
    }

    #demo {
        width: 100%;
        padding: 1.5em 0 1.5em 0;

        .head {
            border-bottom: 1px dashed;
            width: 100%;

            padding-left: 20px;

            height: 50px;

            a {
                text-decoration: none;
                color: black;
            }
        }

        .arrow {
            font-size: 20px;

            position: relative;
            margin-right:10px;
            top:2px;
        }
    }

</style>
