/**
 * 焦点图
 * $(x).focusPic({
 *   auto:       // @boolean 是否自动切换，默认false
 *   evtType:    // @string  默认mouseover，鼠标移动到上面时切换，可选click
 *   currCls:    // @string  默认cur
 *   nav:        // @string  tab的css属性选择器的key，默认为 tab-nav
 *   content:    // @string  tab content的css属性选择器的key，默认为 tab-content
 *   arrow:      // @string  tab-arrow 切换时动态移动效果
 *   stay:       // @number  自动切换的时间间隔
 *   defIndex:   // @number  默认显示的tab,
 *   animate:    // @boolean 切换效果[none: 默认无动画效果，直接隐藏和显示；fade: 淡出淡入，zIndex: 使用绝对定位zIndex方式切换]
 * })
 *
 */

~function() {

$.fn.focusPic = function(option, callback) {
    var setting = $.extend({
        nav: '[data-ui=focus-nav]',
        content: '[data-ui=focus-content]',
        stay: 5000,
        animate: 'fade'
    }, option)
    return this.each(function() {
        var $elem = $(this)
        var $bgImg = $elem.find('[data-ui=focus-bg]')
        $elem.tab(setting, callback)
        if ($bgImg.length) {
            $elem.bind('switch', function(e, i) {
                $bgImg.hide()
                $bgImg.eq(i).show()
            })
        }
    })
}

/*
 * 自动初始化，配置参数按照使用频率先后排序，即最经常使用的在前，不经常使用的往后，使用默认参数替代
 * 
 * 格式：data-ui="u-focusPic|evtType|currCls|auto|stay|nav|content|defIndex"
 * 示例：data-ui="u-focusPic|click|curr|true|2000|.nav|.content|"
 *
 * 如果字段设为默认使用 &
 * 如：data-ui="u-focusPic|click|&|&|.nav|.content|"
 */
$(function() {
    $('[data-ui^="u-focusPic"]').each(function() {
        var $elem   = $(this)
        var arr = $.uiParse($elem.attr('data-ui'))
        // 切换事件默认是mouseenter
        var evtType = arr[0]
        // 当前样式class
        var currCls = arr[1]
        // 是否自动切换，默认是false
        var auto = arr[2]
        // 自动切换的时间间隔
        var stay = arr[3] && arr[3]-0
        // 页签头部选择器
        var nav  = arr[4]
        // 页签内容部分选择器
        var con  = arr[5]
        // 默认显示第几个页签
        var cur  = arr[6]
        // create
        $elem.focusPic({
            evtType: evtType,
            currCls: currCls,
            auto: auto,
            stay: stay,
            nav: nav,
            content: con,
            defIndex: cur
        })
    })
})


}();
