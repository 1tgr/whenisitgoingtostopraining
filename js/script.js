// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
  
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
      
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();


function when(days) {
    var i, date;

    for (i = 0; i < days.length; i++) {
        if (days[i].pop < 50) {
            date = new Date(0);
            date.setUTCSeconds(parseInt(days[i].date.epoch, 10));
            return date;
        }
    }

    return undefined;
}

function parse(json) {
    return {
        place: json.location.city,
        date: when(json.forecast.simpleforecast.forecastday)
    };
}

$(function() {
    $.timeago.settings.allowFuture = true;

    $.fn.handleError = function(error) {
        if (error.description === undefined) {
            error = { description: error };
        }

        $(this).html(tmpl("error_template", error));
    };

    var mainElem = $("#main");
    mainElem.ajaxError($.fn.handleError);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(l) {
            mainElem.html(tmpl("got_location_template"));

            var url = "http://api.wunderground.com/api/4c0975b4bf6b69d3/geolookup/forecast/q/" + l.coords.latitude + "," + l.coords.longitude + ".json?callback=?"
            $.getJSON(url, function(json) {
                if (json.error === undefined) {
                    var model = parse(json);
                    mainElem.html(tmpl(model.date === undefined ? "never_template" : "got_forecast_template", model));
                } else {
                    mainElem.handleError(json.error);
                }
            });
        }, function(error) {
            mainElem.handleError(json.error);
        });
    }
});
