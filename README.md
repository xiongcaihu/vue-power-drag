## vue-power-drag
#### v0.1
---

<b>Attributes</b>:

    props: {
        yourList: {
            required: true,
            type: Array
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
        draggable: {
            required: false,
            default: true,
            type: Boolean
        },
        dragStart: {
            required: false,
            type: Function,
            default: function (e,item,index) {
              //e:事件对象
              //item:当前布局方框对象
              //index:item的下标
            }
        },
        dragging: {
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        dragEnd: {
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        resizable: {
            required: false,
            type: Boolean,
            default: true,
        },
        resizeStart: {
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        resizing: {
            required: false,
            type: Function,
            default: function (e,item,index) {}
        },
        resizeEnd: {
            required: false,
            type: Function,
            default: function (e,item,index) {}
        }
    }

-----

<b>Api</b>

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
