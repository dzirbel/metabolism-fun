var COLOR_INCREASE = "72,144,229";
var COLOR_DECREASE = "232,12,15";
var TRACKER_ICONS = 5;
var TRACKER_WAIT = 300;         // the amount of time between tracker animations, in ms
var TRACKER_ANIMATION = 600;    // the duration of a tracker animtion, in ms

var activeResource = null;
var selectedResource = false;

$(document).ready(function() {
    refreshResources();

    $('.resource-data').hover(function() {
        var res = $(this).attr('value');
        var t = setTimeout(function() {
            if (!selectedResource) {
                activeResource = res;
                updateResourceVisual();
            }
        }, 700);
        $(this).data('timeout', t);
    }, function() {
        clearTimeout($(this).data('timeout'));
        if (!selectedResource) {
            activeResource = null;
            updateResourceVisual();
        }
    });

    $('.resource-data').click(function() {
        if (selectedResource && activeResource == $(this).attr('value')) {
            selectedResource = false;
            activeResource = null;
        } else {
            if (selectedResource) {
                activeResource = null;
                updateResourceVisual();
            }

            selectedResource = true;
            activeResource = $(this).attr('value');
        }
        updateResourceVisual();
    });

    $('#resource-visual-close').click(function(e) {
        activeResource = null;
        updateResourceVisual();
        e.stopPropagation();
    });

    $('#resource-visual-header').click(function() {
        $(this).siblings('#resource-visual').slideToggle({
            progress: function() {
                updateScrollbars(false, true, false);
            },
            complete: function() {
                updateScrollbars(false, false, true);
            }
        });
    });
});

function refreshResources(resources)
{
    if (typeof resources === 'undefined') {
        $('.resource-holder').find('.resource-data').each(function() {
            onResourceChange(
                $(this).attr('value'),
                $(this).parents('.resource-holder').attr('value'),
                parseInt($(this).find('.resource-value').html())
            );
        });
    } else {
        for (var resource in resources) {
            for (var organ in resources[resource]) {
                var value = resources[resource][organ];
                onResourceChange(resource, organ, value);
            }
        }
    }
    refreshPathways();
}

function onResourceChange(resource, organ, value)
{
    var change = value - getResourceValue(resource, organ);
    var elem = getResourceElement(resource, organ);
    var color = change > 0 ? COLOR_INCREASE : COLOR_DECREASE;
    if (change == 0) {
        if (elem.attr('init')) {
            color = false;
            elem.removeAttr('init');
        } else {
            return;
        }
    }
    
    if (color) {
        elem.animate({ boxShadow : "0 0 5px 5px rgb("+color+")" }, function() {
            elem.animate({ boxShadow : "0 0 5px 5px rgba("+color+", 0)" });
        });
    }

    elem.find('.resource-value').text(value);
    elem.find('.bar').css('width', Math.min(100, 100*(value/parseInt(elem.attr('max-shown')))) + '%');

    var tracker = $('.tracker[res-id="' + resource + '"]');
    if (tracker.length) {
        updateTracker(resource, organ, value, change, tracker);
    }
}

function getResourceElement(resource, organ)
{
    if (typeof organ === 'undefined') {
        if (isResourceGlobal(resource)) {
            var holder = $('.resource-holder.global');
        } else {
            var holder = $('.resource-holder[value="' + $('.accordian-content.active').attr('value') + '"]');
        }
    } else {
        var holder = $('.resource-holder[value="' + organ + '"]');
    }

    return holder.find('.resource-data[value="' + resource + '"]');
}

function getResourceValue(resource, organ)
{
    return parseInt(getResourceElement(resource, organ).find('.resource-value').html());
}

function getResourceName(resource, organ)
{
    return getResourceElement(resource, organ).find('.resource-name').html();
}

function isResourceGlobal(resource)
{
    return $('.resource-holder.global').find('.resource-data[value="' + resource + '"]').length > 0;
}

