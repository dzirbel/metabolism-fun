var TRACKER_ICONS = 5;
var ICON_MAX_LEVEL = 3;
var TRACKER_ANIMATION = 500;

function refreshTrackers()
{
    TRACKER.find('.tracker:not(.actions):not(.energy-storage)').each(function() {
        var total = 0;
        var res = $(this).res();
        var resource = resources[res];
        $(this).find('.organ').each(function() {
            var amountElem = $(this).find('.amount');
            var amount = resource.amounts[$(this).organ()];
            var prevAmount = parseInt(amountElem.text());
            var change = amount - prevAmount;
            amountElem.text(amount);
            total += amount;

            updateTrackerIcons($(this).find('.icons'), res, change);
        });
        
        $(this).find('.total').text(total);
    });

    TRACKER.find('.tracker.energy-storage').each(function() {
        var total = 0;
        $(this).find('.organ').each(function() {
            var res = $(this).res();
            if (isNaN(res)) {
                return;
            }

            var amount = resources[res].amounts[$(this).organ()];
            $(this).find('.amount').text(amount);
            total += amount;
        });

        $(this).find('.total').text(total);
    });
}

function updateTrackerIcons(icons, resource, change, level) {
    if (typeof level === 'undefined') {
        if (change > 0) {
            var icon = createIcon(resource, 1);

            var left = 0;
            icons.find('.icon').each(function() {
                left += $(this).width();
            });

            icons.append(icon);
            icon.velocity(
                { left: left, opacity: 1 },
                TRACKER_ANIMATION,
                function() {
                    updateTrackerIcons(icons, resource, change, 1);
                }
            );
        }
    } else {
        if (level < ICON_MAX_LEVEL && 
            icons.find('[level=' + level + ']').length >= TRACKER_ICONS) {
            var left = 0;
            icons.find('[level!=' + level + ']').each(function() {
                left += $(this).width();
            });

            var icon = createIcon(resource, level + 1).css('left', left);
            icons.append(icon);
            icon.velocity({ opacity: 1 }, TRACKER_ANIMATION);

            $.when(icons.find('[level=' + level + ']').velocity(
                { left : left, opacity: 0 },
                TRACKER_ANIMATION)
            ).then(function() {
                icons.find('[level=' + level + ']').remove();
                updateTrackerIcons(icons, resource, change, level + 1);
            });
        } else {
            updateTrackerIcons(icons, resource, change - 1);
        }
    }
}

function createIcon(resource, level)
{
    return $('<img>')
        .addClass('icon')
        .attr('alt', '')
        .attr('res', resource)
        .attr('level', level)
        .each(function() {
            updateIcon($(this));
        });
}

function updateIcon(icon)
{
    $.ajax({
        url: '/index.php/site/trackerIcon',
        type: 'POST',
        dataType: 'json',
        data: {
            resource_id: icon.res(),
            level: icon.attr('level'),
            theme_type: getColorTheme().type
        },
        success: function(data) {
            icon.attr('src', data.src);
        }
    });
    return icon;
}
