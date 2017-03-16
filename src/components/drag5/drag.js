import _ from "lodash"
import $ from "jquery"

let positionBox = [];
let coordinates = []; //坐标点集合

let debounceId = 0;
let nowTask = undefined;
let lastTask = undefined;
let canRun = true;

let isOverlay = false; //是否正在交换位置

function makeAnimation(func) {
    return new Promise(function (r) {
        func();
        r();
    })
}

function debounce(func, time) {
    if (canRun) {
        canRun=false;
        (function (t) {
            setTimeout(function () {
                makeAnimation(t).then(function () {
                    canRun=true;
                    if(lastTask!=undefined){
                        debounce(lastTask,time);
                    }
                })
            }, time);
        })(func)
        lastTask=undefined;
    }else{
        lastTask=func;
    }

}

/**
 * 重置位置盒子
 * 
 */
function resetPositionBox() {
    //根据当前容器的宽度来决定多少列
    let cells = parseInt(this.$refs['container'].offsetWidth / this.cellWidth);
    let rows = 1200; //初始100行，后面根据需求会自动增加
    for (let i = 0; i < rows; i++) {
        let row = [];

        for (let j = 0; j < cells; j++) {
            row.push({
                el: false
            })
        }

        positionBox.push(row);
    }
}

/**
 * 填充位置盒子
 * 
 * @param {any} item 
 */
function addItemToPositionBox(item) {
    if (item.x <= 0 || item.y <= 0) return;

    for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
        for (let j = item.y - 1; j < item.y - 1 + item.sizey; j++) {
            positionBox[j][i].el = item;
        }
    }
}

function removeItemFromPositionBox(item) {
    if (item.x <= 0 || item.y <= 0) return;
    for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
        for (let j = item.y - 1; j < item.y - 1 + item.sizey; j++) {
            positionBox[j][i].el = false;
        }
    }
}

function init() {
    let vm = this;

    console.log(JSON.stringify(_.cloneDeep(this.yourList)))

    resetPositionBox.call(this);

    // _.forEach(this.yourList,function(item,index){
    //     addItem.call(vm,item,index);
    // })

    let length = this.yourList.length;
    let i = 0;
    let timeid = setInterval(function () {
        if (i >= length) {
            clearInterval(timeid);
            return;
        }

        let item = vm.yourList[i]
        addItem.call(vm, item, i);
        i++;
    }, 0);

    vm.renderOk = true;
    vm.$nextTick(function () {

    })
}

function resizePlayer(item, newSize) {
    let vm = this;
    removeItemFromPositionBox(item);

    let belowItems = findBelowItems.call(this, item);

    _.forEach(belowItems, function (upItem) {
        let canGoUpRows = canItemGoUp(upItem);

        if (canGoUpRows > 0) {
            moveItemUp.call(vm, upItem, canGoUpRows);
        }
    })

    item.sizex += newSize.sizex;
    item.sizey += newSize.sizey;

    emptyTargetCell.call(this, item);

    addItemToPositionBox(item);

    changeItemCoord.call(this, item);

    let canGoUpRows = canItemGoUp(item);

    if (canGoUpRows > 0) {
        moveItemUp.call(this, item, canGoUpRows);
    }
}

/**
 * 移动正在拖动的元素
 * 
 * @param {any} item
 * @param {any} position
 */
function movePlayer(item, position) {
    if(isOverlay) return;
    let vm = this;
    removeItemFromPositionBox(item);

    let belowItems = findBelowItems.call(this, item);

    _.forEach(belowItems, function (upItem) {
        let canGoUpRows = canItemGoUp(upItem);
        if (canGoUpRows > 0) {
            moveItemUp.call(vm, upItem, canGoUpRows);
        }
    })

    item.x = position.x;
    item.y = position.y;

    emptyTargetCell.call(this, item);

    addItemToPositionBox(item);

    changeItemCoord.call(this, item);

    let canGoUpRows = canItemGoUp(item);

    if (canGoUpRows > 0) {
        moveItemUp.call(this, item, canGoUpRows);
    }

    setTimeout(function () {
        isOverlay = false;
    }, 100);
}

