/*
 *  jQuery Stickycolumn - v0.8
 *  A jQuery plugin to do something like position sticky, with constraints
 *  https://github.com/placenamehere/stickycolumn
 *
 *  Made by Chris Casciano
 *  Under MIT License
 */
;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "stickycolumn",
        defaults = {
          contentPadding: 0,
          viewportTop: 0,
          containerBottom: 0,
          prefix: "sc"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
      this.element = element;
      this.options = $.extend( {}, defaults, options );
      this._defaults = defaults;
      this._name = pluginName;
      this.initialized = false;
      this.useSticky = true;
      this.resize_event;
      this.doMaths = function($el) {
        var $parent = $el.parent(),
            maths = {
              offsetTopStart: 0,
              safeH: 9,
              start: 0,
              end: 0
            };

        maths.offsetTopStart = $parent.offset().top;
        maths.safeH = $el.height() + maths.offsetTopStart;
        maths.start = maths.offsetTopStart - this.getViewportTop();
        maths.end = ($parent.height() + $parent.offset().top) - $el.height() - this.getViewportTop() - this.getContainerBottom() - this.getContentPadding();

        return maths;
      };
      this.updatePosition = function($el,maths) {
        var winH = $(window).height(),
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (winH < maths.safeH) {

          if (!this.useSticky) {
            $el.css("top",0); // TODO: auto? better recover?
          }

          $el.removeClass(this.options.prefix+"-active");

        } else {

          if (!this.useSticky) {

            if (scrollTop < maths.start) {
              // adjust by scrolltop
              $el.css("top",maths.offsetTopStart - scrollTop);
            } else if (scrollTop > maths.end) {
              // adjust
              $el.css("top",(maths.offsetTopStart + maths.end) - scrollTop - maths.start);
            } else {
              $el.css("top",maths.offsetTopStart - maths.start);
            }

          }

          $el.addClass(this.options.prefix+"-active");

        }

      };
      this.getContentPadding = function() {
        return (typeof this.options.contentPadding === "function") ? this.options.contentPadding.call() : this.options.contentPadding;
      };
      this.getViewportTop = function() {
        return (typeof this.options.viewportTop === "function") ? this.options.viewportTop.call() : this.options.viewportTop;
      };
      this.getContainerBottom = function() {
        return (typeof this.options.containerBottom === "function") ? this.options.containerBottom.call() : this.options.containerBottom;
      };
      this.init();
    }

    Plugin.prototype = {
        init: function () {
          var _this = this,
              $supportTest,
              $el = $(_this.element),
              maths;

          if (!_this.initialized) {

            _this.initialized = true;

            // test for stocky support
            $supportTest = $("<div></div>");
            $supportTest.css("position","fixed");
            $supportTest.css("position","-webkit-sticky");
            $supportTest.css("position","sticky");
            if ($supportTest.css("position").indexOf("sticky") !== -1) {
              _this.useSticky = true;
            } else {
              $el.parent().addClass(_this.options.prefix+"-fixedcontainer");
              _this.useSticky = false;
            }


            // initial maths
            maths = _this.doMaths($el);
            _this.updatePosition($el,maths);


            // watch scroll events and reposition
            if (!_this.useSticky) {
              $(window).on("scroll.stickycolumn",function() {
                maths = _this.doMaths($el);
                _this.updatePosition($el,maths);
              });
            }

            // watch resize events and reset - f DRY
            $(window).on("resize.stickycolumn",function() {
              // redo initial maths
              maths = _this.doMaths($el);
              _this.updatePosition($el,maths);
            });
          }
        },
        update: function() {
          var _this = this,
              $el = $(_this.element),
              maths;

          maths = _this.doMaths($el);
          _this.updatePosition($el,maths);
        },
        setOptions: function(updatedOptions) {
          var _this = this,
              $el = $(_this.element),
              maths;

          _this.options = $.extend( {}, _this.options, updatedOptions );
          maths = _this.doMaths($el);
          _this.updatePosition($el,maths);
        },
        destroy: function() {
            var _this = this,
                $el = $(_this.element);

            // unbind events
            $(window).off("scroll.stickycolumn");
            $(window).off("resize.stickycolumn");

            // remove classes / reset css
            // $el.animate({ top: 0 },function() {
            $el.removeClass(_this.options.prefix+"-active");
            $el.parent().removeClass(_this.options.prefix+"-fixedcontainer");

            // remove data
            $el.removeData(_this.options.prefix+"OffsetTopStart")
                .removeData("plugin_"+_this._name);
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );
