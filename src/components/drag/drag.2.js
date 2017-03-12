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
            positionBox: [],
            containerY: 0,
            containerX: 0,
        }
    },
    computed: {

    },
    methods: {
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

            this.infoBox = {
                moveItem: item,
                moveItemIndex: index,
                cloneItem: null,
                nowItemNode: null
            }

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
            let nowItem = _.get(this.infoBox, "moveItem");
            if (nowItem) {
                let nowItemIndex = this.infoBox.nowItemIndex;
                let cloneItem = this.infoBox.cloneItem;
                let startX = this.infoBox.startX;
                let startY = this.infoBox.startY;
                let orignX = this.infoBox.orignX;
                let orignY = this.infoBox.orignY;

                let moveXSize = e.clientX - startX; //X方向移动的距离
                let moveYSize = e.clientY - startY; //Y方向移动的距离

                // let targetX = moveXSize % this.cellWidth > (this.cellWidth / 2) ? parseInt((moveSize / this.cellWidth + 1) * this.cellWidth) : parseInt((moveSize / this.cellWidth) * this.cellWidth);
                // let targetY=0;

                let nowX = (e.pageX - this.containerX) % this.cellWidth > (this.cellWidth / 2) ? parseInt(((e.pageX - this.containerX) / this.cellWidth + 1)) : parseInt(((e.pageX - this.containerX) / this.cellWidth));
                let nowY = (e.pageY - this.containerY) % this.cellHeight > (this.cellHeight / 2) ? parseInt(((e.pageY - this.containerY) / this.cellHeight + 1)) : parseInt(((e.pageY - this.containerY) / this.cellHeight));

                console.log("nowX=%d,nowY=%d", nowX, nowY);

                if ((nowX < nowItem.x || nowX > nowItem.x + nowItem.sizex - 1) || (nowY < nowItem.y || nowY > nowItem.y + nowItem.sizey - 1)) {
                    this.customMoveItem(nowItem, nowItemIndex, {
                        x: nowX,
                        y: nowY
                    })
                }

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
        nowItemStyle(item) {
            return {
                width: (this.cellWidth * (item.sizex) - this.baseMarginLeft) + 'px',
                height: (this.cellHeight * (item.sizey) - this.baseMarginTop) + 'px',
                left: (this.cellWidth * (item.x - 1) + this.baseMarginLeft) + 'px',
                top: (this.cellHeight * (item.y - 1) + this.baseMarginTop) + 'px'
            }
        },
        init() {
            let vm = this;

            console.log("-------init");
            console.log(JSON.stringify(this.list));
            console.dir(_.cloneDeep(this.list))

            this.resetPositionBox();

            _.forEach(this.list, function (item, index) {
                item._dragId = index;
                vm.moveItem(item, index);
            })

            console.log("init end ---------")
            console.dir(_.cloneDeep(this.list))
            vm.renderOk = true;

            setTimeout(function () {
                vm.customMoveItem(vm.list[0], 0, {
                    y: 2
                })
            }, 1000);
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
                        index: -1 //对应的元素的索引
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
        customMoveItem(item, index, position) {
            this.fillPositionBox(item, "remove", index);

            //记录移动前该元素下的关联元素
            let goUpItems = {};
            this.collectNeedMoveUpItems(item, goUpItems);

            this.moveItem(item, index, position);

            this.moveItemsUp(goUpItems);
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
                console.log("overlay");
                this.fixOverLay(item);
            } else {
                console.log("float");
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
                    let itemIndex = this.positionBox[j][i].index;
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
            console.log("----godownItems------");
            console.dir(goDownItems);
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
                let itemIndex = this.positionBox[j][i].index;
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
        /**
         * 上浮此元素
         * 
         * @param {any} item 
         */
        floatItem(item) {
            this.fillPositionBox(item, "remove", item._dragId);

            for (let y = item.y - 2; y >= 0; y--) {
                for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                    if (this.positionBox[y][i].index != -1) {
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
                    if (this.positionBox[j][i].index != -1) {
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
                    this.positionBox[j][i].index = type == "add" ? index : -1;
                }
            }
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