function removeItem(item) {
    removeItemFromPositionBox(item);

    let belowItems = findBelowItems(item);

    this.list.splice(item._dragId, 1);

    _.forEach(belowItems, function (upItem) {
        let canGoUpRows = canItemGoUp(upItem);

        if (canGoUpRows > 0) {
            moveItemUp.call(this, upItem, canGoUpRows);
        }
    })

}

function addItem(item, index) {
    let copyItem = _.cloneDeep(item);
    this.list.splice(index, 0, copyItem);
    copyItem._dragId = index;
    copyItem.show = false;

    emptyTargetCell.call(this, copyItem);

    addItemToPositionBox(copyItem);

    let canGoUpRows = canItemGoUp(copyItem);

    if (canGoUpRows > 0) {
        moveItemUp.call(this, copyItem, canGoUpRows);
    }

    copyItem.show = true;

    //生成坐标点
    makeCoordinate.call(this, copyItem);
}

function changeToCoord(left, top, width, height) {
    return {
        x1: left,
        x2: left + width,
        y1: top,
        y2: top + height,
        c1: left + width / 2,
        c2: top + height / 2,
    }
}

/**
 * 检测有无碰撞，并作出处理
 * 
 * @param {any} tCoord 比对对象的坐标
 */
function findClosetCoords(item, tCoord) {
    if (isOverlay) return;
    let i = coordinates.length;
    let collisionsItem = [];
    while (i--) {
        let nowCoord = coordinates[i];
        if (item._dragId == nowCoord.el._dragId) {
            continue;
        }

        if (tCoord.x2 < nowCoord.x1 || tCoord.x1 > nowCoord.x2 || tCoord.y2 < nowCoord.y1 || tCoord.y1 > nowCoord.y2) {
            continue;
        } else {
            collisionsItem.push({
                centerDistance: Math.sqrt(Math.pow(tCoord.c1 - nowCoord.c1, 2) + Math.pow(tCoord.c2 - nowCoord.c2, 2)),
                coord: nowCoord
            })
        }
    }

    if (collisionsItem.length <= 0) {
        return
    }

    isOverlay = true;

    collisionsItem = _.sortBy(collisionsItem, 'area');

    movePlayer.call(this, item, {
        x: collisionsItem[0].coord.el.x,
        y: collisionsItem[0].coord.el.y,
    })

    setTimeout(function () {
        isOverlay = false;
    }, 200);
}

/**
 * 生成坐标点
 * 
 * @param {any} item
 */
function makeCoordinate(item) {
    let width = this.cellWidth * (item.sizex) - this.baseMarginLeft;
    let height = this.cellHeight * (item.sizey) - this.baseMarginTop;
    let left = this.cellWidth * (item.x - 1) + this.baseMarginLeft;
    let top = this.cellHeight * (item.y - 1) + this.baseMarginTop;

    let coord = {
        x1: left,
        x2: left + width,
        y1: top,
        y2: top + height,
        c1: left + width / 2,
        c2: top + height / 2,
        el: item
    }

    coordinates.push(coord);
}

function changeItemCoord(item) {
    let width = this.cellWidth * (item.sizex) - this.baseMarginLeft;
    let height = this.cellHeight * (item.sizey) - this.baseMarginTop;
    let left = this.cellWidth * (item.x - 1) + this.baseMarginLeft;
    let top = this.cellHeight * (item.y - 1) + this.baseMarginTop;

    let coord = {
        x1: left,
        x2: left + width,
        y1: top,
        y2: top + height,
        c1: left + width / 2,
        c2: top + height / 2,
        el: item
    }

    let index = _.findIndex(coordinates, function (o) {
        return o.el._dragId == item._dragId;
    });
    if (index != -1) {
        coordinates.splice(index, 1, coord);
    }
}

