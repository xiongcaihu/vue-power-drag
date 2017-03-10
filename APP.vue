<template>
    <div id="app">
        <drag 
            :list="myList"
            >
            <div v-for="(item,index) in myList" :slot="'slot'+index">
                {{item.text}}
            </div>
        </drag>
    </div>
</template>

<script>
    import drag from './components/drag/drag.vue';

    export default {
        data() {
            return {
                myList: [{
                        id: 1,
                        text:"kfjd123213",
                        x:1,
                        y:1,
                        sizex:2,
                        sizey:2
                    },
                    {
                        id: 2,
                        text:"kfjd",
                        x:1,
                        y:3,
                        sizex:2,
                        sizey:2
                    },{
                        id: 3,
                        text:"kfjd",
                        x:3,
                        y:1,
                        sizex:1,
                        sizey:1
                    }
                ]
            }
        },
        components: {
            "drag": drag
        },
        name: 'app'
    }

</script>

<style>


</style>
