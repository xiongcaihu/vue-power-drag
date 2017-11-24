<template>
    <div class="test">
        <power-drag ref="cyGridster" :your-list="myList" :base-margin-left="baseMarginLeft" :base-margin-top="baseMarginTop" :base-width="baseWidth"
            :base-height="baseHeight">
        </power-drag>
    </div>
</template>
<script>
    import drag from 'vue-power-drag';
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