function moveItem(item) {
    emptyTargetCell.call(this, item);

    item.x = position.x || item.x;
    item.y = position.y || item.y;
}

/**
 * 清空目标位置的元素
 * 
 * @param {any} item 
 */
function emptyTargetCell(item) {
    let vm = this;
    let belowItems = findBelowItems(item);

    _.forEach(belowItems, function (downItem, index) {
        if (downItem._dragId == item._dragId) return;
        let moveSize = item.y + item.sizey - downItem.y;
        if (moveSize > 0) {
            moveItemDown.call(vm, downItem, moveSize);
        }
    })
}


/**
 * 当前位置的item能否上浮
 * 
 * @param {any} item
 * @returns
 */
function canItemGoUp(item) {
    let upperRows = 0;
    for (let row = item.y - 2; row >= 0; row--) {
        for (let cell = item.x - 1; cell < item.x - 1 + item.sizex; cell++) {
            if (positionBox[row][cell].el) {
                return upperRows;
            }
        }
        upperRows++;
    }


    return upperRows;
}

/**
 * 在移动之前，找到当前下移的元素的下面的元素（递归）
 * 
 * @param {any} items 
 * @param {any} size 
 */
function moveItemDown(item, size) {
    let vm = this;
    removeItemFromPositionBox(item);

    let belowItems = findBelowItems(item);

    _.forEach(belowItems, function (downItem, index) {
        if (downItem._dragId == item._dragId) return;
        // let moveSize = item.y + item.sizey + size - downItem.y;
        let moveSize = calcDiff(item, downItem, size);
        if (moveSize > 0) {
            moveItemDown.call(vm, downItem, moveSize);
        }
    })

    // item.y += size;
    setPlayerPosition.call(this, item, {
        y: item.y + size
    })

    addItemToPositionBox(item);

    changeItemCoord.call(this, item);
}

function setPlayerPosition(item, position) {
    let vm = this;
    position = position || {};

    let targetX = position.x || item.x;
    let targetY = position.y || item.y;

    item.x = targetX;
    item.y = targetY;
}

/**
 * 寻找子元素到父元素的最大距离
 * 
 * @param {any} parent
 * @param {any} son
 * @param {any} size
 */
function calcDiff(parent, son, size) {
    let diffs = [];

    for (let i = son.x - 1; i < son.x - 1 + son.sizex; i++) {
        let temp_y = 0;

        for (let j = parent.y - 1 + parent.sizey; j < son.y - 1; j++) {
            if (positionBox[j][i].el == false) {
                temp_y++;
            }
        }
        diffs.push(temp_y);
    }

    let max_diff = Math.max.apply(Math, diffs);
    size = size - max_diff;

    return size > 0 ? size : 0;
}

function moveItemUp(item, size) {
    let vm = this;

    removeItemFromPositionBox(item);

    let belowItems = findBelowItems(item);

    // item.y -= size;
    setPlayerPosition.call(this, item, {
        y: item.y - size
    })

    addItemToPositionBox(item);

    changeItemCoord.call(this, item);

    _.forEach(belowItems, function (upItem, index) {
        let moveSize = canItemGoUp(upItem);
        if (moveSize > 0) {
            moveItemUp.call(vm, upItem, moveSize);
        }
    })
}

function findBelowItems(item) {
    let belowItems = {};
    for (let cell = item.x - 1; cell < item.x - 1 + item.sizex; cell++) {
        for (let row = item.y - 1; row < positionBox.length; row++) {
            let target = positionBox[row][cell];
            if (target.el) {
                // belowItems.push(target.el);
                belowItems[target.el._dragId] = target.el;
                break;
            }
        }
    }

    return _.sortBy(_.values(belowItems), 'y');
}

