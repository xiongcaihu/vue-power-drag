import _ from "lodash"
import $ from "jquery"

//事情
//边界填充，回调事件暴露

let positionBox = [];
let coordinates = []; //坐标点集合

let lastTask = undefined;
let isOverlay = false; //是否正在交换位置
let moveTime = 80; //移动动画时间

let itemMaxY = 0;
let itemMaxX = 0;

function debounce(func, time) {
    if (!isOverlay) {
        (function (t) {
            isOverlay = true;
            setTimeout(function () {
                t();
                setTimeout(function () {
                    isOverlay = false;
                    if (lastTask != undefined) {
                        debounce(lastTask, time);
                    }
                }, moveTime);
            }, time);
        })(func)
        lastTask = undefined;
    } else {
        lastTask = func;
    }
}

/**
 * 重置位置盒子
 * 
 */
function resetPositionBox() {
    //根据当前容器的宽度来决定多少列
    let cells = parseInt(this.$refs['container'].offsetWidth / this.cellWidth);
    itemMaxX = cells;
    let rows = 3000; //初始100行，后面根据需求会自动增加
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

function fillPositionBox(maxY) {
    for (let i = 0; i < itemMaxX; i++) {
        let row = [];

        for (let j = itemMaxY; j < maxY; j++) {
            row.push({
                el: false
            })
        }

        positionBox.push(row);
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

    _.forEach(this.yourList, function (item, index) {
        addItem.call(vm, item, index);
    })

    // let length = this.yourList.length;
    // let i = 0;
    // let timeid = setInterval(function () {
    //     if (i >= length) {
    //         clearInterval(timeid);
    //         return;
    //     }

    //     let item = vm.yourList[i]
    //     addItem.call(vm, item, i);
    //     i++;
    // }, 0);

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
 * 检查移动的位置，如果不合法，会自动修改
 * 
 * @param {any} item 
 * @param {any} position 
 */
function checkItemPosition(item, position) {
    position = position || {};
    position.x = position.x || item.x;
    position.y = position.y || item.y;

    if (position.x < 1) {
        item.x = 1;
    }

    if (position.x + item.sizex > itemMaxX) {
        item.x = itemMaxX - item.sizex;
    }

    if (position.y < 1) {
        item.y = 1;
    }

    if (position.y + item.sizey > itemMaxY) {
        fillPositionBox(position.y + item.sizey);
    }
}

/**
 * 移动正在拖动的元素
 * 
 * @param {any} item
 * @param {any} position
 */
function movePlayer(item, position) {
    let vm = this;
    removeItemFromPositionBox(item);

    // checkItemPosition.call(this, item, position);

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

    // setTimeout(function () {
    //     vm.infoBox.clonePlaceHolder.css({
    //         left: (vm.cellWidth * (item.x - 1) + vm.baseMarginLeft) + 'px',
    //         top: (vm.cellHeight * (item.y - 1) + vm.baseMarginTop) + 'px',
    //     })
    // }, 1);
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

    // checkItemPosition.call(this, copyItem, {
    //     x: copyItem.x,
    //     y: copyItem.y
    // });

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
    // checkItemPosition.call(this, item, {
    //     y: item.y + size
    // });
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

    if (item.y + item.sizey > itemMaxY) {
        itemMaxY = item.y + item.sizey;
    }
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
            if(target==undefined){
                console.log("row=%d,cell=%d",row,cell);
                console.dir(positionBox);
            }
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
                this.infoBox.clonePlaceHolder = target.clone();
            } else {
                this.infoBox.nowItemNode = target.parents(".item");
                this.infoBox.cloneItem = this.infoBox.nowItemNode.clone();
                this.infoBox.clonePlaceHolder = this.infoBox.nowItemNode.clone();
            }
            this.infoBox.cloneItem.addClass("cloneNode");
            // this.infoBox.clonePlaceHolder.addClass("movingItem");

            $(this.$el).append(this.infoBox.cloneItem);
            // $(this.$el).append(this.infoBox.clonePlaceHolder);

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
            if (this.infoBox.clonePlaceHolder) {
                this.infoBox.clonePlaceHolder.remove();
            }
            if (this.infoBox.moveItem) {
                this.$set(this.infoBox.moveItem, "show", true);
                this.$delete(this.infoBox.moveItem, "isPlayer");
            }
            this.infoBox = {};
        },
        moving(e) {
            let moveItem = _.get(this.infoBox, "moveItem");
            let resizeItem = _.get(this.infoBox, "resizeItem");
            if (resizeItem) { //调整大小时
                this.$set(resizeItem, "isPlayer", true);
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

                let vm = this;

                debounce((function (addSizex, addSizey) {
                    return function () {
                        if (Math.abs(addSizex) >= 1 || Math.abs(addSizey) >= 1) {
                            resizePlayer.call(vm, resizeItem, {
                                sizex: addSizex,
                                sizey: addSizey
                            })
                        }
                    }
                })(addSizex, addSizey), 10);

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
                // this.$set(moveItem, "show", false);
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
                })(newX, oldX, newY, oldY), 10);

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
                top: (this.cellHeight * (item.y - 1) + this.baseMarginTop) + 'px',
                opacity: item.show ? 1 : 0
            }
        },
        getList(){
            let returnList=_.sortBy(this.list,'y');
            _.forEach(returnList,function(item,index){
                delete item['_dragId'];
                delete item['show'];
            });
            return returnList;
        }
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
