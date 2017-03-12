import _ from "lodash"
import $ from "jquery"

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
            // positionBox: [],
            containerY: 0,
            containerX: 0,
        }
    },
    computed: {

    },
    methods: {
        /**
         * 统一填充positionBox
         * 
         * @param {any} row
         * @param {any} cell
        
         */
        fillEmptyPositionBox(row, cell) {
            for (let i = 0; i <= row; i++) {
                if (this.positionBox[i] == null) {
                    let cells = parseInt(this.$refs['container'].offsetWidth / this.cellWidth);
                    let array = [];

                    for (let j = 0; j < cells; j++) {
                        array.push({
                            index: -1
                        })
                    }

                    this.positionBox.push(array);
                }
                for (let j = 0; j < cell; j++) {
                    if (this.positionBox[i][j] == null) {
                        this.positionBox[i].push({
                            index: -1
                        })
                    }
                }
            }
        },
        getPositionBoxIndex(row, cell) {
            if (this.positionBox[row] == null) {
                this.fillEmptyPositionBox(row, cell);
            }
            if (this.positionBox[row][cell] == null) {
                this.fillEmptyPositionBox(j, i);
            }
            return _.get(this.positionBox, "[" + row + "][" + cell + "].index");
        },
        startResize(e, item, index) {
            e.preventDefault();
            let target = $(e.target);

            if (!this.infoBox) {
                this.infoBox = {}
            }

            let itemNode = target.parents(".item");

            this.infoBox.resizeItem = item;
            this.infoBox.resizeItemIndex = index;
        },
        containerMouseDown(e) {
            e.preventDefault();
            if (!this.infoBox) {
                this.infoBox = {}
            }

            this.infoBox.startX = e.clientX;
            this.infoBox.startY = e.clientY;
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

                this.customMoveItem(moveItem, nowItemIndex, {
                    x: parseInt(oldX + nowX),
                    y: parseInt(oldY + nowY)
                })

                cloneItem.css({
                    left: orignX + moveXSize + 'px',
                    top: orignY + moveYSize + 'px'
                })
            }
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
        init() {
            let vm = this;

            console.log(JSON.stringify(_.cloneDeep(this.list)))

            this.resetPositionBox();

            _.forEach(this.list, function (item, index) {
                item._dragId = index;
                vm.moveItem(item, index);
            })

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
            for (let i = 0; i < rows; i++) {
                let row = [];

                for (let j = 0; j < cells; j++) {
                    row.push({
                        index: -1
                    })
                }

                this.positionBox.push(row);
            }
        },
        /**
         * 删除元素
         * 
         * @param {any} item 
         */
        removeItem(item, index) {
            this.fillPositionBox(item, "remove", index);
            let cloneItem = _.cloneDeep(item);
            this.list.splice(index, 1);

            let goUpItems = {};
            this.collectNeedMoveUpItems(cloneItem, goUpItems);

            this.moveItemsUp(goUpItems);
        },
        resizeItem(item, index, size) {
            this.fillPositionBox(item, "remove", index);

            //记录移动前该元素下的关联元素
            let goUpItems = {};
            this.collectNeedMoveUpItems(item, goUpItems);

            this.moveItemsUp(goUpItems);

            item.sizex = size.sizex;
            item.sizey = size.sizey;

            this.moveItem(item, index);
        },
        customMoveItem(item, index, position) {
            let cells = parseInt(this.$refs['container'].offsetWidth / this.cellWidth);
            if (position) {
                if (position.x < 1 || position.y < 1 || position.x+item.sizex>=cells+2) {
                    return;
                }
            }
            this.fillPositionBox(item, "remove", index);

            //记录移动前该元素下的关联元素
            let goUpItems = {};
            this.collectNeedMoveUpItems(item, goUpItems);

            this.moveItemsUp(goUpItems);

            this.moveItem(item, index, position);

        },
        /**
         * 移动元素到新的位置，前提是item并未在positionBox填充值
         * 
         * @param {any} item
         * @param {any} index
         */
        moveItem(item, index, position) {
            position = position || {};

            item.x = position.x || item.x;
            item.y = position.y || item.y;

            this.adjustPosition(item, index);
        },
        /**
         * 调整位置
         * 
         * @param {any} item
         * @param {any} index
         */
        adjustPosition(item, index) {
            let overlay = this.checkOverLay(item);
            if (overlay) {
                this.fixOverLay(item);
            } else {
                this.floatItem(item);
            }
        },
        /**
         * 添加元素
         * 
         * @param {any} item 
         */
        addItem(item) {
            this.list.push(item);
            item._dragId = this.list.length - 1;

            this.moveItem(item, item._dragId);
        },
        /**
         * 解决重叠
         * 
         * @param {any} item 
         */
        fixOverLay(item) {
            let goDownItems = {};
            let maxMoveY = 0;
            let vm = this;
            //寻找重叠的元素
            for (let j = item.y - 1; j < item.y - 1 + item.sizey; j++) {
                for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                    // let itemIndex = this.positionBox[j][i].index;
                    let itemIndex = this.getPositionBoxIndex(j, i);
                    if (itemIndex != -1) {
                        let targetItem = this.list[itemIndex];

                        let moveY = item.y - targetItem.y + item.sizey;
                        if (moveY > maxMoveY) {
                            maxMoveY = moveY;
                        }
                        goDownItems['item' + itemIndex] = itemIndex;
                        this.collectNeedMoveDownItems(targetItem, goDownItems);
                    }
                }
            }
            _.forEach(goDownItems, function (value, key) {
                let itemIndex = key.split("item")[1];
                let tempItem = vm.list[itemIndex];

                vm.fillPositionBox(tempItem, "remove", itemIndex);
            })

            this.floatItem(item);

            _.forEach(goDownItems, function (value, key) {
                let itemIndex = key.split("item")[1];
                let tempItem = vm.list[itemIndex];

                vm.moveItem(tempItem, itemIndex, {
                    y: tempItem.y + maxMoveY
                })
            })
        },
        /**
         * 统计需要下移的元素（递归）
         * 
         * @param {any} item 
         * @param {any} array 
         */
        collectNeedMoveDownItems(item, goDownItems) {
            for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                let j = item.y + item.sizey - 1;
                // let itemIndex = this.positionBox[j][i].index;
                let itemIndex = this.getPositionBoxIndex(j, i);
                let targetItem = this.list[itemIndex];
                if (itemIndex != -1) {
                    goDownItems['item' + itemIndex] = 1;
                    this.collectNeedMoveDownItems(targetItem, goDownItems);
                }
            }
        },
        collectNeedMoveUpItems(item, goUpItems) {
            this.collectNeedMoveDownItems(item, goUpItems);
        },
        /**
         * 移动需要下移的所有元素
         * 
         * @param {any} items 
         * @param {any} moveSize 移动的距离
         */
        moveItemsDown(items, moveSize) {
            let vm = this;

        },
        moveItemsUp(items) {
            let vm = this;

            let arrayOfItems = [];

            _.forEach(items, function (value, key) {
                let itemIndex = key.split("item")[1];
                let item = vm.list[itemIndex];
                arrayOfItems.push(item);
            })

            arrayOfItems = _.sortBy(arrayOfItems, ["y"]);

            _.forEach(arrayOfItems, function (item) {
                vm.floatItem(item);
            })
        },
        itemMoveAnimate(item, index, y) {
            let vm = this;
            let itemNode = this.$refs['item' + index];
            if (itemNode) {
                $(itemNode[0]).animate({
                    left: (vm.cellWidth * (item.x - 1) + vm.baseMarginLeft) + 'px',
                    top: (vm.cellHeight * (y - 1) + vm.baseMarginTop) + 'px'
                }, 30, "linear", function () {
                    item.y = y;
                });
            } else {
                item.y = y;
            }
        },
        /**
         * 上浮此元素
         * 
         * @param {any} item 
         */
        floatItem(item) {
            this.fillPositionBox(item, "remove", item._dragId);

            for (let y = item.y - 2; y >= 0; y--) {
                for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                    // if (this.positionBox[y][i].index != -1) {
                    if (this.getPositionBoxIndex(y, i) != -1) {
                        item.y = y + 2;
                        this.fillPositionBox(item, "add", item._dragId);
                        return;
                    }
                }
            }

            item.y = 1;
            this.fillPositionBox(item, "add", item._dragId);
        },
        /**
         * 检查增加的位置是否有重叠
         * 
         * @param {any} item 
         */
        checkOverLay(item) {
            for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                for (let j = item.y - 1; j < item.y - 1 + item.sizey; j++) {
                    // if (this.positionBox[j][i].index != -1) {
                    if (this.getPositionBoxIndex(j, i) != -1) {
                        return true;
                    }
                }
            }
            return false;
        },
        /**
         * 填充位置盒子
         * 
         * @param {any} item 
         */
        fillPositionBox(item, type, index) {
            for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                for (let j = item.y - 1; j < item.y - 1 + item.sizey; j++) {
                    if (this.positionBox[j] == null) {
                        this.fillEmptyPositionBox(j, i);
                    }
                    if (this.positionBox[j][i] == null) {
                        this.fillEmptyPositionBox(j, i);
                    }
                    this.positionBox[j][i].index = type == "add" ? index : -1;
                }
            }
        }
    },
    created() {
        this.cellWidth = this.baseWidth + this.baseMarginLeft;
        this.cellHeight = this.baseHeight + this.baseMarginTop;

        this.positionBox = [];
    },
    mounted() {
        this.init();

        this.containerX = $(this.$el).position().left;
        this.containerY = $(this.$el).position().top;
    }
}
