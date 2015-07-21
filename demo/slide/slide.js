/**
 * 滚动轮播插件
 * $(x).slide({
 *   visible:       // @number  可显示的图片数量
 *   direction:     // @string  滚动方向 x左右，y上下
 *   speed:         // @number  滚动时动画速度
 *   auto:          // @boolean 是否自动滚动
 *   stay:          // @string  自动播放的时间间隔
 *   hideControl:   // @boolean 无法(不足以)滚动时是否显示控制按钮
 *   content:       // @string  内容区域单个元素的选择器
 *   contentWrap:   // @string  包裹内容区域的容器选择器
 *   nav:           // @string  导航区域每个元素的选择器
 *   navWrap:       // @string  导航的包裹元素选择器
 *   navActiveCls:  // @string  当前导航的样式
 *   navEvent:      // @string  当行的事件类型，mouseenter/click
 *   btnPrev:       // @string  按钮-上一帧 选择器
 *   btnNext:       // @string  按钮-下一帧 选择器
 * })
 *
 */
~function() {

$.fn.slide = function(option, callback) {
    var defaults = {
        // 可见图片个数
        visible: 1,
        // 方向x,y
        direction: 'x',
        // 滚动速度
        speed: 300,
        // 是否自动播放
        auto: false,
        // 自动播放时间
        stay: 5000,
        // 无法(不足以)滚动时是否显示控制按钮
        hideControl: false,
        // 滚动元素的选择器
        content: '[data-ui="slide-item"]',
        // 包裹内容的元素容器
        contentWrap: '[data-ui="slide-wrap"]',
        // 是否显示滚动当前状态(如1,2,3,4,...)
        nav: '[data-ui="slide-nav"]',
        // 包围元素的class，默认为'scroll-nav-wrap'
        navWrap: '[data-ui="slide-nav-wrap"]',
        // 当前项目高亮class
        navActivedCls: 'cur',
        // 导航项目事件名称
        navEvent: 'click',
        // 按钮-上一张，默认为选择器字符串，或者是jQuery对象
        btnPrev: '[data-ui="btn-prev"]',        
        // 按钮-下一张，默认为选择器字符串，或者是jQuery对象
        btnNext: '[data-ui="btn-next"]',
        // 滚动到临边时是否自动禁用或隐藏按钮
        btnDisabledCls: ''
    }

    // 继承 初始化参数 - 替代默认参数
    var setting = $.extend(defaults, option)

    function bootstrap($that) {
        // some alias
        var visible     = setting.visible    
        var dir         = setting.direction
        var auto        = setting.auto 
        var speed       = setting.speed
        var btnPrev     = setting.btnPrev
        var btnNext     = setting.btnNext
        var nav         = setting.nav
        var navWrap     = setting.navWrap
        var hideControl = setting.hideControl
        var btnDisabledCls = setting.btnDisabledCls

        var $contentWrap = $that.find(setting.contentWrap)
        var $content     = $contentWrap.find(setting.content)
        var size         = $content.length

        var $btnNext = $that.find(btnNext)
        var $btnPrev = $that.find(btnPrev)

        var current = 0
        var total   = Math.ceil((size - visible) / visible) + 1

        var $navWrap = $that.find(navWrap)
        var hasNav   = $navWrap.length > 0
        var $nav     = $that.find(nav)
        var navClass = setting.navActivedCls
        var navEvent = setting.navEvent

        var liWidth, liHeight
        var timer

        /*
         * 重置下样式
         */
        function resetStyles(dir) {
            var $firstLi = $content.first()
            // 重置每个滚动列表项样式
            if ($firstLi.css('float') !== 'left') {
                $content.css('float', 'left')
            }

            // 重新设置滚动列表项高宽
            var outerWidth = $firstLi.outerWidth(true)
            var outerHeight = $firstLi.outerHeight()
            liWidth = setting.width || outerWidth
            liHeight = setting.height || outerHeight

            // 重置最外层可视区域元素样式
            var position = $contentWrap.css('position')
            // 包裹的宽高各自留余了300px
            $contentWrap.css({
                'position': position == 'static' ? 'relative' : position,
                'width': dir == 'x' ? (outerWidth * size + 300) : liWidth,
                'height': dir == 'x' ? liHeight : (outerHeight * size + 300),
                'top': 0,
                'left': 0,
                'overflow': 'hidden'
            })
        }

        /*
         * 重新初始化参数
         */
        function reInitSettings() {
            size = setting.data.length
            $content = $contentWrap.find(setting.content)
            total = Math.ceil((size - visible) / visible) + 1
        }

        // 滚动完成一帧回调
        function onEnd() {
            // 显示导航数字
            if (hasNav) {
                setCurrNav(current)
            }
            // 轮播不循环且拖动到顶部会尾部时左右箭头自动隐藏
            if (btnDisabledCls) {
                // 第一帧
                if (current == 0) {
                    $btnPrev.addClass(btnDisabledCls)
                    $btnNext.removeClass(btnDisabledCls)
                }
                // 最后一帧
                if (current == total-1) {
                    $btnPrev.removeClass(btnDisabledCls)
                    $btnNext.addClass(btnDisabledCls)
                }
                // 非第一帧和最后一帧
                if (current!=0 && current!=total-1) {
                    $btnNext.add($btnPrev).removeClass(btnDisabledCls)
                }
            }
            // event
            $that.trigger('switch', current)
        }

        function goRB() {
            current++
            if (auto) {
                if (current == total) {
                    current = 0
                }
            } else {
                if (current == total) {
                    current--
                    return
                }
            }
            going(current)
        }

        function goLT() {
            current--
            if (auto) {
                if (current == -1) {
                    current = total-1
                }
            } else {
                if (current == -1) {
                    current++
                    return
                }
            }   
            going(current)
        }

        function going(idx) {
            // 滚动下一帧位移量
            var nextFrame = dir == 'x' ? {
                left: -idx * visible * liWidth
            } : {
                top:  -idx * visible * liHeight
            }
            // 最后一帧依据剩下的数量滚动
            if (idx == total-1) {
                var last = $content.slice(idx*visible).length
                var numb = (idx-1) * visible + last
                nextFrame = dir == 'x' ? {
                    left: -numb * liWidth
                } : {
                    top: -numb * liHeight
                }
            }
            // 动画滚动
            $contentWrap.animate(nextFrame, speed, onEnd)            
        }

        /*
         * 显示数字分页1,2,3,4,5,6...
         * 数字导航外层div的class
         * 数字导航当前页高亮class
         */
        function addNav(navWrap, active) {
            // 页面结构里已存在就不在创建了
            if ($nav.length) {
                $nav.each(function(i, el) {
                    $(el).attr('data-i', i)
                })
            } else {
                for (var i = 0; i < total; i++) {
                    var $li = $('<li>').attr('data-i', i)
                    $.isFunction(nav) ? $li.append(nav(i)) : $li.text(i+1)
                    if (i === 0) {
                        $li.addClass(active)
                    }
                    $navWrap.append($li)
                }                
            }
        }

        // 设置当前状态的数字导航与分页
        function setCurrNav(i) {
            if (hasNav) {
                $navWrap.find(nav).removeClass(navClass).eq(i).addClass(navClass)
            }
        }

        function play() {
            timer = setInterval(function() {
                goRB()
            }, setting.stay)
        }

        function stop() {
            clearInterval(timer)
        }

        function bindEvent() {
            // 左右按钮
            var prevHander = $.debounce(function() {
                goLT()
            }, 200, true)
            var nextHander = $.debounce(function() {
                goRB()
            }, 200, true)


            if (!hideControl) {
                $btnPrev.unbind('click').bind('click', prevHander)
                $btnNext.unbind('click').bind('click', nextHander)
            }

            if (auto) {
                $btnPrev.mouseover(function() {
                    stop()
                }).mouseout(function() {
                    play()
                })
                $btnNext.mouseover(function() {
                    stop() 
                }).mouseout(function() {
                    play()
                });
                $content.mouseover(function() {
                    stop()
                }).mouseout(function() {
                    play()
                })
                play()
            }

            var navHander = $.debounce(going, 200, true)
            if (hasNav && navEvent) {         
                $navWrap.delegate(nav, navEvent, function() {
                    var idx = $(this).attr('data-i')
                    current = idx
                    navHander(idx)
                })
                if (auto) {
                    $navWrap.mouseover(function() {
                        stop()
                    }).mouseout(function() {
                        play()
                    })                    
                }
            }
        }

        function hideButton() {
            $btnNext.add($btnPrev).hide()
        }

        // 初始化滚动
        if (total > 1) {
            // 可以滚动
            resetStyles(dir)
            bindEvent()
            if (hasNav) {
                addNav(navWrap, navClass)
            }
            if (btnDisabledCls) {
                $btnPrev.addClass(btnDisabledCls)
            }
        } else {
            // 无法滚动
            hideButton()
        }

        if (hideControl) {
            hideButton()
        }
    }

    // 实例化每个滚动对象
    return this.each(function() {
        var $elem = $(this)
        bootstrap($elem)
        if ($.isFunction(callback)) callback($elem)
    })
}

/*
 * 自动初始化，配置参数按照使用频率先后排序，即最经常使用的在前，不经常使用的往后，使用默认参数替代
 * 
 * 格式：data-ui="u-slide|visible|auto|direction|navEvent|btnDisabledCls|btnPrev|btnNext|"
 * 示例：data-ui="u-slide|2|false|x|"
 *
 * 如果字段设为默认使用 &
 * 如：data-ui="u-slide|2|&|&|.nav|.content|"
 */
$(function() {
    $('[data-ui^="u-slide"]').each(function() {
        var $self = $(this)
        var arr = $.uiParse($self.attr('data-ui'))
        var option = {}
        option.visible = arr[0]
        option.auto    = arr[1]
        if (arr[2] !== undefined) {
            option.direction = arr[2]    
        }
        if (arr[3] !== undefined) {
            option.navEvent = arr[3]
        }         
        if (arr[4] !== undefined) {
            option.btnDisabledCls = arr[4]
        }

        // if (arr[4] !== undefined) {
        //     option.btnPrev = arr[4]    
        // }
        // if (arr[5] !== undefined) {
        //     option.btnNext = arr[5]    
        // }
        $self.slide(option)
    })
})

}();