function updateResourceVisual(newOrgan)
{
    var visual = $('#resource-visual');
    var header = $('#resource-visual-header');

    if (newOrgan) {
        if (activeResource !== null && !isResourceGlobal(activeResource)) {
            header.find('.resource-visual-amount').text(getResourceValue(activeResource, newOrgan));
        }
    } else {
        if (activeResource === null) {
            $('.resource-visual-content').fadeOut(function() {
                $(this).remove();
            });
            header.find('.resource-visual-title').text('Resource');
            header.find('.resource-visual-amount').text('');

            $('.pathway.source').each(function() {
                highlightSource($(this).attr('value'), false);
            });

            $('.pathway.destination').each(function() {
                highlightDestination($(this).attr('value'), false);
            });
        } else {
            $.ajax({
                url: 'index.php/site/resourceVisual',
                type: 'POST',
                dataType: 'json',
                data: {
                    resource_id: activeResource,
                },
                success: function(data) {
                    if (activeResource == data.resource) {
                        visual.append(data.visual);
                        $('.resource-visual-content[value="' + data.resource + '"]').fadeIn();
                        header.find('.resource-visual-title').text(data.resource_name);
                        header.find('.resource-visual-amount').text(getResourceValue(data.resource));

                        for (var i = 0; i < data.sources.length; i++) {
                            highlightSource(data.sources[i].id, true);
                        }

                        for (var i = 0; i < data.destinations.length; i++) {
                            highlightDestination(data.destinations[i].id, true);
                        }
                    }
                }
            });
        }
    }
}

function updateTracker(resource, organ, amount, change, tracker)
{
    tracker.find('.organ[organ-id="' + organ + '"]').find('.amount').text(amount);

    var total = 0;
    tracker.find('.amount').each(function() {
        total += parseInt($(this).text());
    });

    tracker.find('.total').text(total);

    if (change > 0) {
        var counter = 0;

        var trackerOrgan = tracker.find('.organ[organ-id="' + organ + '"]');
        var iconHolder = trackerOrgan.find('.icons');

        function updateTrackerIcons() {
            if (counter++ < change) {
                var level1 = createIcon(resource, 1, iconHolder.find('.level1').length + 1);

                var left = 0;
                iconHolder.find('.tracker-icon').each(function() {
                    left += $(this).width();
                });
                
                iconHolder.append(level1);

                level1.animate({ left: left, opacity: 1 }, TRACKER_ANIMATION, function() {
                    if (iconHolder.find('.level1').length >= TRACKER_ICONS) {
                        var left = 0;
                        iconHolder.find('.level3,.level2').each(function() {
                            left += $(this).width();
                        });

                        var level2 = createIcon(resource, 2, iconHolder.find('.level2').length + 1).css('left', left);

                        iconHolder.append(level2);

                        level2.animate({ opacity: 1 }, TRACKER_ANIMATION);

                        $.when(iconHolder.find('.level1').animate({ left: left, opacity: 0.5 }, TRACKER_ANIMATION)).then(function() {
                            iconHolder.find('.level1').remove();
                            if (iconHolder.find('.level2').length >= TRACKER_ICONS) {
                                var left = 0;
                                iconHolder.find('.level3').each(function() {
                                    left += $(this).width();
                                });

                                var level3 = createIcon(resource, 3, iconHolder.find('.level3').length + 1).css('left', left);

                                iconHolder.append(level3);

                                level3.animate({ opacity: 1 }, TRACKER_ANIMATION);

                                $.when(iconHolder.find('.level2').animate({ left: left, opacity: 0.5 }, TRACKER_ANIMATION)).then(function() {
                                    iconHolder.find('.level2').remove();
                                    setTimeout(updateTrackerIcons, TRACKER_WAIT);
                                });
                            } else {
                                setTimeout(updateTrackerIcons, TRACKER_WAIT);
                            }
                        });
                    } else {
                        setTimeout(updateTrackerIcons, TRACKER_WAIT);
                    }
                });
            }
        }
        updateTrackerIcons();
    }
}

function createIcon(resource, level, count)
{
    var filename = 'level' + level + '.png';

    return $('<img>')
        .addClass('tracker-icon level' + level)
        .attr('src', baseUrl + 'img/primary-icons/' + resource + '/' + filename)
        .attr('alt', '');
}
