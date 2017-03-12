import _ from "lodash"
import $ from "jquery"

import mock from "mockjs"

// let positionBox={};

export default {
    props: {
        list: {
            required: true,
            type: Array //String,Number,Boolean,Function,Object,Array
        },
        baseWidth: {
            required: false,
            type: Number,
            default: 100
        },
        baseHeight: {
            required: false,
            type: Number,
            default: 50
        },
        baseMarginLeft: {
            required: false,
            type: Number,
            default: 20
        },
        baseMarginTop: {
            required: false,
            type: Number,
            default: 20
        },
    },
    data() {
        return {
            renderOk: false,
            cellWidth: 0,
            cellHeight: 0,
            positionBox: {},
            containerY: 0,
            containerX: 0,
        }
    },
    computed: {

    },
    methods: {
        calcMoveSize(item, position) {
            let vm = this;
            let relativeItem = undefined;
            for (let key in position) {
                let index = this.positionBox[key];
                if (index != item._dragId) {
                    relativeItem = this.list[index];
                    break;
                }
            }

            if (relativeItem == undefined) {
                return 1;
            } else {
                return relativeItem.y + relativeItem.sizey - item.y;
            }

        },
        fillItemAround(item) {
            let position = {};
            console.log("开始填充---%d-----", item._dragId)

            //最上边
            for (let i = item.x; i < item.x + item.sizex; i++) {
                let j = item.y,
                    key = j + '-' + i;
                this.$set(this.positionBox, key, item._dragId);
                position[key] = 1;
            }

            //最下边
            for (let i = item.x; i < item.x + item.sizex; i++) {
                let j = item.y + item.sizey - 1,
                    key = j + '-' + i;
                this.$set(this.positionBox, key, item._dragId);
                position[key] = 1;
            }
            //最左边
            for (let i = item.y + 1; i < item.y + item.sizey; i++) {
                let j = item.x,
                    key = i + '-' + j;
                this.$set(this.positionBox, key, item._dragId);
                position[key] = 1;
            }
            //最右边
            for (let i = item.y + 1; i < item.y + item.sizey; i++) {
                let j = item.x + item.sizex - 1,
                    key = i + '-' + j;
                this.$set(this.positionBox, key, item._dragId);
                position[key] = 1;
            }

            return position;
        },
        /**
         * 计算当前item的位置和大小
         * 
         * @param {any} item 
         * @returns 
         */
        nowItemStyle(item, index) {
            return {
                width: (this.cellWidth * (item.sizex) - this.baseMarginLeft) + 'px',
                height: (this.cellHeight * (item.sizey) - this.baseMarginTop) + 'px',
                left: (this.cellWidth * (item.x - 1) + this.baseMarginLeft) + 'px',
                top: (this.cellHeight * (item.y - 1) + this.baseMarginTop) + 'px'
            }
        },
        /**
         * 对每个item进行监听
         * 
         * @param {any} item
         */
        watchItem(item) {
            let vm = this;
            //监听自己范围内的所有方块儿
            let position = this.fillItemAround(item);

            console.log("---开始监听---id=%d", item._dragId);
            // console.dir(position);

            let unwatch = this.$watch(function () {
                let info = {
                    item: this.list[item._dragId],
                    itemx: item.x,
                    itemy: item.y,
                    itemSizex: item.sizex,
                    itemSizey: item.sizey,
                    aroundPosition: {},
                    floatSpace: this.checkFloatSpace(item)
                }
                _.forEach(position, function (value, key) {
                    info.aroundPosition[key] = vm.positionBox[key];
                })

                return info;
            }, function (newVal, oldVal) { //监控回调
                let nowItem = newVal.item;
                console.log("float space = %d", newVal.floatSpace);
                if (newVal.floatSpace > 0) {
                    unwatch();
                    _.forEach(position, function (v, key) {
                        let value = vm.positionBox[key];
                        if (value == nowItem._dragId) {
                            vm.$delete(vm.positionBox, key);
                        }
                    })
                    if (nowItem.y - newVal.floatSpace < 1) {
                        nowItem.y = 1;
                    } else {
                        nowItem.y -= newVal.floatSpace;
                    }
                    this.watchItem(nowItem);
                } else if (_.isEmpty(oldVal)) {
                    return;
                } else if (!_.isEqual(newVal.aroundPosition, oldVal.aroundPosition)) {
                    console.log("id=%d can move", nowItem._dragId);
                    unwatch();
                    _.forEach(position, function (v, key) {
                        let value = vm.positionBox[key];
                        if (value == nowItem._dragId) {
                            vm.$delete(vm.positionBox, key);
                        }
                    })
                    //计算被入侵了多少
                    let moveSize = this.calcMoveSize(item, position);
                    nowItem.y += moveSize;
                    // this.fillItemAround(nowItem);
                    this.watchItem(nowItem);
                } else if (newVal.itemx != oldVal.itemx || newVal.itemy != oldVal.itemy) { //表示移动了
                    console.log("id=%d move", nowItem._dragId);
                    unwatch();
                    _.forEach(position, function (v, key) {
                        let value = vm.positionBox[key];
                        if (value == nowItem._dragId) {
                            vm.$delete(vm.positionBox, key);
                        }
                    })
                    this.watchItem(nowItem);
                }
            }, {
                immediate: false,
                deep: true
            });
        },
        init() {
            let vm = this;

            console.log(JSON.stringify(_.cloneDeep(this.list)))

            this.resetPositionBox();

            _.forEach(this.list, function (item, index) {
                item._dragId = index;
                vm.addItem(item);
                // vm.moveItem(item, index);
            })

            // setTimeout(function () {
            //     vm.moveItem(vm.list[0],{
            //         x:2,
            //         y:1
            //     })
            // }, 1000);
            // let i = 0;
            // let length = this.list.length;
            // let timeid = setInterval(function () {
            //     if (i >= length) {
            //         clearInterval(timeid);
            //     } else {
            //         let item = vm.list[i];
            //         item._dragId = i;
            //         vm.addItem(item);
            //         i++;
            //     }
            // }, 1);

            vm.renderOk = true;
        },
        /**
         * 重置位置盒子
         * 
         */
        resetPositionBox() {
            //根据当前容器的宽度来决定多少列
            let cells = parseInt(this.$refs['container'].offsetWidth / this.cellWidth);
            let rows = 100; //初始100行，后面根据需求会自动增加
            this.positionBox = {}
        },
        /**
         * 检查是否重叠
         * 
         * @param {any} item
         * @returns
         */
        checkOverLay(item) {
            console.log("------------checkOverlay");
            for (let i = item.x; i < item.x + item.sizex; i++) {
                for (let j = item.y; j < item.y + item.sizey; j++) {
                    if (this.positionBox[j + '-' + i] >= 0) {
                        return true;
                    }
                }
            }
            return false;
        },
        moveItem(item, target) {
            if (_.isEmpty(target)) return;
            item.x = target.x || item.x;
            item.y = target.y || item.y;
        },
        addItem(item) {
            let floatSpace = this.checkFloatSpace(item);
            if (floatSpace > 0) {
                if (item.y - floatSpace < 1) {
                    item.y = 1;
                } else {
                    item.y = item.y - floatSpace;
                }
            }
            this.watchItem(item);
            // if (this.checkOverLay(item)) {
            //     console.log("overlay");
            //     let floatSpace=this.checkFloatSpace(item);
            //     console.log("floatSize=%d",floatSpace);
            // } else {
            //     console.log("float");
            //     this.floatItem(item);
            //     this.watchItem(item);
            // }
        },
        checkFloatSpace(item) {
            let floatSize = 0;
            for (let y = item.y - 1; y >= 1; y--) {
                for (let i = item.x; i < item.x + item.sizex; i++) {
                    if (this.positionBox[y + '-' + i] >= 0) {
                        return floatSize;
                    }
                }
                floatSize++;
            }
            return floatSize;
        },
        floatItem(item) {
            for (let y = item.y - 1; y >= 1; y--) {
                for (let i = item.x; i < item.x + item.sizex; i++) {
                    if (this.positionBox[y + '-' + i] >= 0) {
                        item.y = y + 1;
                        return;
                    }
                }
            }
            item.y = 1;
        },
        containerMouseDown(e) {
            e.preventDefault();
            if (!this.infoBox) {
                this.infoBox = {}
            }

            this.infoBox.startX = e.clientX;
            this.infoBox.startY = e.clientY;
        },
        endMove(e) {
            if (this.infoBox.cloneItem) {
                this.infoBox.cloneItem.remove();
            }
            if (this.infoBox.nowItemNode) {
                this.infoBox.nowItemNode.removeClass("movingItem");
            }
            this.infoBox = null;
        },
        moving(e) {
            let moveItem = _.get(this.infoBox, "moveItem");
            let resizeItem = _.get(this.infoBox, "resizeItem");
            if (resizeItem) { //调整大小时
                let nowItemIndex = this.infoBox.resizeItemIndex;
                let cloneItem = this.infoBox.cloneItem;
                let startX = this.infoBox.startX;
                let startY = this.infoBox.startY;
                let orignWidth = this.infoBox.orignWidth;
                let orignHeight = this.infoBox.orignHeight;

                let moveXSize = e.clientX - startX; //X方向移动的距离
                let moveYSize = e.clientY - startY; //Y方向移动的距离

                let nowX = (e.pageX - this.containerX) % this.cellWidth > (this.cellWidth / 4 * 1) ? parseInt(((e.pageX - this.containerX) / this.cellWidth + 1)) : parseInt(((e.pageX - this.containerX) / this.cellWidth));
                let nowY = (e.pageY - this.containerY) % this.cellHeight > (this.cellHeight / 4 * 1) ? parseInt(((e.pageY - this.containerY) / this.cellHeight + 1)) : parseInt(((e.pageY - this.containerY) / this.cellHeight));

                let addSizex = nowX - resizeItem.x - resizeItem.sizex + 1;
                let addSizey = nowY - resizeItem.y - resizeItem.sizey + 1;

                if (Math.abs(addSizex) >= 1 || Math.abs(addSizey) >= 1) {
                    this.resizeItem(resizeItem, nowItemIndex, {
                        sizex: resizeItem.sizex + addSizex,
                        sizey: resizeItem.sizey + addSizey
                    });
                }

                let nowWidth = orignWidth + moveXSize;
                nowWidth = nowWidth <= this.baseWidth ? this.baseWidth : nowWidth;
                let nowHeight = orignHeight + moveYSize;
                nowHeight = nowHeight <= this.baseHeight ? this.baseHeight : nowHeight;
                //克隆元素实时改变大小
                cloneItem.css({
                    width: nowWidth,
                    height: nowHeight
                })
            } else if (moveItem) {
                let nowItemIndex = this.infoBox.moveItemIndex;
                let cloneItem = this.infoBox.cloneItem;
                let startX = this.infoBox.startX;
                let startY = this.infoBox.startY;
                let orignX = this.infoBox.orignX;
                let orignY = this.infoBox.orignY;
                let oldX = this.infoBox.oldX;
                let oldY = this.infoBox.oldY;

                let moveXSize = e.clientX - startX; //X方向移动的距离
                let moveYSize = e.clientY - startY; //Y方向移动的距离

                let nowX = Math.round(moveXSize / this.cellWidth);
                let nowY = Math.round(moveYSize / this.cellHeight);

                this.moveItem(moveItem, {
                    x: parseInt(oldX + nowX),
                    y: parseInt(oldY + nowY)
                })

                cloneItem.css({
                    left: orignX + moveXSize + 'px',
                    top: orignY + moveYSize + 'px'
                })
            }
        },
        startMove(e, item, index) {
            e.preventDefault();
            let target = $(e.target);

            if (!this.infoBox) {
                this.infoBox = {}
            }

            this.infoBox.moveItem = item;
            this.infoBox.moveItemIndex = index;
            this.infoBox.cloneItem = null;
            this.infoBox.nowItemNode = null;

            if (target.attr("class") && target.attr("class").indexOf("item") != -1) {
                this.infoBox.nowItemNode = target;
                this.infoBox.cloneItem = target.clone();
            } else {
                this.infoBox.nowItemNode = target.parents(".item");
                this.infoBox.cloneItem = this.infoBox.nowItemNode.clone();
            }
            this.infoBox.cloneItem.addClass("cloneNode");
            this.infoBox.nowItemNode.addClass("movingItem");

            $(this.$el).append(this.infoBox.cloneItem);

            this.infoBox.orignX = this.infoBox.cloneItem.position().left;
            this.infoBox.orignY = this.infoBox.cloneItem.position().top;
            this.infoBox.oldX = item.x;
            this.infoBox.oldY = item.y;
            this.infoBox.orignWidth = this.infoBox.cloneItem.width();
            this.infoBox.orignHeight = this.infoBox.cloneItem.height();
        },
        startResize(e, item, index) {

        }
    },
    created() {
        this.cellWidth = this.baseWidth + this.baseMarginLeft;
        this.cellHeight = this.baseHeight + this.baseMarginTop;
    },
    mounted() {
        this.init();

        this.containerX = $(this.$el).position().left;
        this.containerY = $(this.$el).position().top;
    }
}
