<template>
    <div class='dragAndResize' ref='container' @mousedown="containerMouseDown($event)" @mouseup="endMove($event)" @mousemove="moving($event)">
        <div class="mask" v-if="!renderOk">
            <span class="thing"></span>
        </div>
        <div v-if="renderOk">
            <transition-group name="flip-list">
                <div v-show="item.show" :class="{movingItem:item.isPlayer}" class="item" @mousedown="startMove($event,item,index)" :ref="'item'+index" v-for="(item,index) in list"
                    :key="'item'+index" :style="nowItemStyle(item,index)">
                    <slot :name="'slot'+index"></slot>
                    <span class="resizeHandle" @mousedown="startResize($event,item,index)"></span>
                </div>
            </transition-group>
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

        <div class="coords">
            <p v-for="(item,index) in coordinates">
                {{item.el.id}} : {{item.x1+'-'+item.x2+'-'+item.y1+'-'+item.y2}}
            </p>
        </div>

    </div>
</template>

<script>
    import js from "./drag.js"
    export default js

</script>

<style lang="less">
    .flip-list-move {
        transition: all 80ms ease;
    }
    
    @import "./drag.less";

</style>
