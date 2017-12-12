/**
 * Created by Administrator on 2015/12/23.
 * 静态类，没有构造函数，获取svg图标字符串
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang"
],function(
    declare,
    lang
) {
    var svg = declare("widgets.svg", null, {});
    lang.mixin(svg, {
        polylineSVG: polylineSVG(),
        rectangleSVG: rectangleSVG(),
        polygonSVG:polygonSVG(),
        circleSVG:circleSVG(),
        printerSVG:printerSVG()
    });
    return svg;

    function polylineSVG() {
        return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="23px"height="23px" ' +
            'viewBox="0 0 23 23" enable-background="new 0 0 23 23" xml:space="preserve"> ' +
            '<polyline fill="none" stroke="#fa7f30" stroke-width="2" stroke-linecap="square" ' +
            'stroke-linejoin="round" stroke-miterlimit="10" ' +
            'points="3.5,19.5 6.625,13.781 12.188,13.504 5.469,6.875 16.9,9.74 19.5,3.5"/>' +
            '</' + 'svg>';
    }
    function rectangleSVG() {
        return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"' +
            ' xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="23px"height="23px" ' +
            'viewBox="0 0 23 23" enable-background="new 0 0 23 23" xml:space="preserve"> ' +
            '<rect x="3.5" y="3.5" display="inline" fill="none" stroke="#fa7f30" stroke-width="2" ' +
            'stroke-miterlimit="10" width="16" height="16"/>' + '</' + 'svg>';
    }
    function polygonSVG(){
        return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"' +
            ' xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="23px"height="23px" ' +
            'viewBox="0 0 23 23" enable-background="new 0 0 23 23" xml:space="preserve"> ' +
            '<polygon fill="none" stroke="#fa7f30" stroke-width="2" stroke-miterlimit="10" ' +
            'points="3.5,7.412 7.968,14.163 11.5,19.5 17.438,14.854 19.5,7.853 11.5,3.5 3.637,7.345"/>'
            +'</'+'svg>';
    }
    function circleSVG() {
        return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="23px"height="23px" ' +
            'viewBox="0 0 23 23" enable-background="new 0 0 23 23" xml:space="preserve"> ' +
            '<circle fill="none" stroke="#fa7f30" stroke-width="2" stroke-miterlimit="10" cx="11.5" ' +
            'cy="11.5" r="8"/>' + '</' + 'svg>';
    }
    function printerSVG() {
        return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="23px" height="23px" ' +
            'viewBox="0 0 23 23" enable-background="new 0 0 23 23" xml:space="preserve"> ' +
            '<rect x="7.041" y="2.592" fill="#FBFBFB" width="8.97" height="5.237"/> ' +
            '<rect x="6.999" y="15.734" fill="#FBFBFB" width="8.97" height="4.677"/> ' +
            '<rect x="4.425" y="7.843" fill="#F68841" width="14.117" height="4.738"/> ' +
            '<rect x="4.467" y="12.581" fill="#FBFBFB" width="14.116" height="3.153"/> ' +
            '<rect x="2.586" y="15.734" fill="#FBFBFB" width="2.493" height="2.014"/> ' +
            '<rect x="5.079" y="15.734" fill="#F68841" width="1.935" height="3.349"/> ' +
            '<rect x="15.962" y="15.734" fill="#F68841" width="1.936" height="3.349"/> ' +
            '<rect x="17.897" y="15.734" fill="#FBFBFB" width="2.492" height="2.014"/> ' +
            '<rect x="5.715" y="3.247" fill="#F68841" width="1.313" height="4.597"/> ' +
            '<rect x="16.008" y="3.247" fill="#F68841" width="1.257" height="4.597"/> ' +
            '<rect x="18.542" y="7.843" fill="#FFFFFF" width="1.872" height="7.891"/> ' +
            '<rect x="2.586" y="7.843" fill="#FFFFFF" width="1.872" height="7.891"/> ' +
            '<rect x="2.5" y="7.754" fill="#474747" width="0.086" height="10.098"/> ' +
            '<rect x="2.586" y="7.754" fill="#474747" width="3.043" height="0.088"/> ' +
            '<rect x="17.351" y="7.755" fill="#474747" width="3.065" height="0.088"/> ' +
            '<rect x="17.983" y="17.748" fill="#474747" width="2.431" height="0.089"/> ' +
            '<rect x="2.58" y="17.748" fill="#474747" width="2.431" height="0.089"/> ' +
            '<rect x="5.079" y="19.083" fill="#474747" width="1.835" height="0.089"/> ' +
            '<rect x="16.05" y="19.083" fill="#474747" width="1.856" height="0.089"/> ' +
            '<rect x="16.094" y="3.163" fill="#474747" width="1.171" height="0.089"/> ' +
            '<rect x="7.022" y="2.5" fill="#474747" width="8.989" height="0.089"/> ' +
            '<rect x="6.99" y="20.411" fill="#474747" width="8.988" height="0.089"/> ' +
            '<rect x="5.715" y="3.158" fill="#474747" width="1.226" height="0.089"/> ' +
            '<rect x="5.629" y="3.169" fill="#474747" width="0.086" height="4.681"/> ' +
            '<rect x="17.265" y="3.163" fill="#474747" width="0.086" height="4.681"/> ' +
            '<rect x="17.897" y="17.748" fill="#474747" width="0.086" height="1.409"/> ' +
            '<rect x="16.008" y="2.5" fill="#474747" width="0.086" height="0.747"/> ' +
            '<rect x="6.941" y="2.5" fill="#474747" width="0.086" height="0.747"/> ' +
            '<rect x="15.969" y="19.083" fill="#474747" width="0.086" height="1.41"/> ' +
            '<rect x="6.912" y="19.083" fill="#474747" width="0.087" height="1.41"/> ' +
            '<rect x="4.994" y="17.748" fill="#474747" width="0.085" height="1.409"/> ' +
            '<rect x="20.414" y="7.73" fill="#474747" width="0.086" height="10.101"/> </svg>';
    }
});