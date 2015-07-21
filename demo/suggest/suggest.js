/**
 * 输入提示组件，该组件为基础组件，在此基础上可以扩展自定义的输入提示
 *
 * **参数**
 *    
 *  wrapCls    {String} 指定外层包裹元素的className
 *  ulCls      {String} 指定ul的className
 *  liCls      {String} 指定li的className
 *  currCls    {String} 指定当前li的className
 *  width      {Number} suggest的宽度，默认和输入域input一样宽，指定该参数时会优先使用
 *  size       {Number} suggest的显示个数，默认10
 *  dataArr    {Array}  suggest数据，数组内部结构可自定义，该数据格式会影响renderItem
 *  delay      {Number} 输入时渲染延迟时间
 *  blurDelay  {Number} 离开输入域时延迟隐藏的时间
 *  url        {String} ajax suggest请求url，url会覆盖dataArr的数据
 *  keyName    {String} ajax suggest参数名称
 *  getParam   {Function} 请求额外需要的参数
 *  renderHead {Function} 自定义头部函数，有的suggest头部会有提示信息，该函数须返回html片段或jq对象
 *  renderFoot {Function} 自定义头部函数，有的suggest底部会带一个关闭按钮，该函数须返回html片段或jq对象
 *  renderItem {Function} 自定义每个item的html渲染
 *  renderNone {Function} 无结果是自定义的提示
 *  filter     {Function} 过滤dataArr，返回一个新数组
 *  fixScroll  {String}   (undefined|fix|hide) 滚动条滚动时处理方式，可选。默认不处理，fix自动调整位置，hide则隐藏
 * 
 * **事件**
 *  choose  选中后触发，包括点击选中和enter
 *
 * **方法**
 * 
 * **更新日志**
 *   2015.04.08 增加renderNone参数，支持无结果时提示
 *   2015.05.11 增加fixScroll参数，对滚动事件的处理
 */
