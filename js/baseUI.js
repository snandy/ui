~function(win, doc, $) {

var px = 'px'
var body = doc.body
var docElem = doc.documentElement

// namespace
var UI = $.popui = {}

UI.plugin = '__POPUI__'

// 一些常量
var reDate = /^\d{4}\-\d{1,2}\-\d{1,2}/
var weekArr1 = ['周日','周一','周二','周三','周四','周五','周六']
var weekArr2 = ['星期日', '星期一','星期二','星期三','星期四','星期五','星期六']

function delay(func, wait, context) {
    setTimeout(function() {
        func.call(context)
    }, wait)
}
/*
 * 日期字符串转成Date对象
 * @param {String} str
 *   "2014-12-31" 
 *   "2014/12/31"
 * @return {Date} 
 */
function str2Date(str) {
    var date = null
    if (reDate.test(str)) {
        date = str.replace(/-/g, '/')
    }
    return new Date(date)
}
/*
 * 日期对象转成字符串
 * @param {Date} new Date()
 * @return {string} "2014-12-31" 
 */
function date2Str(date, split) {
    split = split || '-'
    var y = date.getFullYear()
    var m = getTwoBit(date.getMonth() + 1)
    var d = getTwoBit(date.getDate())
    return [y, m, d].join(split)    
}
/*
 * 补齐数字位数
 * @param {number|string} n 需要补齐的数字
 * @return {string} 补齐两位后的字符
 */
function getTwoBit(n) {
    return (n > 9 ? '' : '0') + n
}
/*
 * 返回日期格式字符串
 * @param {Number} 0返回今天的日期、1返回明天的日期，2返回后天得日期，依次类推
 * @return {string} '2014-12-31'
 */
function getDay(i) {
    i = i || 0
    var date = new Date
    var diff = i * (1000 * 60 * 60 * 24)
    date = new Date(date.getTime() + diff)
    return date2Str(date)
}
/*
 * 返回明天日期字符串
 * @param  {String} '2014-12-30'
 * @return {String} '2014-12-31'
 */
function getAfterDay(str) {
    var curr = str2Date(str)
    var next = curr.getTime() + (1000 * 60 * 60 * 24)
    next = new Date(next)
    return date2Str(next)
}
/*
 * 根据Date对象获取周几
 * @param date {Date|String} 如 '2014-12-22'
 * @return '周一' 或 '星期一'
 */ 
function getWeekByDate(date, isFormal) {
    var obj = null
    if (typeof date == 'string') {
        obj = str2Date(date)
    } else if (date instanceof Date) {
        obj = date
    }
    var num = obj.getDay()
    return isFormal ? weekArr2[num] : weekArr1[num]
}
/*
 * 根据date返回字符串格式日期，可含中文星期
 */ 
function formatDate(date, hasDay) {
    var day = null
    if (typeof date === 'string') {
        date = str2Date(date)
    }
    var str = date2Str(date)
    if (hasDay) {
        day = weekArr1[date.getDay()]
        str += ' ' + day
    }
    return str
}

// exports
$.extend(UI, {
    delay: delay,
    str2Date: str2Date,
    date2Str: date2Str,
    getDay: getDay,
    getAfterDay: getAfterDay,
    getWeekByDate: getWeekByDate,
    formatDate: formatDate,
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

UI.uiInitAll = function(selector) {
    UI.uiInitHover(selector)
    UI.uiInitTab(selector)
}

}(window, document, jQuery);