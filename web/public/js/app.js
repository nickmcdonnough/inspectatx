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

map.setView([30.272920898023475, -97.74438629799988], 12);

var layers = {
  saveGeoJson: function (geoJson) {
    this.geoJson = L.geoJson(geoJson, {
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
        }
      }
    });

    var markerClusters = new L.MarkerClusterGroup();
    markerClusters.addLayer(this.geoJson);
    map.addLayer(markerClusters);
  },
  geoJson: L.marker([30.272920898023475, -97.74438629799988])
}

//
// map listeners & controls
//

var setViewBounds = function () {
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

map.on('dragend', function (x) { setViewBounds(); });
map.on('zoomend', function (x) { setViewBounds(); });

function drawMap (geoJson) {
  geoJson.forEach(function (feature) {
    var popupProfile = buildPopupProfile(feature);
    feature.properties.popupContent = popupProfile;
  });

  map.removeLayer(layers.geoJson);
  layers.saveGeoJson(geoJson);
  map.fitBounds(layers.geoJson)
};

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

