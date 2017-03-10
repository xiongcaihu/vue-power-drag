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
            positionBox: []
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

            this.resetPositionBox();

            setTimeout(function () {
                vm.renderOk = true;
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

            this.fillPositionBox(cloneItem, "remove");
        },
        /**
         * 添加元素
         * 
         * @param {any} item 
         */
        addItem(item) {
            let overlay = this.checkOverLay(item);
            if (overlay) {
                this.fixOverLay(item);
            } else {
                this.floatItem(item);
            }
            // this.list.push(item);
            this.fillPositionBox(item, "add");
        },
        /**
         * 解决重叠
         * 
         * @param {any} item 
         */
        fixOverLay(item) {
            let goDownItems = [];
            this.collectNeedMoveDownItems(item, goDownItems);

            this.moveItemsDown(goDownItems, item.sizey);
        },
        /**
         * 统计需要下移的元素（递归）
         * 
         * @param {any} item 
         * @param {any} array 
         */
        collectNeedMoveDownItems(item, array) {

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

        },
        moveItemsUp(items, moveSize) {

        },
        /**
         * 上浮此元素
         * 
         * @param {any} item 
         */
        floatItem(item) {

        },
        /**
         * 检查增加的位置是否有重叠
         * 
         * @param {any} item 
         */
        checkOverLay(item) {
            for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                for (let j = item.y - 1; j < item.y - 1 + item.sizey; j++) {
                    if (this.positionBox[i][j].index != -1) {
                        return false;
                    }
                }
            }
            return true;
        },
        /**
         * 填充位置盒子
         * 
         * @param {any} item 
         */
        fillPositionBox(item, type) {
            if (type == "add") {

            } else if (type == "remove") {

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
