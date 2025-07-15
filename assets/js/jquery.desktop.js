// jquery.desktop.js

var JQD = (function($, window, document, undefined) {
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
      clock: function() {
        var clock = $('#clock');

        if (!clock.length) {
          return;
        }

        var date_obj = new Date();
        var hour = date_obj.getHours();
        var minute = date_obj.getMinutes();
        var day = date_obj.getDate();
        var year = date_obj.getFullYear();
        var suffix = 'AM';

        var weekday = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ];

        var month = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ];

        weekday = weekday[date_obj.getDay()];
        month = month[date_obj.getMonth()];

        if (hour >= 12) {
          suffix = 'PM';
        }

        if (hour > 12) {
          hour = hour - 12;
        } else if (hour === 0) {
          hour = 12;
        }

        if (minute < 10) {
          minute = '0' + minute;
        }

        var clock_time = weekday + ' ' + hour + ':' + minute + ' ' + suffix;
        var clock_date = month + ' ' + day + ', ' + year;

        clock.html(clock_time).attr('title', clock_date);

        setTimeout(JQD.init.clock, 60000);
      },
      desktop: function() {
        var d = $(document);

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

        d.on('contextmenu', function() {
          return false;
        });

        d.on('click', 'a', function(ev) {
          var url = $(this).attr('href');
          this.blur();

          if (url.match(/^#/)) {
            ev.preventDefault();
            ev.stopPropagation();
          } else {
            $(this).attr('target', '_blank');
          }
        });

        d.on('mousedown', 'a.menu_trigger', function() {
          if ($(this).next('ul.menu').is(':hidden')) {
            JQD.util.clear_active();
            $(this).addClass('active').next('ul.menu').show();
          } else {
            JQD.util.clear_active();
          }
        });

        d.on('mouseenter', 'a.menu_trigger', function() {
          if ($('ul.menu').is(':visible')) {
            JQD.util.clear_active();
            $(this).addClass('active').next('ul.menu').show();
          }
        });

        d.on('mousedown', 'a.icon', function() {
          JQD.util.clear_active();
          $(this).addClass('active');
        });

        d.on('dblclick', 'a.icon', function() {
          var x = $(this).attr('href');
          var y = $(x).find('a').attr('href');

          if ($(x).is(':hidden')) {
            $(x).remove().appendTo('#dock');
            $(x).show('fast');
          }

          JQD.util.window_flat();
          $(y).addClass('window_stack').show();
        });

        d.on('mouseenter', 'a.icon', function() {
          $(this).off('mouseenter').draggable({
            revert: false,
            containment: 'parent'
          });
        });

        d.on('click', '#dock a', function() {
          var x = $($(this).attr('href'));

          if (x.is(':visible')) {
            x.hide();
          } else {
            JQD.util.window_flat();
            x.show().addClass('window_stack');
          }
        });

        d.on('mousedown', 'div.window', function() {
          JQD.util.window_flat();
          $(this).addClass('window_stack');
        });

        d.on('mouseenter', 'div.window', function() {
          $(this).off('mouseenter').draggable({
            cancel: 'a',
            containment: 'parent',
            handle: 'div.window_top'
          }).resizable({
            containment: 'parent',
            minWidth: 400,
            minHeight: 200
          });
        });

        d.on('dblclick', 'div.window_top', function() {
          JQD.util.window_resize(this);
        });

        d.on('click', 'a.window_min', function() {
          $(this).closest('div.window').hide();
        });

        d.on('click', 'a.window_resize', function() {
          JQD.util.window_resize(this);
        });

        d.on('click', 'a.window_close', function() {
          $(this).closest('div.window').hide();
          $($(this).attr('href')).hide('fast');
        });

        d.on('mousedown', '#show_desktop', function() {
          if ($('div.window:visible').length) {
            $('div.window').hide();
          } else {
            $('#dock li:visible a').each(function() {
              $($(this).attr('href')).show();
            });
          }
        });

        $('table.data').each(function() {
          $(this).find('tbody tr:odd').addClass('zebra');
        });

        d.on('mousedown', 'table.data tr', function() {
          JQD.util.clear_active();
          $(this).closest('tr').addClass('active');
        });

        // Selection box feature
        let isDragging = false;
        let startX, startY;
        const $selectionBox = $('<div id="selection-box"></div>').appendTo('body').hide();

        const $desktop = $('#desktop');

        $desktop.on('mousedown', function(e) {
          if ($(e.target).closest('.icon, .window').length === 0) {
            JQD.util.clear_active();
            isDragging = true;
            startX = e.pageX;
            startY = e.pageY;
            $selectionBox.css({
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              display: 'block',
            });
            e.preventDefault();
          }
        });

        $(document).on('mousemove', function(e) {
          if (isDragging) {
            const x = Math.min(e.pageX, startX);
            const y = Math.min(e.pageY, startY);
            const width = Math.abs(e.pageX - startX);
            const height = Math.abs(e.pageY - startY);
            $selectionBox.css({
              left: x,
              top: y,
              width: width,
              height: height,
            });

            $('.icon').each(function() {
              const $icon = $(this);
              const iconOffset = $icon.offset();
              const iconWidth = $icon.outerWidth();
              const iconHeight = $icon.outerHeight();

              if (
                x < iconOffset.left + iconWidth &&
                x + width > iconOffset.left &&
                y < iconOffset.top + iconHeight &&
                y + height > iconOffset.top
              ) {
                $icon.addClass('selected');
              } else {
                $icon.removeClass('selected');
              }
            });
          }
        });

        $(document).on('mouseup', function() {
          if (isDragging) {
            isDragging = false;
            $selectionBox.hide();
          }
        });

        $desktop.on('mousedown', '.icon.selected', function(e) {
          const $selectedIcons = $('.icon.selected');

          if ($selectedIcons.length > 1) {
            e.preventDefault();
          }

          $selectedIcons.each(function() {
            $(this).data('originalPosition', $(this).position());
          });

          $selectedIcons.draggable({
            containment: 'parent',
            start: function(event, ui) {
              const startPosition = ui.position;
              $selectedIcons.each(function() {
                const $icon = $(this);
                const currentPosition = $icon.position();
                $icon.data('dragOffset', {
                  left: currentPosition.left - startPosition.left,
                  top: currentPosition.top - startPosition.top,
                });
              });
            },
            drag: function(event, ui) {
              const startPosition = ui.position;
              $selectedIcons.each(function() {
                const $icon = $(this);
                const offset = $icon.data('dragOffset');
                $icon.css({
                  left: startPosition.left + offset.left,
                  top: startPosition.top + offset.top,
                }).addClass('selected'); // Ensure icons stay visibly selected
              });
            },
            stop: function() {
              $selectedIcons.draggable('destroy');
            },
          });
        });
      },
      wallpaper: function() {
        if ($('#desktop').length) {
          $('body').prepend('<img id="wallpaper" class="abs" src="" />');
        }
      }
    },
    util: {
      clear_active: function() {
        $('a.active, tr.active').removeClass('active');
        $('ul.menu').hide();
        $('.icon.selected').removeClass('selected');
      },
      window_flat: function() {
        $('div.window').removeClass('window_stack');
      },
      window_resize: function(el) {
        var win = $(el).closest('div.window');

        if (win.hasClass('window_full')) {
          win.removeClass('window_full').css({
            'top': win.attr('data-t'),
            'left': win.attr('data-l'),
            'right': win.attr('data-r'),
            'bottom': win.attr('data-b'),
            'width': win.attr('data-w'),
            'height': win.attr('data-h')
          });
        } else {
          win.attr({
            'data-t': win.css('top'),
            'data-l': win.css('left'),
            'data-r': win.css('right'),
            'data-b': win.css('bottom'),
            'data-w': win.css('width'),
            'data-h': win.css('height')
          }).addClass('window_full').css({
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'width': '100%',
            'height': '100%'
          });
        }

        JQD.util.window_flat();
        win.addClass('window_stack');
      }
    }
  };
})(jQuery, this, this.document);

jQuery(document).ready(function() {
  JQD.go();
});
