<template>
    <div class='dragAndResize' ref='container' @mousedown="containerMouseDown($event)" @mouseup="endMove($event)" @mousemove="moving($event)">
        <div v-if="renderOk">
            <div :class="{item:true,moveAnimation:moveAnimate,movingItem:item.isPlayer,canNotDrag:!draggable}" @mousedown="startMove($event,item,index)" :ref="'item'+index" v-for="(item,index) in yourList"
                :key="'item'+index" :style="nowItemStyle(item,index)">
                <slot :name="'slot'+index"></slot>
                <span class="resizeHandle" v-show="resizable" @mousedown="startResize($event,item,index)"></span>
            </div>
        </div>
    </div>
</template>

<script>
    import js from "./drag.js"
    export default js

</script>

<style lang="less">
    @import "./drag.less";

</style>
