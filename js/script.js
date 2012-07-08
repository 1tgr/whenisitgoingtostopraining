$(function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(l) {
            $("#status").text(l.coords.latitude + ", " + l.coords.longitude);
        });
    }
});
