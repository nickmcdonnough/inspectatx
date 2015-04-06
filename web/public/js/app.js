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
$('.control').mousedown(function () { map.dragging.disable(); });
$('.control').mouseup(function () { map.dragging.enable(); });

// put boundaries into search box when map is dragged or zoomed
map.on('dragend', function (x) { setViewBounds(); });
map.on('zoomend', function (x) { setViewBounds(); });

function setViewBounds () {
  var searchType = $('#search-type').val();

  if (searchType === 'mapview') {
    var mapBounds = map.getBounds();
    var boundaryData = [
      mapBounds._southWest.lng,
      mapBounds._southWest.lat,
      mapBounds._northEast.lng,
      mapBounds._northEast.lat
    ].join(',');

    $('#search-query').val(boundaryData);
  }
}

function drawMap (geoJson) {
  geoJson.forEach(function (feature) {
    var popupProfile = buildPopupProfile(feature);
    feature.properties.popupContent = popupProfile;
  });

  map.removeLayer(layers.clusters); // not working...
  layers.saveGeoJson(geoJson);
  map.fitBounds(layers.geoJson)
}

function buildPopupProfile (feature) {
  var rowSource = $('#score-entry').html();
  var profileSource = $('#marker-popup').html();
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

$('#search-type').change(function (e) {
  var searchType = $('#search-type').val();

  if (searchType === 'mapview') {
    $('#search-query').val('');
    $('#search-query').prop('disabled', true);
  } else {
    $('#search-query').prop('disabled', false);
  }
});

$('#submit').click(function () {
  var searchParams = {
    type: $('#search-type').val(),
    query: $('#search-query').val(),
    sign: $('#search-inequality').val(),
    score: $('#search-score').val(),
    when: $('#search-when').val()
  }

  facilitySearch(searchParams);
});

//
// api stuff.
//

function facilitySearch (searchParams) {
  $.ajax({
    url: '/search',
    type: 'POST',
    data: searchParams,
    success: function (data) {
      geoJson = JSON.parse(data).results;
      drawMap(geoJson);
    },
    error: function (error) { alert('failure!'); console.log(error); }
  });
}

