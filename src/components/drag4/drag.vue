<template>
    <div class='dragAndResize' ref='container' @mousedown="containerMouseDown($event)" @mouseup="endMove($event)" @mousemove="moving($event)">
        <div class="mask" v-if="!renderOk">
            <span class="thing"></span>
        </div>
        <div v-if="renderOk && item.show" class="item" @mousedown="startMove($event,item,index)" :ref="'item'+index" v-for="(item,index) in list" :key="'item'+index" :style="nowItemStyle(item,index)">
            <slot :name="'slot'+index"></slot>
            <span class="resizeHandle" @mousedown="startResize($event,item,index)"></span>
        </div>
        
        <div class="positionBox">
            <table border="1">
                <thead>
                    <tr>
                        <td></td>
                        <td v-for="(item,index) in positionBox">
                            {{index}}
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,index) in positionBox" v-if="index<20">
                        <td>{{index}}</td>
                        <td v-for="(subItem,index2) in item">
                            {{subItem.el.id}}
                        </td>
                    </tr>
                </tbody>
            </table>
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
