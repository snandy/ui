~function(win, doc, $) {

var px = 'px'
var body = doc.body
var docElem = doc.documentElement

// namespace
var UI = $.popui = {}

$.extend(UI, {
    endsWith: function(str, suffix) {
        var l = str.length - suffix.length;
        return l >= 0 && str.indexOf(suffix, l) == l;
    }
})

/*
 * 浏览器判断
 */
var browser = function(ua) {
    var b = {
        sogou: /se/.test(ua),
        opera: /opera/.test(ua),
        chrome: /chrome/.test(ua),
        firefox: /firefox/.test(ua),
        maxthon: /maxthon/.test(ua),
        tt: /TencentTraveler/.test(ua),
        ie: /msie/.test(ua) && !/opera/.test(ua),
        safari: /webkit/.test(ua) && !/chrome/.test(ua)
    }
    var mark = ''
    for (var i in b) {
        if (b[i]) {
            mark = 'safari' == i ? 'version' : i
            break
        }
    }
    var reg = RegExp('(?:' + mark + ')[\\/: ]([\\d.]+)')
    b.version = mark && reg.test(ua) ? RegExp.$1 : '0'

    var iv = parseInt(b.version, 10)
    for (var i = 6; i < 11; i++) {
        b['ie'+i] = iv === i
    }
    return b
}(navigator.userAgent.toLowerCase())
$.extend($, browser)
/*
 * 函数节流，控制间隔时间
 */
$.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result
    var later = function() {
        var last = $.now() - timestamp
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last)
        } else {
            timeout = null
            if (!immediate) {
                result = func.apply(context, args)
                context = args = null
            }
        }
    }
    return function() {
        context = this
        args = arguments
        timestamp = $.now()
        var callNow = immediate && !timeout
        if (!timeout) timeout = setTimeout(later, wait)
        if (callNow) {
            result = func.apply(context, args)
            context = args = null
        }

        return result
    }
}
/*
 * 函数节流，控制执行频率
 */
$.throttle = function(func, wait, options) {
    var context, args, result
    var timeout = null
    var previous = 0
    if (!options) options = {}
    var later = function() {
        previous = options.leading === false ? 0 : $.now()
        timeout = null
        result = func.apply(context, args)
        context = args = null
    }
    return function() {
        var now = $.now()
        if (!previous && options.leading === false) {
            previous = now
        }
        var remaining = wait - (now - previous)
        context = this
        args = arguments
        if (remaining <= 0 || remaining > wait) {
            clearTimeout(timeout)
            timeout = null
            previous = now
            result = func.apply(context, args)
            context = args = null
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
        }
        return result
    }
}
/*
 * 获取浏览器窗口的可视尺寸
 */
$.getViewSize = function() { 
    return {
        width: win['innerWidth'] || docElem.clientWidth,
        height: win['innerHeight'] || docElem.clientHeight
    }
}
/*
 * 获取浏览器窗口的实际尺寸，包含滚动条
 */
$.getRealView = function() {
    return {
        width: Math.max(docElem.clientWidth, body.scrollWidth, docElem.scrollWidth),
        height: Math.max(docElem.clientHeight, body.scrollHeight, docElem.scrollHeight)
    }
}
/*
 * 让任意元素居中
 */
$.fn.center = function(option, callback) {
    var setting = $.extend({}, option)
    var position = setting.position || 'fixed'
    var $win = $(win)

    function fixIE6($el) {
        $el[0].style.position = 'absolute'
        $win.scroll(function() {
            move($el)
        })
    }
    function move($that) {
        var that = $that[0]
        var size = $.getViewSize()
        var x = (size.width)/2 - (that.clientWidth)/2
        var y = (size.height)/2 - (that.clientHeight)/2
        if ($.ie6) {
            var scrollTop = docElem.scrollTop || document.body.scrollTop
            y += scrollTop
        }
        $that.css({
            top: y + px,
            left: x + px
        })
    }
    function init($that, option) {
        $that.css({
            position: position
        }).show()
        // ie6 don't support position 'fixed'
        if (position === 'fixed' && $.ie6) {
            fixIE6($that)
        }
        move($that)
    }
    return this.each(function() {
        var $that = $(this)
        init($that, option)
        if (callback) callback($that)
    })
}

$.fn.inputFocus = function() {
    return this.each(function() {
        var $el = $(this)
        if ($el.is('input')|| $el.is('textarea')) {
            setTimeout(function() {
                $el[0].focus()
            }, 100)
        }
    })
}
/*
 * JSON Parse ，非严格的JSON格式转换
 */
$.JSONParse = function(str) {
    try {
        return (new Function('return ' + str))()
    } catch(e) {
    }
}
/*
 * 返回主机名
 */
$.getHost = function() {
    return 'http://' + location.host + '/'
}
/*
 * 获取POPUI的组件对象，为一个jq对象
 */
$.fn.getPopUI = function(name) {
    return this.data(name)
}
/*
 * 滚到到指定元素位置
 *
 * **参数**
 *   diffTop:  设置误差值
 *   duration: 动画滚动时间
 */
$.fn.rollSelf = function(option) {
    var setting = $.extend({
        diffTop: 0,
        duration: 350
    }, option)
    var diffTop  = setting.diffTop
    var duration = setting.duration
    var offset   = this.offset()
    $('html,body').animate({
        scrollTop: offset.top - diffTop + 'px'
    }, duration)
}
/*
 * 解析data-ui的属性值
 */
$.uiParse = function(action) {
    var arr = action.split('|').slice(1)
    var len = arr.length
    var res = [], exs
    var boo = /^(true|false)$/
    for (var i = 0; i < len; i++) {
        var item = arr[i]
        if (item == '&') {
            item = undefined
        } else if (exs = item.match(boo)) {
            item = exs[0] == 'true' ? true : false
        }
        res[i] = item
    }
    return res
}

}(window, document, jQuery);