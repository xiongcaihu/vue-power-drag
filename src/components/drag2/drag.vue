<template>
    <div class='dragAndResize' ref='container' @mousedown="containerMouseDown($event)" @mouseup="endMove($event)" @mousemove="moving($event)">
        <div class="mask" v-if="!renderOk">
            <span class="thing"></span>
        </div>
        <div v-if="renderOk" class="item" @mousedown="startMove($event,item,index)" :ref="'item'+index" v-for="(item,index) in list" :style="nowItemStyle(item,index)">
            <slot :name="'slot'+index"></slot>
            <span class="resizeHandle" @mousedown="startResize($event,item,index)"></span>
        </div>
        <div class="positionBox">
            <p v-for="(value,key) in positionBox">
                {{key+":"+value}}
            </p>
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
