~function($) {

var UI = $.popui
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
UI.delay         = delay
UI.str2Date      = str2Date
UI.date2Str      = date2Str
UI.getDay        = getDay
UI.getAfterDay   = getAfterDay
UI.getWeekByDate = getWeekByDate
UI.formatDate    = formatDate

UI.uiInitAll = function(selector) {
    UI.uiInitHover(selector)
    UI.uiInitTab(selector)
}

/*
 gloablPatch
*/
$(function() {
    if ( !/debug=global/.test(location.href) ) {
        $.ajax({
            url: 'http://fa.360buy.com/loadFa_toJson.js?aid=2_601_5095',
            dataType: 'script',
            scriptCharset: 'gbk',
            cache: true
        })
    }
})


}(jQuery);