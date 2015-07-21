/*
 *  marquee
 */
~function() {

$.fn.marquee = function(option, callback) {
    var defaults = {
        direction: 'up',
        speed: 10,
        auto: false,
        width: null,
        height: null,
        step: 1,
        control: false,
        btnPrev: '[data-ui="btn-prev"]',
        btnNext: '[data-ui="btn-next"]',
        btnStop: '[data-ui="btn-stop"]',
        btnContinue: '[data-ui="btn-continue"]',
        wrapstyle: '',
        stay: 5000,
        delay: 20,
        dom: ['ul', 'li'],
        tag: false,
        convert: false,
        btn: null,
        disabledCls: 'disabled',
        pos: {
            object: null,
            clone: null
        }
    }

    // override
    var settings = $.extend(defaults, option)

    function bootstrap($that) {
        // some alias
        var dir     = settings.direction
        var sWid    = settings.width
        var sHei    = settings.height
        var sDom    = settings.dom
        var auto    = settings.auto
        var step    = settings.step
        var posObj  = settings.pos
        var btnPrev = settings.btnPrev
        var btnNext = settings.btnNext
        var btnStop = settings.btnStop
        var btnContinue = settings.btnContinue
        var disabledCls = settings.disabledCls

        // DOM
        var $cloneWrap   = null
        var $contentWrap = $that.find(sDom[0])
        var $content     = $that.find(sDom[1])
        var $btnPrev     = $that.find(btnPrev)
        var $btnNext     = $that.find(btnNext)
        var $btnStop     = $that.find(btnStop)
        var $continue    = $that.find(btnContinue)

        // some timer
        var mainTimer, subTimer

        var height = $contentWrap.outerHeight()
        var contentWidth  = $content.outerWidth()
        var contentHeight = $content.outerHeight()

        if (dir == 'up' || dir == 'down') {
            $contentWrap.css({
                width: sWid + 'px',
                overflow: 'hidden'
            })
            var frameSize = step * contentHeight
        }
        if (dir == 'left' || dir == 'right') {
            var width = $content.length * contentWidth
            $contentWrap.css({
                width: width + 'px',
                overflow: 'hidden'
            })
            var frameSize = step * contentWidth
        }
        function init() {
            var sty = 'position:relative;overflow:hidden;z-index:1;width:' + sWid + 'px;height:' + sHei + 'px;' + settings.wrapstyle
            var wrap = '<div style="' + sty + '"></div>'
            $contentWrap.css({
                position: 'absolute',
                left: 0,
                top: 0
            }).wrap(wrap)
            posObj.object = 0
            $cloneWrap = $contentWrap.clone()
            $contentWrap.after($cloneWrap)
            switch (dir) {
                case 'up':
                    $contentWrap.css({
                        marginLeft: 0,
                        marginTop: 0
                    })
                    $cloneWrap.css({
                        marginLeft: 0,
                        marginTop: height + 'px'
                    })
                    posObj.clone = height
                    break
                case 'down':
                    $contentWrap.css({
                        marginLeft: 0,
                        marginTop: 0
                    })
                    $cloneWrap.css({
                        marginLeft: 0,
                        marginTop: -height + 'px'
                    })
                    posObj.clone = -height
                    break
                case 'left':
                    $contentWrap.css({
                        marginTop: 0,
                        marginLeft: 0
                    })
                    $cloneWrap.css({
                        marginTop: 0,
                        marginLeft: width + 'px'
                    })
                    posObj.clone = width;
                    break;
                case 'right':
                    $contentWrap.css({
                        marginTop: 0,
                        marginLeft: 0
                    })
                    $cloneWrap.css({
                        marginTop: 0,
                        marginLeft: -width + 'px'
                    })
                    posObj.clone = -width
                    break
            }
            if (auto) {
                initMainTimer()
                $contentWrap.hover(function() {
                    clear(mainTimer)
                }, function() {
                    initMainTimer()
                })
                $cloneWrap.hover(function() {
                    clear(mainTimer)
                }, function() {
                    initMainTimer()
                })
            }
            if (settings.control) initControl()
        }
        function initMainTimer(delay) {
            clear(mainTimer)
            settings.stay = delay ? delay : settings.stay
            mainTimer = setInterval(function() {
                initSubTimer()
            }, settings.stay)
        }
        function initSubTimer() {
            clear(subTimer)
            subTimer = setInterval(function() {
                rollAlong()
            }, settings.delay)
        }
        function clear(timer) {
            if (timer) {
                clearInterval(timer)
            }
        }
        function _parseInt(str) {
            return parseInt(str, 10)
        }
        function disControl(boo) {
            if (boo) {
                $btnPrev.unbind('click')
                $btnNext.unbind('click')
                $btnStop.unbind('click')
                $continue.unbind('click')
            } else {
                initControl()
            }
        }
        function initControl() {
            $btnPrev.click(function() {
                $btnPrev.addClass(disabledCls)
                disControl(true)
                clear(mainTimer)
                settings.convert = true
                settings.btn = 'front'
                initSubTimer()
                if (!auto) {
                    settings.tag = true
                }
                convert()
            })
            $btnNext.click(function() {
                $btnNext.addClass(disabledCls)
                disControl(true)
                clear(mainTimer)
                settings.convert = true
                settings.btn = 'back'
                initSubTimer()
                if (!auto) {
                    settings.tag = true
                }
                convert()
            })
            $btnStop.click(function() {
                clear(mainTimer)
            })
            $continue.click(function() {
                initMainTimer()
            })
        }
        function convert() {
            if (settings.tag && settings.convert) {
                settings.convert = false
                if (settings.btn == 'front') {
                    if (dir == 'down') {
                        dir = 'up'
                    }
                    if (dir == 'right') {
                        dir = 'left'
                    }
                }
                if (settings.btn == 'back') {
                    if (dir == 'up') {
                        dir = 'down'
                    }
                    if (dir == 'left') {
                        dir = 'right'
                    }
                }
                if (auto) {
                    initMainTimer()
                } else {
                    initMainTimer(4 * settings.delay)
                }
            }
        }
        function setPos(y1, y2, x) {
            if (x) {
                clear(subTimer)
                posObj.object  = y1
                posObj.clone   = y2
                settings.tag = true
            } else {
                settings.tag = false
            }
            if (settings.tag) {
                if (settings.convert) {
                    convert()
                } else {
                    if (!auto) {
                        clear(mainTimer)
                    }
                }
            }
            if (dir == 'up' || dir == 'down') {
                $contentWrap.css({
                    marginTop: y1 + 'px'
                });
                $cloneWrap.css({
                    marginTop: y2 + 'px'
                })
            }
            if (dir == 'left' || dir == 'right') {
                $contentWrap.css({
                    marginLeft: y1 + 'px'
                });
                $cloneWrap.css({
                    marginLeft: y2 + 'px'
                })
            }
        }
        function rollAlong() {
            var ul       = $contentWrap[0]
            var cl       = $cloneWrap[0]
            var ulSty    = ul.style
            var clSty    = cl.style
            var ulMargin = (dir == 'up' || dir == 'down') ? _parseInt(ulSty.marginTop) : _parseInt(ulSty.marginLeft)
            var clMargin = (dir == 'up' || dir == 'down') ? _parseInt(clSty.marginTop) : _parseInt(clSty.marginLeft)
            var yAdd     = Math.max(Math.abs(ulMargin - posObj.object), Math.abs(clMargin - posObj.clone))
            var yCeil    = Math.ceil((frameSize - yAdd) / settings.speed)
            switch (dir) {
                case 'up':
                    if (yAdd == frameSize) {
                        setPos(ulMargin, clMargin, true)
                        $btnPrev.removeClass(disabledCls)
                        disControl(false)
                    } else {
                        if (ulMargin <= -height) {
                            ulMargin = clMargin + height
                            posObj.object = ulMargin
                        }
                        if (clMargin <= -height) {
                            clMargin = ulMargin + height
                            posObj.clone = clMargin
                        }
                        setPos((ulMargin - yCeil), (clMargin - yCeil))
                    }
                    break
                case 'down':
                    if (yAdd == frameSize) {
                        setPos(ulMargin, clMargin, true)
                        $btnNext.removeClass(disabledCls)
                        disControl(false)
                    } else {
                        if (ulMargin >= height) {
                            ulMargin = clMargin - height
                            posObj.object = ulMargin
                        }
                        if (clMargin >= height) {
                            clMargin = ulMargin - height
                            posObj.clone = clMargin
                        }
                        setPos((ulMargin + yCeil), (clMargin + yCeil))
                    }
                    break
                case 'left':
                    if (yAdd == frameSize) {
                        setPos(ulMargin, clMargin, true)
                        $btnPrev.removeClass(disabledCls)
                        disControl(false)
                    } else {
                        if (ulMargin <= -width) {
                            ulMargin = clMargin + width
                            posObj.object = ulMargin
                        }
                        if (clMargin <= -width) {
                            clMargin = ulMargin + width
                            posObj.clone = clMargin
                        }
                        setPos((ulMargin - yCeil), (clMargin - yCeil))
                    }
                    break
                case 'right':
                    if (yAdd == frameSize) {
                        setPos(ulMargin, clMargin, true)
                        $btnNext.removeClass(disabledCls)
                        disControl(false)
                    } else {
                        if (ulMargin >= width) {
                            ulMargin = clMargin - width
                            posObj.object = ulMargin
                        }
                        if (clMargin >= width) {
                            clMargin = ulMargin - width
                            posObj.clone = clMargin
                        }
                        setPos((ulMargin + yCeil), (clMargin + yCeil))
                    }
                    break
            }
        }
        if (dir == 'up' || dir == 'down') {
            if (height >= sHei && height >= step) {
                init()
            }
        }
        if (dir == 'left' || dir == 'right') {
            if (width >= sWid && width >= step) {
                init()
            }
        }
    }

    return this.each(function() {
        var $that = $(this)
        bootstrap($that)
        if (callback) callback($that)
    })
}

}();