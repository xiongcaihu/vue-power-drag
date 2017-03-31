# vue-power-drag
#### v0.1.1

> 基于vue2.x的拖动缩放组件，可嵌套子组件，作者cy

## DEMO
<a href='https://xiongcaihu.github.io/#/' target="_blank">https://xiongcaihu.github.io/#/</a>

## Build Setup

``` bash
# 根据自己网络情况选择,cnpm怎么用请自行百度
npm install vue-power-drag 
cnpm install vue-power-drag

then

---vue
<template>
    <div id="demo">
        <vue-power-drag :your-list="list">
            <template v-for="(item,index) in list" :slot="'slot'+index">
                //循环自己需要的组件
            </template>
        </vue-power-drag>
    </div>
</template>
<script>
import drag from 'vue-power-drag'

export default{
    data(){
        return {
            list:[
                {
                    x:1,
                    y:1,
                    sizex:1,
                    sizey:1
                }
            ]
        }
    },
    components:{
        'vue-power-drag':drag
    }
}
</script>

```

## Document

##### Attributes

```bash
    props: {
        yourList: {
            required: true,
            type: Array,   
            
            /*
            yourList:[
                {
                    _dragId:int,//这个是在此组件初始化时附加的临时变量，代表当前对象所在yourList中的下标值（请勿传入相同字段）
                    x:int, //x轴位置
                    y:int, //y轴位置
                    sizex:int, //x方向大小（宽度=单元格宽度*x）
                    sizey:int //y方向大小（高度=单元格高度*y）
                }
            ]
            */
        },
        baseWidth: {//最小单元格宽度
            required: false,
            type: Number,
            default: 100//如果你的项目中会存在很多方框，那么建议尽量用大一点的数字
        },
        baseHeight: {//最小单元格高度
            required: false,
            type: Number,
            default: 50
        },
        baseMarginLeft: {//单元格左边距
            required: false,
            type: Number,
            default: 20
        },
        baseMarginTop: {//单元格上边距
            required: false,
            type: Number,
            default: 20
        },
        draggable: {//是否允许拖动
            required: false,
            default: true,
            type: Boolean
        },
        dragStart: {//拖动开始时的事件
            required: false,
            type: Function,
            default: function (e,item,index) {
              //e:事件对象
              //item:当前布局方框对象
              //index:item的下标
            }
        },
        dragging: {//拖动过程中的事件
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        dragEnd: {//拖动结束时的事件
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        resizable: {//是否允许缩放
            required: false,
            type: Boolean,
            default: true,
        },
        resizeStart: {//缩放开始事件
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        resizing: {//缩放过程中的事件
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        resizeEnd: {//缩放结束时的事件
            required: false,
            type: Function,
            default: function (e,item,index) {}
        }
    }
```

##### API

```bash
      init:function(){
          // 在组件mounted后的手动初始化方式，方便多次初始化而不用去重新载入组件。
      } 
      addItemBox:function(item){
          // item:布局方框，属性值应和props中的yourList数组对应的对象相同
      }
      getList:function(){
          //此方法返回将yourList按照asc排序的数组
          return sortedList; 
      }
      getMaxCell：function(){
          //此方法返回当前宽度下每行的最大单元格个数
      }    
```
