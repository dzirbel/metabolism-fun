var INTERNAL_ERROR = 'An internal error occurred.';

$(document).ready(function() {
    $('.form').find('input[type=text], input[type=password]')
        .focusin(function() {
            $(this).parents('.form').find('.form-info')
                .removeClass('error')
                .addClass('active')
                .html($(this).attr('info'));
        })
        .focusout(function() {
            $(this).parents('.form').find('.form-info')
                .removeClass('error')
                .removeClass('active')
                .html('');
        })
        .change(function() {
            if ($(this).hasClass('username') && $(this).attr('verify') !== 'no') {
                validate($(this), 'username');
            }
            if ($(this).hasClass('email') && $(this).attr('verify') !== 'no') {
                validate($(this), 'email');
            }
            if ($(this).hasClass('new-password') && $(this).attr('verify') !== 'no') {
                validate($(this), 'password');
            }
            if ($(this).hasClass('game-name') && $(this).attr('verify') !== 'no') {
                validate($(this), 'game-name');
            }

            if ($(this).hasClass('confirm') || $(this).hasClass('new-password')) {
                var password = $(this).parent().children('.new-password');
                var confirm = $(this).parent().children('.confirm');
                confirm.toggleClass('error', !match(confirm, password));
            }

            if ($(this).hasClass('current-username') && $(this).attr('verify') !== 'no') {
                $(this).toggleClass('error', $(this).val() !== getUsername());
            }
        });

    $('#login').submit(function() {
        var form = $(this);
        if (form.find('input.error').length === 0) {
            $.ajax({
                url: '/index.php/user/login',
                type: 'POST',
                dataType: 'json',
                data: {
                    username: form.find('.username').val(),
                    password: form.find('.password').val()
                },
                success: function(data) {
                    if (data.success) {
                        location.reload();
                    } else {
                        form.siblings('.form-info')
                            .addClass('active error')
                            .html(data.message);
                    }
                },
                error: function() {
                    form.siblings('.form-info')
                        .addClass('active error')
                        .html(INTERNAL_ERROR);
                }
            });
        }
        return false;
    });

    $('.forgot-password').find('input[type=button]').click(function() {
        var form = $(this).parents('form');
        $.ajax({
            url: '/index.php/user/forgotPassword',
            type: 'POST',
            dataType: 'json',
            data: {
                username: form.find('.username').val()
            },
            success: function(data) {
                form.siblings('.form-info')
                    .addClass('active' + (data.success ? '' : ' error'))
                    .html(data.message);
            },
            error: function() {
                form.siblings('.form-info')
                    .addClass('active error')
                    .html(INTERNAL_ERROR);
            }
        });
    });

    $('#create-account').submit(function() {
        var form = $(this);
        if (form.find('input.error').length === 0) {
            var theme = getColorTheme();
            $.ajax({
                url: '/index.php/user/createAccount',
                type: 'POST',
                dataType: 'json',
                data: {
                    username:   form.find('.username').val(),
                    password:   form.find('.new-password').val(),
                    email:      form.find('.email').val(),
                    theme:      theme.theme,
                    theme_type: theme.type
                },
                success: function(data) {
                    if (data.success) {
                        location.reload();
                    } else {
                        form.siblings('.form-info')
                            .addClass('active error')
                            .html(data.message);
                    }
                },
                error: function() {
                    form.siblings('.form-info')
                        .addClass('active error')
                        .html(INTERNAL_ERROR);
                }
            });
        }
        return false;
    });

    $('#delete-account').submit(function() {
        var form = $(this);
        if (form.find('input.error').length === 0) {
            var theme = getColorTheme();
            $.ajax({
                url: '/index.php/user/deleteAccount',
                type: 'POST',
                dataType: 'json',
                data: {
                    password: form.find('.password').val(),
                },
                success: function(data) {
                    if (data.success) {
                        location.reload();
                    } else {
                        form.siblings('.form-info')
                            .addClass('active error')
                            .html(data.message);
                    }
                },
                error: function() {
                    form.siblings('.form-info')
                        .addClass('active error')
                        .html(INTERNAL_ERROR);
                }
            });
        }
        return false;
    });

    $('#email-info').submit(function() {
        var form = $(this);
        if (form.find('input.error').length === 0) {
            var newEmail = form.find('#edit-email').find('.email').val();
            $.ajax({
                url: '/index.php/user/changeEmail',
                type: 'POST',
                dataType: 'json',
                data: {
                    email: newEmail,
                    password: form.find('.password').val()
                },
                success: function(data) {
                    if (data.success) {
                        form.find('.email').val(newEmail);
                        form.find('#edit-email')
                            .slideUp()
                            .find('input[type=text]').val('');
                        form.siblings('.form-info')
                            .addClass('active')
                            .html(data.message);
                    } else {
                        form.siblings('.form-info')
                            .addClass('active error')
                            .html(data.message);
                    }
                },
                error: function() {
                    form.siblings('.form-info')
                        .addClass('active error')
                        .html(INTERNAL_ERROR);
                }
            });
            form.find('input[type=password]').val('');
        }
        return false;
    });

    $('.edit-email').find('input[type=button]').click(function() {
        $(this).parents('form').find('#edit-email').slideToggle();
    });

    $('.resend-email').click(function() {
        var form = $(this).parents('form');
        $.ajax({
            url: '/index.php/user/resendEmailVerification',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                form.siblings('.form-info')
                    .addClass('active' + (data.success ? '' : ' error'))
                    .html(data.message);
            },
            error: function() {
                form.siblings('.form-info')
                    .addClass('active error')
                    .html(INTERNAL_ERROR);
            }
        });
    });

    $('#logout').click(function() {
        $.ajax({
            url: '/index.php/user/logout',
            type: 'POST',
            dataType: 'json',
            complete: function() {
                location.reload();
            }
        });
    });
});

function match(password, confirm)
{
    return password.val() == confirm.val() || password.val() == '' ||
           confirm.val() == '';
}

function validate(input, type)
{
    input.removeClass('error');
    if (input.val()) {
        $.ajax({
            url: '/index.php/user/validate',
            type: 'POST',
            dataType: 'json',
            context: $(this),
            data: {
                type: type,
                value: input.val()
            },
            success: function(data) {
                input.toggleClass('error', !data.valid);
            }
        });
    }
}