/**
 * 旅行频道用于城市选择的suggest，国内城市/国际城市/酒店等
 *
 * **参数**
 *  showPinyin {Boolean} 是否显示拼音 默认true
 */
$.fn.citySuggest = function(option, callback) {
    var settings = $.extend({
        wrapCls: 'ac_results',
        currCls: 'ac_over',
        showPinyin: true
    }, option)

    function getCityInfo(key, source) {
        var result
        $.each(source, function(i, arr) {
            if (arr[0] == key || arr[1] == key || arr[2] == key || arr[3] == key) {
                result = arr
                return false
            }
        })
        return result
    }
    function filter(val, data, size) {
        var j = 0, temp = []
        for (var i = 0; i < data.length; i++) {
            var reg = RegExp('^' + val + '.*$', 'im')
            var arr = data[i]
            if (reg.test(arr[0]) || reg.test(arr[1]) || reg.test(arr[2]) || reg.test(arr[3])) {
                if (j >= size) break
                temp[j] = data[i][1]
                j++
            }
        }
        // 汉字排序有待研究
        temp = temp.sort()
        // 返回数组
        return $.map(temp, function(city) {
            var arr = getCityInfo(city, data)
            return {arr: arr}
        })
    }
    function renderHead(val, data) {
        if (data.length == 0) {
            return '<div class="gray ac_result_null">对不起，找不到：' + val + '</div>'
        } else {
            return '<div class="gray ac_result_tip" style="line-height:20px;">' + val + '，按拼音排序</div>'
        }
    }
    function renderItem(obj, liCls) {
        var arr   = obj.arr
        var id    = arr[0]
        var name  = arr[1]
        var pyin  = arr[2].toLowerCase()
        var $li   = $('<li>')
        var $span = $('<span>').text(pyin)
        var $a    = $('<a href="#"></a>')
        $li.attr('rel', id)
        $li.attr('data-val', name)
        // 是否显示拼音
        if (!settings.showPinyin) {
            $span.hide()
        }
        // append
        $a.append($span).append(name)
        $li.append($a)
        return $li
    }
    settings = $.extend(settings, {
        filter: filter,
        renderHead: renderHead,
        renderItem: renderItem
    })
    return this.each(function() {
        var $el = $(this)
        $el.suggest(settings, callback)
    })
};

$.fn.suggest.except = {
    '中文/拼音': 1
};