<template>
    <div class='dragAndResize' ref='container'>
        <div class="mask" v-if="!renderOk">
            <span class="thing"></span>
        </div>
        <div v-if="renderOk" class="item" v-for="(item,index) in list" :style="nowItemStyle(item)">
            <slot :name="'slot'+index"></slot>
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
