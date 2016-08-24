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
        $('.ul-wapper').css('overflow-x','scroll');
        ulWapperContent.css("width",width+30);
    }


    //新闻模块切换标题
    $('#news .nav-pills a').on('click',function(){
        //获取当前点击元素
        var title = $(this).data('title');
        $('#news .news-title').text(title);

    });

    //轮播图 手机上滑动的方向
    // 1. 获取手指在轮播图元素上的一个滑动方向（左右）



    // 获取界面上的轮播图容器
    var $carousels = $('.carousel');
    var startX, endX;
    var offset = 50;
    // 注册滑动事件
    $carousels.on('touchstart', function(e) {
        // 手指触摸开始时记录一下手指所在的坐标X
        startX = e.originalEvent.touches[0].clientX;
        // console.log(startX);
    });

    $carousels.on('touchmove', function(e) {
        // 变量重复赋值
        endX = e.originalEvent.touches[0].clientX;
        // console.log(endX);
    });
    $carousels.on('touchend', function(e) {
        console.log(e);
        // 结束触摸一瞬间记录最后的手指所在坐标X
        // 比大小
        // console.log(endX);
        // 控制精度
        // 获取每次运动的距离，当距离大于一定值时认为是有方向变化
        var distance = Math.abs(startX - endX);
        if (distance > offset) {
            // 有方向变化
            // console.log(startX > endX ? '←' : '→');
            // 2. 根据获得到的方向选择上一张或者下一张
            //     - $('a').click();
            //     - 原生的carousel方法实现 http://v3.bootcss.com/javascript/#carousel-methods
            $(this).carousel(startX > endX ? 'next' : 'prev');
        }
    });



});


