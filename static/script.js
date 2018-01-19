/*
* JS script for disease map
* You are about to dive into 230+ lines of complete and utter cr*p code.
* Best of Luck!
 */


//too many gloabl variables :(

var map;  // For instance of Google Map
var taluka;
var district;
var disease;
var findMyLatLng;
var month = 'november';
var firstTime = true; // true if it's the first session of user
var markers = [];  // markers for map
var heatMaps = []; // heatmaps for map
var info = new google.maps.InfoWindow(); // info window
var heatMapData = []; // stores data about where to draw heatmap i.e. latitude, longitude etc.

// execute when the DOM is fully loaded
$(function() {
    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [
        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        },
        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }
    ];
    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 23.0587, lng: 72.1924},
        disableDefaultUI: true,
        mapTypeId:google.maps.MapTypeId.HYBRID,
        maxZoom: 14,
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
    $("#taluka").keydown(function(){
        $("#district").val("");
    });
    // same as above.....
     $("#district").keydown(function(){
        $("#taluka").val("");
    });
    var button = $(".btn");
    // send an api request for data with values taken from user as form input
    button.on("click",function (){
        district = $("#district").val();
        disease = $("#disease").val();
        taluka = $("#taluka").val();
        month = $("#month").val();
        firstTime = false; // the user clicked on form submit so his first session ends here
        if(taluka) //
            findMyLatLng = taluka;
        else
            findMyLatLng = district;
        google.maps.event.addListenerOnce(map, "idle", update(findMyLatLng));
        return false; // to avoid page from reloading
    });
});

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
    if (taluka && !firstTime) { // if it's firstTime we are searching for data about districts
        district = "none"
        taluka = data[0]["address_components"][0]["short_name"];
    }
    else {
        taluka = "none"
        district = data[0]["address_components"][0]["short_name"];
    }
    var diseases = [];
    if (firstTime || disease == "all")
        diseases = ["malaria", "typhoid", "dengue", "cholera", "hepatitis"];

    else
        diseases = [disease];

    //set content to be displayed in info window
    var content = "<ul><li>  <b>" + data[0]["address_components"][0]["short_name"] +" </b></li>";
    for(var i = 0; i < diseases.length; i++) {

        var param = {
            disease: diseases[i],
            district: district,
            taluka: taluka,
            month: month
        };

        $.getJSON(Flask.url_for('update'), param)
            .done(function (res) {
                content += "<li> " + res[1].charAt(0).toUpperCase() + res[1].slice(1) +"  :  <b>  " + res[0][0] + " </b></li> ";
            });
    } // instantiate marker
    content += "</ul>";
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: data[0]['formatted_address'],
        icon : image
    });
		// listen for clicks on marker
        google.maps.event.addListener(marker, 'click', function() {
            showInfo(marker, content);
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
        place = ["Ahmedabad", "Rajkot", "Surat", "Vadodara", "Jamnagar", "Bhavnagar", "Junagadh", "Gandhinagar"];
    else
        place = [place];
    removeMarkers();
       //removes heatmaps
       for(var i = 0;i < heatMaps.length;i++)
            heatMaps[i].setMap(null);
    heatMapData = [];

    for(var i = 0; i <place.length; i++) {
        var parameters = {
            address: place[i] + ",Gujarat",
            key: "Your Google Map API key goes here." 
        };


        $.getJSON("https://maps.googleapis.com/maps/api/geocode/json", parameters)
            .done(function (data) {
                // remove old markers from map
                // add new markers to map
                addMarker(data['results']);
                heatMapData.push(new google.maps.LatLng(data['results'][0]['geometry']['location']['lat'], data['results'][0]['geometry']['location']['lng']));

                //The code below this line is written by my evil twin so there's lot of weird magic going down there ,of which i am no responsible

                 if(!firstTime) {
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

}