export default {
    props: {
        yourList: {
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
            list: [],
            cellWidth: 0,
            cellHeight: 0,
            containerY: 0,
            containerX: 0,
        }
    },
    computed: {
        positionBox() {
            return positionBox;
        },
        coordinates() {
            return coordinates;
        },
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
            return _.get(this, "positionBox[" + row + "][" + cell + "].index");
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

            $(this.$el).append(this.infoBox.cloneItem);

            this.infoBox.orignX = this.infoBox.cloneItem.position().left;
            this.infoBox.orignY = this.infoBox.cloneItem.position().top;
            this.infoBox.oldX = item.x;
            this.infoBox.oldY = item.y;
            this.infoBox.orignWidth = this.infoBox.cloneItem.width();
            this.infoBox.orignHeight = this.infoBox.cloneItem.height();
            this.infoBox.orignOffsetX = e.offsetX;
            this.infoBox.orignOffsetY = e.offsetY;
        },
        endMove(e) {
            if (this.infoBox.cloneItem) {
                this.infoBox.cloneItem.remove();
            }
            if (this.infoBox.moveItem) {
                this.$delete(this.infoBox.moveItem, "isPlayer");
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
                    resizePlayer.call(this, resizeItem, {
                        sizex: addSizex,
                        sizey: addSizey
                    })
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
                this.$set(moveItem, "isPlayer", true);
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

                // let nowX = Math.round(moveXSize / this.cellWidth);
                // let nowY = Math.round(moveYSize / this.cellHeight);

                // this.customMoveItem(moveItem, nowItemIndex, {
                //     x: parseInt(oldX + nowX),
                //     y: parseInt(oldY + nowY)
                // })

                let nowCloneItemX = orignX + moveXSize;
                let nowCloneItemY = orignY + moveYSize;

                let newX = parseInt((nowCloneItemX + (cloneItem.width() / 12) - this.baseMarginLeft) / this.cellWidth + 1);
                let newY = parseInt((nowCloneItemY + (cloneItem.height() / 12) - this.baseMarginTop) / this.cellHeight + 1);
                newX = newX > 0 ? newX : 1;
                newY = newY > 0 ? newY : 1;

                // let nowCoord = changeToCoord(nowCloneItemX, nowCloneItemY, cloneItem.width(), cloneItem.height());
                // findClosetCoords.call(this, moveItem, nowCoord);

                // console.log("newX=%d,newY=%d", newX, newY);
                let vm = this;
                debounce((function (newX, oldX, newY, oldY) {
                    return function () {
                        if (newX != oldX || oldY != newY) {
                            console.log("move");
                            movePlayer.call(vm, moveItem, {
                                x: newX,
                                y: newY
                            })

                            vm.infoBox.oldX = newX;
                            vm.infoBox.oldY = newY;
                        }
                    }
                })(newX, oldX, newY, oldY), 20);
                // if (!isOverlay) {
                //     setTimeout(function () {
                //         if (newX != oldX || oldY != newY) {
                //             isOverlay=true;
                //             console.log("move");
                //             movePlayer.call(vm, moveItem, {
                //                 x: newX,
                //                 y: newY
                //             })

                //             vm.infoBox.oldX = newX;
                //             vm.infoBox.oldY = newY;
                //         }
                //     }, 10);
                // }

                cloneItem.css({
                    left: nowCloneItemX + 'px',
                    top: nowCloneItemY + 'px'
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
                if (position.x < 1 || position.y < 1 || position.x + item.sizex >= cells + 2) {
                    return;
                }
            }
            this.fillPositionBox(item, "remove", index);

            //记录移动前该元素下的关联元素
            let goUpItems = this.collectNeedMoveUpItems(item);
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

            this.emptyTargetCell(item, position); //清空目标位置的元素

            item.x = position.x || item.x;
            item.y = position.y || item.y;

            // this.adjustPosition(item, index);

        },
        emptyTargetCell(item) {

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
                // console.log("overlay");
            } else {
                // console.log("float");
                this.floatItem(item);
            }
        },
        /**
         * 寻找重叠元素
         * 
         * @param {any} item 
         * @returns 
         */
        findOverLayItems(item) {
            let goDownItems = {};
            let maxMoveY = 0;

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
                        goDownItems[itemIndex] = itemIndex;
                        // this.collectNeedMoveDownItems(targetItem); //收集重叠元素下面关联的所有元素
                    }
                }
            }

            return {
                goDownItems: goDownItems,
                maxMoveY: maxMoveY
            }
        },
        /**
         * 解决重叠
         * 
         * @param {any} item 
         */
        fixOverLay(item) {
            let vm = this;
            //寻找重叠的元素
            let obj = this.findOverLayItems(item);

            _.forEach(obj.goDownItems, function (value, key) {
                let itemIndex = key;
                let tempItem = vm.list[itemIndex];

                vm.fillPositionBox(tempItem, "remove", itemIndex);
            })

            this.floatItem(item);

            _.forEach(obj.goDownItems, function (value, key) {
                let itemIndex = key;
                let tempItem = vm.list[itemIndex];

                vm.moveItem(tempItem, itemIndex, {
                    y: tempItem.y + obj.maxMoveY
                })
            })
        },
        /**
         * 统计需要下移的元素（递归）
         * 
         * @param {any} item 
         * @param {any} array 
         */
        collectNeedMoveDownItems(item) {
            let goDownItems = {};
            let itemIndexs = _.keys(item.downItems);
            if (!_.isEmpty(itemIndexs)) {
                for (let i = 0; i < itemIndexs.length; i++) {
                    let index = itemIndexs[i];
                    let nowItem = this.list[index];
                    goDownItems[index] = index;
                    _.merge(goDownItems, this.collectNeedMoveDownItems(nowItem));
                }
            }
            return goDownItems;
            // for (let i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
            //     let j = item.y + item.sizey - 1;
            //     // let itemIndex = this.positionBox[j][i].index;
            //     let itemIndex = this.getPositionBoxIndex(j, i);
            //     let targetItem = this.list[itemIndex];
            //     if (itemIndex != -1) {
            //         goDownItems['item' + itemIndex] = 1;
            //         this.collectNeedMoveDownItems(targetItem, goDownItems);
            //     }
            // }
        },
        collectNeedMoveUpItems(item) {
            return this.collectNeedMoveDownItems(item);
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
                let itemIndex = key;
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
                        this.searchTopAndDownConnectItem(item);
                        this.fillPositionBox(item, "add", item._dragId);
                        return;
                    }
                }
            }

            item.y = 1;
            this.searchTopAndDownConnectItem(item);
            this.fillPositionBox(item, "add", item._dragId);
        },
        /**
         * 寻找元素上下关联的其他元素
         * 
         * @param {any} item 
         */
        searchTopAndDownConnectItem(item) {
            item.topItems = {}
            //上边关联元素
            for (var i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                var y = item.y - 2;
                if (y < 0) {
                    break;
                }
                let cItemIndex = this.getPositionBoxIndex(y, i);
                let cItem = this.list[cItemIndex];
                if (cItemIndex != -1) {
                    item.topItems[cItemIndex] = cItemIndex;
                    cItem.downItems[item._dragId] = item._dragId;
                }
            }

            item.downItems = {}
            //下边关联元素
            for (var i = item.x - 1; i < item.x - 1 + item.sizex; i++) {
                var y = item.y - 1 + item.sizey;
                let cItemIndex = this.getPositionBoxIndex(y, i);
                let cItem = this.list[cItemIndex];
                if (cItemIndex != -1) {
                    item.downItems[cItemIndex] = cItemIndex;
                    cItem.topItems[item._dragId] = item._dragId;
                }
            }
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
    },
    created() {
        this.cellWidth = this.baseWidth + this.baseMarginLeft;
        this.cellHeight = this.baseHeight + this.baseMarginTop;

        this.positionBox = [];
    },
    mounted() {
        init.call(this);

        this.containerX = $(this.$el).position().left;
        this.containerY = $(this.$el).position().top;
    }
}
