// Grab the articles as a json
$.getJSON("/api/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {

        console.log(data[i]);
        // Display the apropos information on the page
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

$(document).on(`click`, `#clear-table`, () => {
    $.ajax({
        method:`GET`,
        url:`/api/articles/archive`
    }).then(function(data){
        location.reload();
    });
});






