function when(days) {
    var i, date;

    for (i = 0; i < days.length; i++) {
        if (days[i].pop < 50) {
            date = new Date(0);
            date.setUTCSeconds(parseInt(days[i].date.epoch, 10));
            return $.timeago(date);
        }
    }

    return "Never";
}

$(function() {
    $.timeago.settings.allowFuture = true;

    var status = $("#status");
    status.ajaxError(function(error) {
        $(this).text(error);
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(l) {
            status.text("Forecasting weather...");

            var url = "http://api.wunderground.com/api/4c0975b4bf6b69d3/geolookup/forecast/q/" + l.coords.latitude + "," + l.coords.longitude + ".json?callback=?"
            $.getJSON(url, function(json) {
                if (json.error === undefined) {
                    status.text(when(json.forecast.simpleforecast.forecastday));
                } else {
                    status.text(json.error.description);
                }
            });
        }, function(error) {
            status.text(error);
        });
    }
});
