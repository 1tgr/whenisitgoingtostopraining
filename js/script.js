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


function getWhen(days) {
    var i, date;

    for (i = 0; i < days.length; i++) {
        if (days[i].pop <= 50) {
            if (i == 0) {
                return "It's not raining";
            } else {
                date = new Date(0);
                date.setUTCSeconds(parseInt(days[i].date.epoch, 10));
                return $.timeago(date);
            }
        }
    }

    return undefined;
}

$(function() {
    $.timeago.settings.allowFuture = true;

    var mainElem = $("#main");
    mainElem.ajaxError($.fn.handleError);

    function openLocation() {
        $("#location_form").fadeIn("fast");
        $("#location_input").focus();
    }

    $.fn.handleError = function(error) {
        if (error.description === undefined) {
            error = { description: error };
        }

        $(this).html(tmpl("error_template", error));
        $("#change_location").show();
    };

    $("#open_location").click(openLocation);

    $("#location_submit").click(function(event) {
        event.preventDefault();
        window.location = "http://" + window.location.host + window.location.pathname + "?" + encodeURI($("#location_input").val());
    });

    function at(l) {
        mainElem.html(tmpl("got_location_template"));

        var url = "http://api.wunderground.com/api/4c0975b4bf6b69d3/geolookup/forecast" + l + ".json?callback=?"
        $.getJSON(url, function(json) {
            var response = json.response;
            if (json.location !== undefined && json.forecast !== undefined) {
                var model = {
                    place: json.location.city + ", " + json.location.country,
                    when: getWhen(json.forecast.simpleforecast.forecastday)
                };

                mainElem.html(tmpl(model.when === undefined ? "never_template" : "got_forecast_template", model));
                $("#change_location").html(tmpl("change_location_template", model));
                $("#open_location").click(openLocation);
                $("#change_location").show();
            } else if (response !== undefined && response.error !== undefined) {
                mainElem.handleError(response.error);
            } else if (response !== undefined && response.results !== undefined && response.results.length && response.results[0].l !== l) {
                at(response.results[0].l);
            } else {
                mainElem.handleError("We can't work out where you are.");
            }
        });
    }

    var query = decodeURIComponent(location.search.replace(/^\?/, "")).replace(/\+/g, '%20');
    if (query.length > 0) {
        if (query.toLowerCase() === "london") {
            at("/q/london uk");
        } else {
            at("/q/" + query);
        }
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(l) {
            at("/q/" + l.coords.latitude + "," + l.coords.longitude);
        }, function(error) {
            mainElem.handleError(json.error);
        });
    } else {
        mainElem.html(tmpl("no_geolocation_template", { }));
        openLocation();
    }
});
