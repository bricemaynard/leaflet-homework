// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log(data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  function quakeCircles(feature) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      fillOpacity: .5,
      color: chooseColor(feature.properties.mag),
      fillColor: chooseColor(feature.properties.mag),
      radius:  markerSize(feature.properties.mag)
    });
  }

  function onEachFeature(feature, layer){
    layer.bindPopup("<h3>" + feature.properties.place + 
    "</h3><h4>Magnitude:" + feature.properties.mag +
    "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
}

let earthquakes = L.geoJSON(earthquakeData, {
  onEachFeature: onEachFeature,
  pointToLayer: quakeCircles
});

createMap(earthquakes);

}

function createMap(earthquakes) {
// Define streetmap and darkmap layers
let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

let satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
let baseMaps = {
  "Outdoors": streetmap,
  "Dark Map": darkmap,
  "Satellite View": satmap
};

//
let overlayMaps = {
  Earthquakes: earthquakes
};

// Create a new map
let myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [streetmap, earthquakes]
});

// Create a layer control containing our baseMaps
// Be sure to add an overlay Layer containing the earthquake GeoJSON
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Adds Legend
let legend = L.control({position: 'bottomright'});
legend.onAdd = function(myMap) {
  let div = L.DomUtil.create('div', 'legend'),
    colorScale = [0, 1, 2, 3, 4, 5],
    labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

  for (let i = 0; i < colorScale.length; i++) {
    div.innerHTML += '<i style="background:' + chooseColor(colorScale[i] + 1) + '"></i> ' +
            colorScale[i] + (colorScale[i + 1] ? '&ndash;' + colorScale[i + 1] + '<br>' : '+');
  }

  return div;
};
legend.addTo(myMap);

}

function chooseColor(magnitude){
  return magnitude >= 5 ? "red": magnitude >= 4 ? "orange": magnitude >= 3 ? "gold": magnitude >= 2 ? "purple": magnitude >= 1 ? "lightgreen": "lightpink";
}
function markerSize(magnitude){
  return magnitude * 10
}