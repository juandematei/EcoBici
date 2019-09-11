//! Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";

//! Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

//! 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
const client_id = config.ID;
const client_secret = config.SECRET;

//* Initial counters for total bikes.
var totalAvailable = 0;
var totalDisabled = 0;

//* Request for total bikes when page loads.
$(document).ready(function() {
  totalBikes();
});

//* Search for station bikes.
$(".search-btn").click(function() {
  stationBikes();
});

//* Refresh.
$(".refresh-btn").click(function() {
  var stationStatusSearch = $(".search-input").val();
  if (stationStatusSearch == 0) {
    totalBikes();
  } else {
    stationBikes();
  }
});

//* Reload page (logo).
$(".logo").click(function() {
  location.reload();
});

function totalBikes() {
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
      var lastUpdated = new Date(data.last_updated * 1000);
      var lastDateTime = lastUpdated.toLocaleTimeString("es-AR");

      for (var i = 0; i < response.length; i++) {
        totalAvailable = totalAvailable + response[i].num_bikes_available;
        totalDisabled = totalDisabled + response[i].num_bikes_disabled;
      }

      $(".available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $(".disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $(".last-update > p").html("Última actualización " + lastDateTime);
      $(".updating").hide();
    },
    error: function() {
      $(".updating").hide();
      $("h3").html("ERROR");
    }
  });
}

function stationBikes() {
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
}

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
