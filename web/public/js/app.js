// js stuff

//
// draw map. defaults.
//

var map = L.map('map', {
  touchZoom: false,
  scrollWheelZoom: false
});

L.tileLayer('http://a.tiles.mapbox.com/v3/snapdemos.map-l2vbhlkj/{z}/{x}/{y}.png', {
  attribution: 'Mapbox',
  key: '8db088f2c08348c29c0c1443a46654ca'
}).addTo(map);

map.setView([30.272920898023475, -97.74438629799988], 14);

var layers = {
  saveGeoJson: function (geoJson) {
    this.geoJson = L.geoJson(geoJson, {
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
        }
      }
    });

    var markerClusters = new L.MarkerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true
    });

    markerClusters.addLayer(this.geoJson);
    map.addLayer(markerClusters);
    this.clusters = markerClusters;
  },
  geoJson: new L.marker(),
  clusters: new L.MarkerClusterGroup()
}

//
// map listeners & controls
//

// disable map dragging when control is being used.

document.getElementById('control').onmousedown = function ()  {map.dragging.disable() }
document.getElementById('control').onmouseup = function () { map.dragging.enable() }

// put boundaries into search box when map is dragged or zoomed
map.on('dragend', function (x) { setViewBounds(); });
map.on('zoomend', function (x) { setViewBounds(); });

function setViewBounds () {
  var searchType = document.getElementById('search-type').value;

  if (searchType === 'mapview') {
    var mapBounds = map.getBounds();
    var boundaryData = [
      mapBounds._southWest.lng,
      mapBounds._southWest.lat,
      mapBounds._northEast.lng,
      mapBounds._northEast.lat
    ].join(',');

    document.getElementById('search-query').value = boundaryData;
  }
}

function drawMap (geoJson) {
  geoJson.forEach(function (feature) {
    var popupProfile = buildPopupProfile(feature);
    feature.properties.popupContent = popupProfile;
  });

  map.removeLayer(layers.clusters);
  layers.saveGeoJson(geoJson);
  map.fitBounds(layers.geoJson)
}

function buildPopupProfile (feature) {
  var rowSource = document.getElementById('score-entry').innerHTML;
  var profileSource = document.getElementById('marker-popup').innerHTML;
  var rowTemplate = Handlebars.compile(rowSource);
  var profileTemplate = Handlebars.compile(profileSource);

  var rows = feature.properties.inspections.map(function (i) {
    return rowTemplate(i);
  });

  return profileTemplate({
    name: feature.properties.name,
    scorelist: rows.join(''),
    facilityid: feature.properties.facility_id
  });
}

//
// search listeners
//

document.getElementById('search-type').onchange = function () {
  var searchBox = document.getElementById('search-query');
  var searchType = document.getElementById('search-type').value;

  if (searchType === 'mapview') {
    setViewBounds();
    searchBox.disabled = true;
  } else {
    searchBox.value = '';
    searchBox.disabled = false;
  }
};

document.getElementById('submit').onclick = function () {
  var searchParams = {
    type: document.getElementById('search-type').value,
    query: document.getElementById('search-query').value,
    sign: document.getElementById('search-inequality').value,
    score: document.getElementById('search-score').value,
    when: document.getElementById('search-when').value
  }

  facilitySearch(searchParams);
};

//
// api stuff.
//

function facilitySearch (searchParams) {
  var httpRequest = new XMLHttpRequest();

  if (!httpRequest) { alert('can\'t make request!'); return false; }

  httpRequest.open('POST', '/search', true);
  httpRequest.onload = function () {
    var geoJson = JSON.parse(this.responseText).results;
    drawMap(geoJson)
  };
  httpRequest.setRequestHeader('Content-Type', 'application/json');
  httpRequest.send(JSON.stringify(searchParams));
}

