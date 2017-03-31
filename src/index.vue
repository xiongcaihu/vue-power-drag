<template>
    <div class="index">
        <h1>欢迎使用power-drag</h1>
        <div class="head">
            <router-link to="/base">基本应用</router-link>
            <router-link to="/power500">性能测试500</router-link>
            <router-link to="/power1000">性能测试1000</router-link>
            <router-link to="/chart">嵌入highchart用法</router-link>
        </div>
        <div class="center">
            <transition-group class="content" name="item">
                <div class="item" v-for="i in list" :key='i.id'>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import Mock from 'mockjs';

    export default {
        data() {
            let list = Mock.mock({
                "list|16": [{
                    "id|+1": 1
                }]
            })
            return {
                list: list.list
            }
        },
        mounted() {
            setInterval(() => {
                this.list = _.shuffle(this.list)
            }, 1000);

            let contentHeight = window.innerHeight - 182.56 - 10;
            document.querySelector(".center").style.height = contentHeight + 'px';
        }
    }

</script>

<style scoped>
    body * {
        box-sizing: border-box;
    }

    h1 {
        text-align: center;
    }

    .head {
        display: flex;
        height: 100px;
        border-bottom: 1px dashed;
        border-top: 1px dashed;
        justify-content: center;
    }

    .head a {
        flex: 1;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        color: black;
    }

    .head a:hover {
        background-color: black;
        color: white;
    }

    .center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .content {
        width: 480px;
        height: 300px;
        position: relative;
        display: flex;
        flex-wrap: wrap;
    }

    .content .item {
        width: 100px;
        height: 50px;

        border: 1px solid black;
        margin: 10px;
        color: white;
    }

    .item-move {
        transition: transform .5s;
    }

</style>
