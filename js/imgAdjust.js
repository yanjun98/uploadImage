/*!
 * VERSION: 0.1.0
 * DATE: 201612-26
 * GIT:https://github.com/yanjun98/uploadImage
 *
 * @author: yanjun98@gmail.com
 **/
(function (factory) {

    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global);

    if (typeof define === 'function' && define.amd) {
        define(['Hammer', 'exports'], function (HAMMER, exports) {
            root.ImgAdjust = factory(root, exports, HAMMER);
        });
    } else if (typeof exports !== 'undefined') {
        var HAMMER = require('Hammer');
        factory(root, exports, HAMMER);
    } else {
        root.ImgAdjust = factory(root, {}, root.HAMMER);
    }

}(function (root, ImgAdjust, HAMMER) {
    function ImgAdjust(element, options) {
       this.options = {
            hx: 0,
            hy: 0,
            hs: 1,
            hr: 0,
        };
        this.crtPostion = {
          posX:0, posY:0, scale:1, rotation:0
        }
        this.element = element;

        options && typeof options == 'object' && this.setOptions(options);
        this.hammerInit(this.options.hx, this.options.hy, this.options.hs, this.options.hr);
    };

    ImgAdjust.prototype.setOptions = function(options){
        // shallow copy
        var o = this.options,
            key;

        for (key in options) options.hasOwnProperty(key) && (o[key] = options[key]);

        return this;
    };

    /*hammer init */
    ImgAdjust.prototype.hammerInit = function(hx, hy, hs, hr){
      console.log('hammer init');
      var _self = this;

      var hammertime = new Hammer(_self.element, {
          transform_always_block: true,
          drag_block_horizontal: true,
          drag_block_vertical: true,
          drag_min_distance: 1
      });
      console.log(hammertime);
      var posX = hx, 
          posY = hy, 
          last_posX = hx, 
          last_posY = hy, 
          endX = 0, 
          endY = 0, 
          scale = hs, 
          last_scale = hs,
          rotation = hr, 
          last_rotation = hr;
      var touchEd = false;
      hammertime.get('pan').set({ enable: true });
      hammertime.get('pinch').set({ enable: true });
      hammertime.get('rotate').set({ enable: true });

      var startRotate = 0;
      hammertime.on('rotatestart', function(ev) {
              // console.log(ev.rotation);
              startRotate = ev.rotation;
      });
      hammertime.on("tap panmove rotatemove pinchmove", function(ev) {
          var prevent = (endX == ev.deltaX && endY == ev.deltaY) ? true : false;
          switch(ev.type) {
              case 'tap':
                  last_scale = scale;
                  last_rotation = rotation;
                  last_posX = posX;
                  last_posY = posY;
                  touchEd = true;
                  break;
              case 'panmove':
                  posX = ev.deltaX + last_posX;
                  posY = ev.deltaY + last_posY;
                  _self.eleTrans(posX,posY,last_scale,last_rotation);
                  break;
              case 'rotatemove':
                  rotation = Math.abs(ev.rotation) != 180 ? (ev.rotation - startRotate) + last_rotation : last_rotation;
                  _self.eleTrans(last_posY, last_posY,scale,rotation);
                  break;
              case 'pinchmove':
                  scale = Math.max(0.4, Math.min(last_scale * ev.scale, 6));
                  rotation = Math.abs(ev.rotation) != 180 ? (ev.rotation - startRotate) + last_rotation : last_rotation;
                  _self.eleTrans(last_posX,last_posY,scale,rotation);
                  break;
          }
          hammertime.on('panend pinchend rotateend', function(ev){
              last_scale = scale;
              last_rotation = rotation;
              last_posX = posX;
              last_posY = posY;
              touchEd = true;
              endX = ev.deltaX;
              endY = ev.deltaY;
              if(ev.type != 'rotateend'){
                  _self.eleTrans(last_posX,last_posY,scale,rotation);
              }
          });
      });
      _self.eleTrans(hx, hy, hs, hr);

    };
    /*image element transform function handle*/
    ImgAdjust.prototype.eleTrans = function(posX, posY, scale, rotation){
        this.crtPostion = {
          posX:posX, posY:posY, scale:scale, rotation:rotation
        }
       var value = "translate3d("+posX+"px,"+posY+"px, 0) " + "scale("+scale+","+scale+") " + "rotate("+rotation+"deg) ";
        // console.log(value);
        this.element.style.webkitTransform = value;
        this.element.style.mozTransform = value;
        this.element.style.transform = value;
      
    }
    /*draw image after adjust with hamme*/
    ImgAdjust.prototype.drawImgAfterAdjust = function(_canvas){
      console.log(this.crtPostion);
      var _self = this;
      _self.cvs = _canvas;
      _self.ctx = _self.cvs.getContext('2d');

      _self.ctx.fillStyle="#000000";
      _self.ctx.fillRect(0,0,_self.cvs.width,_self.cvs.height);

      var angleInRadians = (Math.PI/180)*_self.crtPostion.rotation,
           x = _self.cvs.width / 2,
           y = _self.cvs.height / 2,
           width = _self.element.width,
           height = _self.element.height;

      _self.ctx.save();
      _self.ctx.translate(x+_self.crtPostion.posX, y+_self.crtPostion.posY);
      _self.ctx.rotate(angleInRadians);
      _self.ctx.scale(_self.crtPostion.scale,_self.crtPostion.scale);
      _self.ctx.drawImage(_self.element, -width / 2, -height / 2, width, height);
      _self.ctx.restore();

      // console.log(this.cvs.toDataURL("image/jpeg",0.7));
      // return this.cvs.toDataURL("image/jpeg",0.7);
    };

    ImgAdjust.prototype.destroy = function(){

    }



    return ImgAdjust;
}));
