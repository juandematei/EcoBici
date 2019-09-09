// Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";
// Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

// 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
var client_id = config.ID;
var client_secret = config.SECRET;

(function() {
  // Initial data when pages loads (total)
  $(document).ready(function() {
    $(".updating").show();

    // Initial counters for total system.
    var totalBikes = 4000;
    var totalAvailable = 0;
    var totalDisabled = 0;
    var totalInUse = totalBikes - totalAvailable - totalDisabled;

    // Request for 'available' and 'disabled' bikes total.
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
          totalAvailable = totalAvailable + response[i].num_bikes_available;
          totalDisabled = totalDisabled + response[i].num_bikes_disabled;
        }

        //console.log("Hay " + totalAvailable + " disponibles");
        //console.log("Hay " + totalDisabled + " bloqueadas");

        totalInUse = totalBikes - totalAvailable - totalDisabled;

        $(".available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
        //$(".in-use > p").html("<strong>" + totalInUse + "</strong><br>en uso<sup>*</sup>");
        $(".updating").hide();
      },
      error: function(data) {
        $(".updating").hide();
        $(".disabled").html("ERROR");
        console.log("ERROR");
      }
    });
    stationStatic();
  });

  // Search for specific station.
  $(".search-btn").click(function(event) {
    stationStatus();
  });
})();

// Request for 'available' and 'disabled' bikes at specific station.
function stationStatus() {
  var stationStatusSearch = $(".search-input").val();
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
      var responseStatus = data.data.stations;
      //console.log(responseStatus);

      for (var i = 0; i < responseStatus.length; i++) {
        if (responseStatus[i].station_id == stationStatusSearch) {
          stationStaticSearch = responseStatus[i].station_id;
          stationTotalAvailable = responseStatus[i].num_bikes_available;
          stationTotalDisabled = responseStatus[i].num_bikes_disabled;
          //stationTotalDocks = responseStatus[i].num_docks_available;
        }
      }

      $("h2").html("Estación");
      $("h3").html("NOMBRE ESTACION");
      $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
      $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
      //$(".in-use > p").html("<strong>" + stationTotalDocks + "</strong><br>posiciones libres");
    },
    error: function(data) {
      console.log("ERROR STATION");
    }
  });
  $(".updating").hide();
}

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
    async: true,

    success: function(data) {
      var responseStatic = data.data.stations;
      console.log(responseStatic);

      for (var i = 0; i < responseStatic.length; i++) {
        stationsID = responseStatic[i].station_id;
        stationsNames = responseStatic[i].name;
      }
    },
    error: function(data) {
      console.log("ERROR STATIC");
    }
  });
}
