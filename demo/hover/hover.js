/**
 *  放在项目共用js里，处理所有hover效果，鼠标置上时添加一个class，离开后移除class。
 *  设计为自执行是考虑项目中很多页面都有类似的功能，此时还有部分页面仅有这个hover效果功能，没有其它任何的js交互。
 *  此时如果为该页面写一个单独的js就不值当了，为此把配置从js文件放权到HTML文件里，通过data-ui属性去管理。
 *
 *  示例
 *  1. hover直接应用在li上，hover的class默认为"hover"
 *      <li data-ui="u-hover">
 *
 *  2. 应用在li上，hover的class改为curr
 *      <li data-ui="u-hover|&|curr"> 
 *
 *  3. 通过ul代理应用在li上，class为默认"hover"
 *      <ul data-ui="u-hover|li">
 *
 *  4. 通过ul代理应用在li上，class改为"curr"
 *      <ul data-ui="u-hover|li|curr">
 */
$(function() {
    function uiInitHover(selector) {
        var $hovers = $('[data-ui^="u-hover"]', selector)  
        $hovers.each(function() {
            var $elem = $(this)
            var dataUI = $elem.attr('data-ui')
            if (!dataUI) return
            var arr = $.uiParse(dataUI)
            // 是否更换默认hover的class
            var isDelegate = !!arr[0]
            // 代理元素的选择器
            var delegateSelector = arr[0]
            // hover时的class
            var curCls = arr[1] || 'hover'
            // 给子元素添加hover事件 
            if (isDelegate) {
                $elem.delegate(delegateSelector, 'mouseenter', function() {
                    $(this).addClass(curCls)
                }).delegate(delegateSelector, 'mouseleave', function() {
                    $(this).removeClass(curCls)
                })
            } else { // 自身添加hover事件 
                $elem.mouseenter(function() {
                    $elem.addClass(curCls)
                }).mouseleave(function() {
                    $elem.removeClass(curCls)
                })
            }
        })
    }
    // init
    uiInitHover()
    // export
    $.popui.uiInitHover = uiInitHover
});
