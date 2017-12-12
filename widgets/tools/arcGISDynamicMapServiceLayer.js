/**
 * Created by Administrator on 2015/10/1.
 */
define([
    "dojo/_base/array"
],function(
    array
){
   function setLayerInfoVisible(map,layerName,layerInfoName,visible){
       var layer = map.getLayer(layerName);
       if(layer.loaded){
           //获取所有子图层
           var layerInfos = layer.layerInfos;
           //获取地图当前比例尺
           var scale = map.getScale();
           //获取"一级网格"层比例尺范围
           var maxScale,minScale,layerInfoId;
           layerInfos.forEach(function(layerInfo,i){
               if(layerInfo.name==layerInfoName){
                   maxScale = layerInfo.maxScale;
                   minScale = layerInfo.minScale;
                   layerInfoId = layerInfo.id;
               }
           });
           //如果maxScale==MinScale==0,表示“一级网格”任何比例尺下都显示;
           //如果scale>maxScale或者scale<minScale，“一级网格”不显示，
           //开关图层时，不起作用
           if(maxScale == 0&&minScale ==0){
               _setLayerInfoVisible(layer,layerInfoId,visible);
           }
           else {
               if (minScale <= scale <= maxScale) {
                   _setLayerInfoVisible(layer,layerInfoId,visible);
               }
           }
       }
   }
    return {
        setLayerInfoVisible: setLayerInfoVisible
    };
    function _setLayerInfoVisible(layer,layerInfoId,visible){
        //获取显示图层ID的数组，如果CheckBox选中，数组新增id，
        //如果如果CheckBox未选中，数组移除id，
        var visibleLayers = layer.visibleLayers;
        if(visible){
            if(!array.some(visibleLayers,function(item){return item == layerInfoId})){
                visibleLayers.push(layerInfoId);
            }
        }
        else{
            visibleLayers = array.filter(visibleLayers,function(visibleLayer){
                return visibleLayer != layerInfoId;
            })
        }
        layer.setVisibleLayers(visibleLayers);
    }
});