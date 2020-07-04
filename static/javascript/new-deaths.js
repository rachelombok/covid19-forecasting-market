function collectConfirmedData() {
    var data = null;
    $.ajax({
        url: '/us-new-deaths-raw',
        type: 'GET',
        dataType: 'html',
        async: false,
        success: function(response) {
            data = $.parseJSON(response);
        } 
    });

    console.log(data);
}
