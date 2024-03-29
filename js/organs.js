var ORGAN_TRANSITION = 550;  // length of an organ transition in ms

// the minimum amount of space in px below the top of a popup in order that it
// slides down rather than up
var ORGAN_INFO_PADDING_BOTTOM = 500;

var ORGAN_SLIDE_OUT_DURATION  = 200;    // the time for an organ info popup to
                                        // slide in/out of the organ header in
                                        // ms
var ORGAN_SLIDE_DOWN_DURATION = 300;    // the time for an organ info popup to
                                        // slide down/up in ms

var organColors;

$(document).ready(function() {
    $('.pathways-header, .resources-header').click(function() {
        if (!$(this).hasClass('active')) {
            selectOrgan($(this).organ());
        }
    });

    $('.toggle-popup').click(function(e) {
        e.stopPropagation();
        var popup = $(this).siblings('.organ-popup');
        var content = popup.find('.content');
        popup.finish();
        content.finish();
        if (popup.is(':visible')) {
            content.slideUp(ORGAN_SLIDE_DOWN_DURATION, function() {
                popup.velocity(
                    { width : 0 },
                    ORGAN_SLIDE_OUT_DURATION,
                    function() {
                        popup.hide();
                    }
                );
            });
        } else {
            popup.toggleClass(
                'up',
                $(window).height() < 
                    ORGAN_INFO_PADDING_BOTTOM + $(this).offset().top
            );
            content.hide();

            popup.show().velocity(
                { width: popup.css('max-width') },
                ORGAN_SLIDE_OUT_DURATION,
                function() {
                    content.slideDown(ORGAN_SLIDE_DOWN_DURATION);
                }
            );
        }
    });
});

function selectOrgan(organ, animate)
{
    if (typeof animate === 'undefined') {
        animate = true;
    }

    var bg = '#' + organColors[organ];
    if (animate) {
        DIAGRAM.velocity({ backgroundColor: bg }, ORGAN_TRANSITION);
    } else {
        DIAGRAM.css('background-color', bg);
    }

    $('.pathways, .pathways-header, .resources-header')
        .add(TRACKER.find('.tracker').find('.organ'))
        .each(function() {
            $(this).toggleClass('active', $(this).organ() === organ);
        });

    $('.pathways').each(function() {
        var h = $(this).organ() === organ ? $(this).css('max-height') : 0;
        if (animate) {
            $(this).velocity({ height: h }, ORGAN_TRANSITION);
        } else {
            $(this).height(h);
        }
    }).promise().done(function() {
        selectPathway(getSelectedPathway(), false);
    });

    $('.resources').each(function() {
        var active = $(this).organ() === organ;
        if ($(this).hasClass('active') !== active) {
            $(this).toggleClass('active', active);
            
            resizeResources($(this), animate ? ORGAN_TRANSITION : false);
            $(this).find('.res').toggleClass('compact', !active);
        }
    });
}
