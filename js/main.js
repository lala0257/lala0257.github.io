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
});