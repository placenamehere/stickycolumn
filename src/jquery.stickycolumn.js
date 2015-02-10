// search for scroll parent, from jqueryUI
// https://github.com/jquery/jquery-ui/blob/9d0f44fd7b16a66de1d9b0d8c5e4ab954d83790f/ui/core.js#L55
;(function($) {
  $.fn.extend({
    scrollParent: function( includeHidden ) {
      var position = this.css( "position" ),
        excludeStaticParent = position === "absolute",
        overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
        scrollParent = this.parents().filter( function() {
          var parent = $( this );
          if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
            return false;
          }
          return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
        }).eq( 0 );

      return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
    }
  });
})(jQuery);

// sticky column plugin
;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "stickycolumn",
        defaults = {
          contentPadding: 0,
          viewportTop: 0,
          containerBottom: 0, // TODO: need?
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
        var $scrollParent = $el.scrollParent(),
            $parent = $el.parent(),
            maths = {
              parentStart: 0,
              parentEnd: 0,
              safeH: 0,
              start: 0,
              end: 0
            };

        // start of $parent measured from top of $scrollParent
        maths.parentStart = $parent.offset().top + $scrollParent.scrollTop() - (typeof $scrollParent.offset() !== "undefined" ? $scrollParent.offset().top : 0);
        // end of $parent measured from top of $scrollParent
        maths.parentEnd = maths.parentStart + $parent.height();
        // room needed to fit the content + top spacing
        maths.safeH = this.getContentHeight($el) + this.getViewportTop();

        // starting sticky @ calculated scrollTop of $scrollParent
        maths.start = maths.parentStart - this.getViewportTop();
        // ending sticky @ calculated scrollTop of $scrollParent
        maths.end = maths.parentEnd - this.getContentHeight($el) - this.getViewportTop();

        return maths;
      };
      this.updatePosition = function($el,maths) {
        var $scrollParent = $el.scrollParent(),
            scrollParentScrollTop = $scrollParent.scrollTop();


        if ($scrollParent.height() < maths.safeH) {
          // we're not safe at this time, don't position

          if (!this.useSticky) {
            $el.css("top",0); // Q: better way to recover from mid positioning to original?
          }

          $el.removeClass(this.options.prefix+"-active");

        } else {

          if (!this.useSticky) {

            if (scrollParentScrollTop < maths.start) {
              // not hit that sticky threshold, so position to match scroll position
              $el.css("top",0);
            } else if (scrollParentScrollTop > maths.end) {
              // adjust to whatever makes end at end of parent
              $el.css("top",maths.end-maths.start);
            } else {
              // adjust to whatever makes it right at viewport top
              $el.css("top",scrollParentScrollTop - maths.start);
            }

          }

          $el.addClass(this.options.prefix+"-active");

        }

      };
      this.getContentHeight = function($el) {
        return $el.height() + this.getContentPadding();
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
              $scrollParent = $el.scrollParent(),
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
              $($scrollParent).on("scroll.stickycolumn",function() {
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
