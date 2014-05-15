;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "stickycolumn",
        defaults = {
          contentPadding: 0,
          start: 0,
          prefix: "sc"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
      this.element = element;
      this.options = $.extend( {}, defaults, options );
      this._defaults = defaults;
      this._name = pluginName;
      this.initialized = false;
      this.resize_event;
      this.doMaths = function($el) {
        var $parent = $el.parent(),
            maths = {
              offsetLeftStart: 0,
              offsetTopStart: 0,
              safeH: 9,
              end: 0
            };


        if (this.initialized) {
          maths.offsetLeftStart = $el.data(this.options.prefix+"OffsetLeftStart");
          maths.offsetTopStart = $el.data(this.options.prefix+"OffsetTopStart");
        } else {
          this.initialized = true;
          maths.offsetLeftStart = ($el.offset().left / $(window).width() * 100)+"%";
          maths.offsetTopStart = $el.offset().top;
          $el
            .data(this.options.prefix+"OffsetLeftStart",maths.offsetLeftStart)
            .data(this.options.prefix+"OffsetTopStart",maths.offsetTopStart);
        }

        maths.safeH = $el.height() + maths.offsetTopStart;
        maths.end = ($parent.height() + $parent.offset().top) - $el.height() - this.options.start - this.getContentPadding();

        return maths;
      };
      this.updatePosition = function($el,maths) {
        var winH = $(window).height(),
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (winH < maths.safeH) {
          $el.removeClass(this.options.prefix+"-active");
          $el.css("left",0);
          $el.css("top",0);

        } else {
          $el.css("left",maths.offsetLeftStart);

          if (scrollTop < this.options.start) {
            // adjust by scrolltop
            $el.css("top",maths.offsetTopStart - scrollTop);
          } else if (scrollTop > maths.end) {
            // adjust
            $el.css("top",(maths.offsetTopStart + maths.end) - scrollTop - this.options.start);
          } else {
            $el.css("top",maths.offsetTopStart - this.options.start);
          }

          $el.addClass(this.options.prefix+"-active");
        }

      };
      this.getContentPadding = function() {
        return (typeof this.options.contentPadding === "function") ? this.options.contentPadding.call() : this.options.contentPadding;
      };
      this.init();
    }

    Plugin.prototype = {
        init: function () {
            var _this = this,
                $el = $(_this.element),
                maths;

            // initial maths
            maths = _this.doMaths($el);
            _this.updatePosition($el,maths);

            // watch scroll events and reposition
            $(window).on("scroll.stickycolumn",function() {
              _this.updatePosition($el,maths);
            });

            // watch resize events and reset - f DRY
            $(window).on("resize.stickycolumn",function() {
              // redo initial maths
              maths = _this.doMaths($el);
              _this.updatePosition($el,maths);
            });
        },
        destroy: function() {
            var _this = this,
                $el = $(_this.element);

            // unbind events
            $(window).off("scroll.stickycolumn");
            $(window).off("resize.stickycolumn");

            // remove classes / reset css
            $el.animate({ top: 0, left: 0 },function() {
              $el.removeClass(_this.options.prefix+"-active");
            });


            // remove data
            $el.removeData(_this.options.prefix+"OffsetLeftStart")
                .removeData(_this.options.prefix+"OffsetTopStart")
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
