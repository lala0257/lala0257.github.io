/**
 * Created by Administrator on 2016/8/22.
 */
'use strict';
$(function(){
    function resize(){
        var windowWidth = $(window).width();
        var isSmallScreen = windowWidth<768;
        $('#carousel-example-generic .carousel-inner .item').each(function(k,v){
            var data_src="";
            if(isSmallScreen){
                data_src = $(v).find('img').attr('data-image-xs');
            }else{
                data_src = $(v).find('img').attr('data-image-lg');
            }
            $(v).find('img').attr("src",data_src);
        });
    }
    $(window).on('resize',resize).trigger('resize');

    //初始tooltips插件
    $('[data-toggle="tooltip"]').tooltip();

    //控制标签容器宽度

    var ulWapperContent = $('.nav-tabs');
    var width = 0;
    ulWapperContent.children().each(function(index,element){
        width += $(element).width();
    });

    //判断当前ul的宽是否超出屏幕
    if(width>$(window).width()){
        ulWapperContent.css("width",width+20);
    }

});


