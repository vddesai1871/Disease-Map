/*
* JS script for disease map
* You are about to dive into 230+ lines of complete and utter cr*p code.
* Best of Luck!
 */


//too many gloabl variables :(

var map;  // For instance of Google Map
var taluka="ahmedabad_city";
var district="ahmedabad";
var disease="malaria";
var week="1";
var age="all";
var month = '8';
var firstTime = true; // true if it's the first session of user
var markers = [];  // markers for map
var circles = [];
var heatMaps = []; // heatmaps for map
var info = new google.maps.InfoWindow(); // info window
var heatMapData = []; // stores data about where to draw heatmap i.e. latitude, longitude etc.
var intense = 0;
var august = [];
var september = [];

        var param = {
        disease: disease,
        district: district,
        taluka: taluka,
    };
         $.getJSON(Flask.url_for('sum'), param)
        .done(function (res) {
            august = res[0];
            september = res[1];
            console.log(res[0]);

        });

// execute when the DOM is fully loaded
$(function() {
    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
     var styles = [
      // hide Google's labels
        {
            "featureType": "all",
            "elementType": "labels",
            "stylers": [
                {"visibility": "off"}
            ]
        },
        // hide roads
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {"visibility": "off"}
            ]
        },

  {
    "featureType": "poi.medical",
    "stylers": [
      {
        "color": "#FFFF00"
      },
      {
        "visibility": "simplified"
      },
      {
        "weight": 6.5
      }
    ]
  }];
    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 23.0587, lng: 72.1924},
        disableDefaultUI: true,
        mapTypeId:google.maps.MapTypeId.HYBRID,
        maxZoom: 23,
        panControl: true,
        styles: styles,
        zoom: 6,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);
    // instantiate map
    map = new google.maps.Map(/*The world is but */ canvas /* to our imagination */, options);
    // configure UI once Google Map is idle (i.e., loaded)

    google.maps.event.addListenerOnce(map, "idle" /*sambar*/, update);

    // clear the district field if user is filling the taluka field

    var button = $("#submit_form");
    // send an api request for data with values taken from user as form input
    button.on("click",function (){
        district = $("#district").val();
        disease = $("#disease").val();
        taluka = $("#taluka").val();
        month = $("#month").val();
        week = $("#week").val();
        age = $("#age").val();
        firstTime = false; // the user clicked on form submit so his first session ends here
        google.maps.event.addListenerOnce(map, "idle", update(taluka));
        return false; // to avoid page from reloading
    });
});
console.log(window.aug);
/**
 * Adds marker for place to map.
 */
