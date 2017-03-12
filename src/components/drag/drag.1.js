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
        }
    },
    computed: {

    },
    methods: {
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

            console.log(JSON.stringify(this.list));
            console.dir(_.cloneDeep(this.list))

            this.resetPositionBox();

            _.forEach(this.list, function (item, index) {
                item._dragId = index;
                vm.adjustPosition(item, index);
            })

            console.dir(_.cloneDeep(this.list))
            vm.renderOk = true;
            setTimeout(function () {


                setTimeout(function () {
                    return;
                    vm.addItem({
                        x: 10,
                        y: 2,
                        text: "ok",
                        sizex: 1,
                        sizey: 1
                    })

                    let timeid = setInterval(function () {
                        let item = _.last(vm.list);
                        if (item.x == 1) {
                            clearInterval(timeid);
                        } else {
                            vm.moveItem(item, vm.list.length - 1, {
                                x: item.x - 1
                            })
                        }
                    }, 300);
                }, 1000);
            }, 300);
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
            let cloneItem = _.cloneDeep(item);
            this.list.splice(index, 1);

            let goUpItems = [];
            this.collectNeedMoveUpItems(cloneItem, goUpItems);

            this.moveItemsUp(goUpItems, cloneItem.sizey);

            this.fillPositionBox(cloneItem, "remove", index);
        },
        /**
         * 移动元素
         * 
         * @param {any} item
         * @param {any} index
         */
        moveItem(item, index, position) {
            this.fillPositionBox(item, "remove", index);

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
            // this.fillPositionBox(item, "add", index);
            // console.log("fill done");
        },
        /**
         * 添加元素
         * 
         * @param {any} item 
         */
        addItem(item) {
            this.adjustPosition(item, this.list.length);

            this.list.push(item);
        },
        floatAllItems() {
            let rows = this.positionBox.length;
            let cells = this.positionBox[0].length;

            for (let i = 0; i < cells; i++) {
                for (let j = 0; j < rows; j++) {
                    let itemIndex = this.positionBox[j][i].index;
                    if (itemIndex != -1) {
                        let item = this.list[itemIndex];
                        this.floatItem(item);
                    }
                }
            }
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

            console.log("godown list , maxMoveY=%d", maxMoveY);
            console.dir(goDownItems);
            this.moveItemsDown(goDownItems, maxMoveY);

            let orignY = item.y;
            this.floatItem(item);
            this.moveItemsUp(goDownItems);
            // this.floatAllItems();
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
        collectNeedMoveUpItems(item, array) {

        },
        /**
         * 移动需要下移的所有元素
         * 
         * @param {any} items 
         * @param {any} moveSize 移动的距离
         */
        moveItemsDown(items, moveSize) {
            let vm = this;
            _.forEach(items, function (value, key) {
                let itemIndex = key.split("item")[1];
                let item = vm.list[itemIndex];
                vm.fillPositionBox(item, "remove", itemIndex);
                item.y = item.y + moveSize;
            })

            _.forEach(items, function (value, key) {
                let itemIndex = key.split("item")[1];
                let item = vm.list[itemIndex];
                vm.fillPositionBox(item, "add", itemIndex);
            })
        },
        moveItemsUp(items) {
            let vm = this;

            let arrayOfItems=[];

            _.forEach(items, function (value, key) {
                let itemIndex = key.split("item")[1];
                let item = vm.list[itemIndex];
                arrayOfItems.push(item);
            })

            arrayOfItems=_.sortBy(arrayOfItems,["y"]);

            _.forEach(arrayOfItems,function(item){
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
    }
}
