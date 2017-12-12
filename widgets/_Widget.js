/**
 * Created by 袁坤 on 2015/4/21.
 */

define([
  "dojo/_base/declare",
  "dijit/_Widget",
  "dijit/_TemplatedMixin",
  "dijit/_Container"
],function(
  declare,
  _Widget,
  _TemplatedMinxin){
  return declare("widgets._Widget",[_Widget,_TemplatedMinxin],{
    // map: esri/map||Object
    //    地图
    map:null,
    // map: esri/layers||Object
    //    父图层Id，默认没有父图层
    parentLayerId:-1,
    // layerIds: String[]
    //    Array of IDs corresponding to layers in the map,
    //    except for GraphicsLayers and FeatureLayers,
    //    which are maintained in map.graphicsLayerIds.
    layerIds:null,
    // LayerInfo: esri/layers/LayerInfo||Object
    //    Information about each layer in a map service
    graphicsLayerIds:null,
    startup: function () {
      this.inherited(arguments);
      this.updateLayers();
    },
    updateLayers: function () {
        /// <summary>
        /// 更新图层
        /// </summary>
      this._initLayerIds();
      this._initGraphicsLayerIds();
    },
    _initLayerIds: function () {
      if(this.map!=null) {
        this.layerIds = this.map.layerIds;
      }
    },
    _initGraphicsLayerIds: function () {
      if(this.map!=null) {
        this.graphicsLayerIds = this.map.graphicsLayerIds;
      }
    },
    _setMapAttr:function(/*esri/map||Object*/map){
      if(map) {
        this.map = map;
      }
    },
    _getMapAttr:function(){
      return this.map;
    },
    _setLayerIdsAttr: function (/*String[]*/layerIds) {
      if(layerIds){
        this.layerIds = layerIds;
      }
    },
    _setGraphicsLayerIdsAttr: function (/*String[]*/graphicsLayerIds) {
      if(graphicsLayerIds){
        this.graphicsLayerIds = graphicsLayerIds;
      }
    }
  })
});