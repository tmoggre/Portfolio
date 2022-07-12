//
// Namespace - Module Pattern.
//
var JQD = (function($, window, document, undefined) {
  // Expose innards of JQD.
  return {
    go: function() {
      for (var i in JQD.init) {
        JQD.init[i]();
      }
    },
    init: {
      frame_breaker: function() {
        if (window.location !== window.top.location) {
          window.top.location = window.location;
        }
      },
      //
      // Initialize the desktop.
      //
      desktop: function() {
        // Alias to document.
        var d = $(document);

        // Cancel mousedown.
        d.mousedown(function(ev) {
          var tags = [
            'a',
            'button',
            'input',
            'select',
            'textarea',
            'tr'
          ].join(',');

          if (!$(ev.target).closest(tags).length) {
            JQD.util.clear_active();
            ev.preventDefault();
            ev.stopPropagation();
          }
        });

        // Cancel right-click.
        d.on('contextmenu', function() {
          return false;
        });

        // Relative or remote links?
        d.on('click', 'a', function(ev) {
          var url = $(this).attr('href');
          this.blur();

          if (url.match(/^#/)) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          else {
            $(this).attr('target', '_blank');
          }
        });

        // Cancel single-click.
        d.on('mousedown', 'a.icon', function() {
          // Highlight the icon.
          JQD.util.clear_active();
          $(this).addClass('active');
        });

        // Respond to double-click.
        d.on('dblclick', 'a.icon', function() {
          // Get the link's target.
          var x = $(this).attr('href');
          var y = $(x).find('a').attr('href');

          // Bring window to front.
          JQD.util.window_flat();
          $(y).addClass('window_stack').show();
        });

        // Respond to double-click inside window.
        d.on('dblclick', 'a.iconex', function() {
          // Get the link's target.
          var x = $(this).attr('href');
          var y = $(x).find('a').attr('href');

          // Bring window to front.
          JQD.util.window_flat();
          $(y).addClass('window_stack').show();
        });

        // Respond to click clippy.
        d.on('click', 'a.social', function() {
          // Get the link's target.
          var x = $(this).attr('href');
          var y = $(x).find('a').attr('href');

          // Bring window to front.
          JQD.util.window_flat();
          $(y).addClass('window_stack').show();
        });

        // Make icons draggable.
        d.on('mouseenter', 'a.icon', function() {
          $(this).off('mouseenter').draggable({
            revert: false,
            containment: 'parent'
          });
        });

        // Focus active window.
        d.on('mousedown', 'div.window', function() {
          // Bring window to front.
          JQD.util.window_flat();
          $(this).addClass('window_stack');
        });

        // Make windows draggable.
        d.on('mouseenter', 'div.window', function() {
          $(this).off('mouseenter').draggable({
            // Confine to desktop.
            // Movable via top bar only.
            cancel: 'a',
            containment: 'parent',
            handle: 'div.window_top'
          }).resizable({
            containment: 'parent',
            minWidth: 400,
            minHeight: 200
          });
        });

        // Double-click top bar to resize
        d.on('dblclick', 'div.window_top', function() {
          JQD.util.window_resize(this);
        });

        // Maximize or restore the window.
        d.on('click', 'a.window_resize', function() {
          JQD.util.window_resize(this);
        });

        // Close the window.
        d.on('click', 'a.window_close', function() {
          $(this).closest('div.window').hide();
          $($(this).attr('href')).hide('fast');
        });

        
        // Close the window clippy.
        d.on('click', 'a.window_closex', function() {
          $(this).closest('div.windowx').hide();
          $($(this).attr('href')).hide('fast');
        });

        $('table.data').each(function() {
          // Add zebra striping, ala Mac OS X.
          $(this).find('tbody tr:odd').addClass('zebra');
        });

        d.on('mousedown', 'table.data tr', function() {
          // Clear active state.
          JQD.util.clear_active();

          // Highlight row, ala Mac OS X.
          $(this).closest('tr').addClass('active');
        });
      },
      wallpaper: function() {
        // Add wallpaper last, to prevent blocking.
        if ($('#desktop').length) {
          $('body').prepend('<img id="wallpaper" class="abs" />');
        }
      }
    },
    util: {
      //
      // Clear active states, hide menus.
      //
      clear_active: function() {
        $('a.active, tr.active').removeClass('active');
        $('ul.menu').hide();
      },
      //
      // Zero out window z-index.
      //
      window_flat: function() {
        $('div.window').removeClass('window_stack');
      },
      //
      // Resize modal window.
      //
      window_resize: function(el) {
        // Nearest parent window.
        var win = $(el).closest('div.window');

        // Is it maximized already?
        if (win.hasClass('window_full')) {
          // Restore window position.
          win.removeClass('window_full').css({
            'top': win.attr('data-t'),
            'left': win.attr('data-l'),
            'right': win.attr('data-r'),
            'bottom': win.attr('data-b'),
            'width': win.attr('data-w'),
            'height': win.attr('data-h')
          });
        }
        else {
          win.attr({
            // Save window position.
            'data-t': win.css('top'),
            'data-l': win.css('left'),
            'data-r': win.css('right'),
            'data-b': win.css('bottom'),
            'data-w': win.css('width'),
            'data-h': win.css('height')
          }).addClass('window_full').css({
            // Maximize dimensions.
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'width': '100%',
            'height': '100%'
          });
        }

        // Bring window to front.
        JQD.util.window_flat();
        win.addClass('window_stack');
      }
    }
  };
// Pass in jQuery.
})(jQuery, this, this.document);

//
// Kick things off.
//
jQuery(document).ready(function() {
  JQD.go();
});