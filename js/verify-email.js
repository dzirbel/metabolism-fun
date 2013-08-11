$(document).ready(function() {
    $('#code').focus();

    $('#submit').click(function(event) {
        event.preventDefault();

        $.ajax({
            url: 'verifyEmail',
            type: 'POST',
            dataType: 'json',
            data: {
                username: $('#username').val(),
                verification: $('#code').val()
            },
            success: function(data) {
                if (data.success) {
                    $('#message').addClass('success').removeClass('error').text(data.message);
                } else {
                    $('#message').addClass('error').removeClass('success').text(data.message);
                }
            },
            error: function() {
                $('#message').addClass('error').removeClass('success').text('An internal error occurred. Please try again.');
            }
        });
    });
});