~function($, window) {

$.fn.suggest = function(option, callback) {
    // default settings
    var setting = $.extend({
        // 指定外层包裹元素的className
        wrapCls: 'suggest-wrap',
        // 指定ul的className
        ulCls: 'suggest-parent',
        // 指定li的className
        liCls: 'suggest-item',
        // 指定当前li的className
        currCls: 'curr',
        // suggest的宽度，默认和输入域input一样宽，指定该参数时会优先使用
        width: null,
        // suggest的显示个数，默认10
        size: 10,
        // 数据，数组格式，数组内部对象任意结构
        dataArr: [],        
        // 输入时渲染延迟时间
        delay: 10,
        // 离开输入域时延迟隐藏的时间
        blurDelay: 200,
        // ajax suggest请求url，url会覆盖dataArr的数据
        url: '',
        // ajax suggest参数名称
        keyName: 'key',
        // 显示头部，有的suggest头部会有提示信息
        renderHead: null,
        // 显示底部，有的suggest底部会带一个关闭按钮
        renderFoot: null,
        // 自定义每个item的html渲染
        renderItem: null,
        // 自定义无结果提示
        renderNone: null,
        // 自定义过滤规则
        filter: null
    }, option)

    // dom & reg 
    var $win = $(window)
    var reg1 = /^13$|^9$/
    var reg2 = /27$|38$|40$/

    // 去掉所有的html
    function removeHTML(str) {
        return str.replace(/<[^>]+>?/g, '')
    }

    function bootstrap($input) {
        var wrapCls    = setting.wrapCls
        var ulCls      = setting.ulCls
        var liCls      = setting.liCls
        var currCls    = setting.currCls
        var width      = setting.width
        var blurDelay  = setting.blurDelay
        var delay      = setting.delay
        var url        = setting.url
        var keyName    = setting.keyName
        var getParam   = setting.getParam
        var withDraw   = setting.withDraw
        var dataArr    = setting.dataArr
        var size       = setting.size
        var filter     = setting.filter
        var renderItem = setting.renderItem
        var renderHead = setting.renderHead
        var renderNone = setting.renderNone
        var fixScroll  = setting.fixScroll

        if ( $input.data('hasSuggest') ) return

        // 禁用浏览器默认的文本框自动完成功能
        $input.attr('autocomplete', 'off')

        // suggest wrapper
        var $wrapper = $('<div>').addClass(wrapCls)

        // cache ajax result
        var cache = {}

        // current select
        var $current = null
        var timeout  = null

        // 默认的 item 创建方式
        if (!renderItem) {
            renderItem = function(obj) {
                var text = obj.text
                var val  = obj.val
                return $('<li>').addClass(liCls).text(text).attr('data-val', val)
            }
        }

        function init() {
            $wrapper.appendTo('body')
            // event
            $win.load(setPosition).resize(setPosition)
            $input.blur(function() {
                setTimeout(function(){ hide() }, blurDelay)
            })
            $input.keyup(processKey)
            $input.click(function() {
                hide()
            })
            $wrapper.delegate('li', 'mouseover', function() {
                $wrapper.find('li').removeClass(currCls)
                $(this).addClass(currCls)                
            }).delegate('li', 'click', function(ev) {
                ev.preventDefault()
                ev.stopPropagation()
                selectCurrent()
            })
            // 滚动条时也调整
            switch (fixScroll) {
                case 'fix': 
                    $win.scroll(setPosition)
                    break
                case 'hide':
                    $win.scroll(hide)
                    break
                default:;
            }
            // sign
            $input.data('hasSuggest', true)
            // exporst popui
            $input.data('suggest', $wrapper)
        }

        function processKey(e) {
            var val = $input.val()
            var keyCode = e.keyCode
            if ((reg2.test(keyCode) && $wrapper.is(':visible')) || (reg1.test(keyCode) && getCurrent())) {
                e.preventDefault()
                e.stopPropagation()
                switch(keyCode) {
                    case 38: // up
                        prevResult()
                        break
                    case 40: // down
                        nextResult()
                        break
                    case 13: // return
                        selectCurrent()
                        break
                    case 27: // escape
                        hide()
                        break
                }
            } else {
                if (timeout) clearTimeout(timeout)
                timeout = setTimeout(render, delay)
            }
        }

        function render() {
            var val = $.trim($input.val())
            var param = {}
            if (getParam) {
                param = $.extend(param, getParam())
            }
            param[keyName] = val
            // 为空字符或placehodler的文本时忽视
            if (val == '' || val in $.fn.suggest.except) { 
                hide()
                return
            }
            if (url) {
                // 优先从缓存取
                if (cache[val]) {
                    show(val, cache[val])
                } else {
                    $.getJSON(url, param, function(data) {
                        var arr = withDraw(data)
                        if (arr.length == 0 && !renderNone) {
                            hide()            
                        } else {
                            show(val, arr)
                            cache[val] = arr                            
                        }
                    })
                }
            } else {
                show(val, dataArr)
            }
        }

        // 隐藏 suggest
        function hide() {
            $wrapper.hide()
        }

        // 显示 suggest
        function show(val, data) {
            var val = removeHTML(val)
            var offset = $input.offset()

            $wrapper.empty().append('<ul>')
            var $ul = $wrapper.find('ul').addClass(ulCls)

            // 自定义过滤规则
            if (filter) {
                data = filter(val, data, size)
            }
            $.each(data, function(i, obj) {
                if (i == size) return false
                var $li = renderItem(obj, liCls)
                $ul.append($li)
            })

            if (renderHead) {
                var head = renderHead(val, data)
                $wrapper.prepend(head)
            }
            if (data.length == 0 && renderNone) {
                var $none = renderNone(val, data)
                $ul.append($none)
            }

            setPosition()
            $ul.find('li:first-child').addClass(currCls)
            $wrapper.show()
        }

        // 设置位置
        function setPosition() {
            var input  = $input[0]
            var offset = $input.offset()
            var offsetWidth  = input.offsetWidth
            var offsetHeight = input.offsetHeight           
            $wrapper.css({
                top: (offset.top + offsetHeight) + 'px',
                left: offset.left + 'px',
                width: width || (offsetWidth - 2)
            })
        }

        // 选取当前的 item
        function selectCurrent() {
            $current = getCurrent()
            if ($current) {
                var val = $current.attr('data-val')
                $wrapper.hide()
                $input.val(val)
                $input.attr('data-val', $current.attr('rel'))
                $wrapper.trigger('choose', [val, $current])
            }
        }

        // 获取当前的 item
        function getCurrent() {
            if (!$wrapper.is(':visible')) return false
            $current = $wrapper.find('li.' + currCls)
            if (!$current.length) {
                $current = false
            }
            return $current
        }

        // 下一个 item
        function nextResult() {
            $current = getCurrent()
            if ($current) {
                $current
                    .removeClass(currCls)
                    .next()
                    .addClass(currCls)
            } else {
                $wrapper.find('li:first-child').addClass(currCls)
            }
        }

        // 上一个 item
        function prevResult() {
            $current = getCurrent()
            if ($current) {
                $current
                    .removeClass(currCls)
                    .prev()
                    .addClass(currCls)
            } else {
                $wrapper.find('li:last-child').addClass(currCls)
            }
        }

        // initialize
        init()
    }

    return this.each(function() {
        var $elem = $(this)
        bootstrap($elem)
        if ($.isFunction(callback)) callback($elem)
    })
}

// 屏蔽的单词
$.fn.suggest.except = {}

}(jQuery, this);