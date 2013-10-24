/*
 *  jQuery Stickycolumn - v0.5
 *  A jQuery plugin to do something like position sticky, with constraints
 *  https://github.com/placenamehere/simpleaccordion
 *
 *  Made by Chris Casciano
 *  Under MIT License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "stickycolumn",
        defaults = {
          contentPadding: 0,
          prefix: "sc"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
      this.element = element;
      // jQuery has an extend method which merges the contents of two or
      // more objects, storing the result in the first object. The first object
      // is generally empty as we don't want to alter the default options for
      // future instances of the plugin
      this.options = $.extend( {}, defaults, options );
      this._defaults = defaults;
      this._name = pluginName;
      this.init();
    }

    Plugin.prototype = {
        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).

            var _this = this,
                $el = $(_this.element),
                $parent = $el.parent(),
                elH,
                winH,
                offsetLeftStart,
                offsetTopStart,
                safeH,
                start = 46,
                end = 500,
                scrollTop;

            // initial maths

            elH = $el.height();
            winH = $(window).height();
            offsetLeftStart = ($el.data(_this.options.prefix+"OffsetLeftStart") === null) ? $el.data(_this.options.prefix+"OffsetLeftStart") : ($el.offset().left / $(window).width() * 100)+"%";
            $el.data(_this.options.prefix+"OffsetLeftStart",offsetLeftStart);
            offsetTopStart = ($el.data(_this.options.prefix+"OffsetTopStart") === null) ? $el.data(_this.options.prefix+"OffsetTopStart") : $el.offset().top;
            $el.data(_this.options.prefix+"OffsetTopStart",offsetTopStart);
            safeH = elH + offsetTopStart;
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;


            // bottom of sticky item should match bottom of container
            end = ($parent.height() + $parent.offset().top) - elH - start - _this.options.contentPadding;

            // set current styles accordingly
            if (winH < safeH) {
              $el.removeClass(_this.options.prefix+"-active");
              $el.css("left",0);
              $el.css("top",0);

            } else {
              $el.css("left",offsetLeftStart);

              if (scrollTop < start) {
                // adjust by scrolltop
                $el.css("top",offsetTopStart - scrollTop);
              } else if (scrollTop > end) {
                // adjust
                $el.css("top",(offsetTopStart + end) - scrollTop);
              } else {
                $el.css("top",offsetTopStart - start);
              }

              $el.addClass(_this.options.prefix+"-active");
            }



            // watch scroll events and reposition
            $(window).on("scroll",function() {
              scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              if (scrollTop < start) {
                // adjust by scrolltop
                $el.css("top",offsetTopStart - scrollTop);
              } else if (scrollTop > end) {
                // adjust
                $el.css("top",(offsetTopStart + end) - scrollTop);
              } else {
                $el.css("top",offsetTopStart - start);
              }
            });


            // watch resize events and reset - f DRY
            $(window).on("resize",function() {
              // initial maths

              elH = $el.height();
              winH = $(window).height();
              offsetLeftStart = ($el.data(_this.options.prefix+"OffsetLeftStart") === null) ? $el.data(_this.options.prefix+"OffsetLeftStart") : ($el.offset().left / $(window).width() * 100)+"%";
              // offsetLeftStart = $el.offset().left;
              $el.data(_this.options.prefix+"OffsetLeftStart",offsetLeftStart);
              offsetTopStart = ($el.data(_this.options.prefix+"OffsetTopStart") === null) ? $el.data(_this.options.prefix+"OffsetTopStart") : $el.offset().top;
              $el.data(_this.options.prefix+"OffsetTopStart",offsetTopStart);
              safeH = elH + offsetTopStart;
              scrollTop = window.pageYOffset || document.documentElement.scrollTop;


              // bottom of sticky item should match bottom of container
              end = ($parent.height() + $parent.offset().top) - elH - start;

              // set current styles accordingly
              if (winH < safeH) {
                $el.removeClass(_this.options.prefix+"-active");
                $el.css("left",0);
                $el.css("top",0);

              } else {
                $el.css("left",offsetLeftStart);

                if (scrollTop < start) {
                  // adjust by scrolltop
                  $el.css("top",offsetTopStart - scrollTop);
                } else if (scrollTop > end) {
                  // adjust
                  $el.css("top",(offsetTopStart + end) - scrollTop);
                } else {
                  $el.css("top",offsetTopStart - start);
                }

                $el.addClass(_this.options.prefix+"-active");
              }
            });


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
