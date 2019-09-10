// Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";

// Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

// 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
var client_id = config.ID;
var client_secret = config.SECRET;

// Initial counters for total system.
var totalBikes = 4000;
var totalAvailable = 0;
var totalDisabled = 0;
var totalInUse = totalBikes - totalAvailable - totalDisabled;

$(document).ready(function() {
  // Request for 'available' and 'disabled' bikes when page loads.
  $(".updating").show();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + urlStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function(data) {
      var response = data.data.stations;
      console.log(response);

      for (var i = 0; i < response.length; i++) {
        totalAvailable = totalAvailable + response[i].num_bikes_available;
        totalDisabled = totalDisabled + response[i].num_bikes_disabled;
      }

      $(".available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $(".disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $(".updating").hide();
    },
    error: function() {
      $(".updating").hide();
      $("h3").html("ERROR");
    }
  });
});

// Search
$(".search-btn").click(function() {
  var stationStatusSearch = $(".search-input").val();

  if (stationStatusSearch == 0) {
    alert("Ingrese una estación");
  } else {
    $(".updating").show();
    $.ajax({
      type: "GET",
      dataType: "json",
      url: urlPrefix + urlStatus,
      data: {
        client_id: client_id,
        client_secret: client_secret
      },
      success: function(data) {
        var response = data.data.stations;

        for (var i = 0; i < response.length; i++) {
          if (response[i].station_id == stationStatusSearch) {
            stationStaticSearch = response[i].station_id;
            stationTotalAvailable = response[i].num_bikes_available;
            stationTotalDisabled = response[i].num_bikes_disabled;
          }
        }

        $("h2").html("Estación");
        $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
        stationStatic();
      },
      error: function() {
        $(".updating").hide();
        $("h3").html("ERROR");
      }
    });
  }
});

// Refresh
$(".refresh-btn").click(function() {
  location.reload();
});

// Request for stations static data.
function stationStatic() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + urlInformation,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },

    success: function(data) {
      const stationsStatic = data.data.stations;
      console.log(stationsStatic);

      const findStation = function(stations, id) {
        const index = stations.findIndex(function(station, index) {
          return station.station_id === id;
        });
        return stations[index];
      };
      let stationSearch = findStation(stationsStatic, stationStaticSearch);
      $("h3").html(stationSearch.name);
      $(".updating").hide();
    },
    error: function() {
      console.log("ERROR STATIC");
    }
  });
}