function addMarker(data)
{
    // extract the place latitude and longitude
    var myLatLng = new google.maps.LatLng(data[0]['geometry']['location']['lat'], data[0]['geometry']['location']['lng']); // places[3] is latitude and places[4] is longitude

    // icon for the marker
    var image = "http://maps.google.com/mapfiles/kml/pal4/icon63.png";

    // if taluka is given set district = none or vice-versa

        var para = {
        disease: disease,
        district: district,
        taluka: taluka,
    };
         $.getJSON(Flask.url_for('sum'), para)
        .done(function (res) {
            august = res[0];
            september = res[1];
            console.log(res[0]);

        });

    //set content to be displayed in info window
    var content = "<ul><li>  <b>" + taluka +" </b></li>";
    intense = 0;

        var param = {
            disease: disease,
            district: district,
            taluka: taluka,
            month: month,
            week: week,
            age: age
        };
        ag = august;
        s = september;
        content = "<ul>";
        $.getJSON(Flask.url_for('update'), param)
            .done(function (res) {

                console.log(ag);
                console.log(s);
                if (age!="all") {
                    content += "<li> Taluka  :  <b>  " + res[0] + " </b></li> ";
                    content += "<li> Cases  :  <b>  " + res[7] + " </b></li> ";
                    content += "<li> Population  :  <b>  " + res[5] + " </b></li> ";
                    console.log(august[1]);
                    console.log(august[1] - august[0]);


                    var ans = (res[0][3]*100/res[0][5]);
                    var a = ans.toFixed(5);
                    content += "<li> Number of cases per 100 persons  :  <b>  " + res[10] + " </b></li> </hr>";
                    content += "<li> Average Temperature  :  <b>  " + res[1] + "  &deg;C </b></li> ";
                    content += "<li> Rainfall  :  <b>  " + res[2] + " mm </b></li> ";
                    content += "<li> Relative humidity  :  <b>  " + res[4] + " %</b></li> ";
                    content += "<li> Altitude  :  <b>  " + res[6] + " m</b></li> ";
                }
                else{
                    content += "<li> Taluka  :  <b>  " + res[2] + " </b></li> ";
                    content += "<li> Cases  :  <b>  " + res[3] + " </b></li> ";
                    content += "<li> Population  :  <b>  " + res[7] + " </b></li> ";
                    content += "<li> Number of cases per 100 persons  :  <b>  " + res[17] + " </b></li> ";
                    content += "<li> Average Temperature  :  <b>  " + res[4] + " &deg;C</b></li> ";
                    content += "<li> Rainfall  :  <b>  " + res[5] + " mm</b></li> ";
                    content += "<li> Relative humidity  :  <b>  " + res[6] + " %</b></li> ";
                    content += "<li> Altitude  :  <b>  " + res[8] + " m</b></li> ";
                }

            });

    // instantiate marker
    content += "</ul>";
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: data[0]['formatted_address'],
        icon : image
    });
    var cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.05,
            map: map,
            center: new google.maps.LatLng(data[0]['geometry']['location']['lat'], data[0]['geometry']['location']['lng']),
            radius: 10000
          });
    circles.push(cityCircle);


		// listen for clicks on marker
        google.maps.event.addListener(marker, 'click', function() {
            showInfo(marker, content);
            map.setZoom(15);
            map.setCenter(marker.getPosition());
		});
    // add marker to the map markers
    markers.push(marker);
}

/**
 * Removes markers from map.
 */
function removeMarkers() {
    for (var i = 0; i < markers.length; i++)
        markers[i].setMap(null);
}

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) == "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='/static/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }
    // Stannis Baratheon is the one true king!
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}
/**
 * Here be dragons!
 *
 *
 *
 * Updates UI's markers.
 */
function update(place)
{
    if(firstTime)
        place = "ahmedabad_city";
    removeMarkers();
       //removes heatmaps
       for(var i = 0;i < heatMaps.length;i++)
            heatMaps[i].setMap(null);
       //remove circles
       for (var i = 0; i < circles.length; i++)
           circles[i].setMap(null);
    heatMapData = [];

        var parameters = {
            address: place + ",Gujarat",
            key: "AIzaSyACDm3wWsEcuITsCs9kqNrE2bQ-J7a0Bvs"
        };


        $.getJSON("https://maps.googleapis.com/maps/api/geocode/json", parameters)
            .done(function (data) {
                // remove old markers from map
                // add new markers to map
                addMarker(data['results']);
                heatMapData.push(new google.maps.LatLng(data['results'][0]['geometry']['location']['lat'], data['results'][0]['geometry']['location']['lng']));

                //The code below this line is written by my evil twin so there's lot of weird magic going down there ,of which i am no responsible

                 if(!firstTime) {
                     map.setCenter(new google.maps.LatLng(data['results'][0]['geometry']['location']['lat'], data['results'][0]['geometry']['location']['lng']));
                     var heatmap = new google.maps.visualization.HeatmapLayer({
                         data: heatMapData
                     });
                     heatMaps.push(heatmap);
                heatmap.set('radius', 30);
                heatmap.set('opacity', 0.3);
                heatmap.setMap(map);

                 }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {

                // log error to browser's console
                console.log(errorThrown.toString());
            });
    }
    /* Redundant code lies here....
        Yes , I know how to write DRY code and I have tried to debug this mess.
        But the app just doesnt work in desired way without duplication.
        You are most welcome to try debugging it.
     */
    if(firstTime) {
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapData
        });
        heatMaps.push(heatmap);
        heatmap.set('radius', 30);
        heatmap.set('opacity', 0.3);
        heatmap.setMap(map);


}

