(function() {
  // Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
  const urlPrefix = "https://cors-anywhere.herokuapp.com/";
  // Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
  const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
  const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

  // 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
  var client_id = config.ID;
  var client_secret = config.SECRET;

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
        $(".in-use > p").html("<strong>" + totalInUse + "</strong><br>en uso<sup>*</sup>");
        $(".updating").hide();
      },
      error: function(data) {
        $(".updating").hide();
        $(".disabled").html("ERROR");
        //console.log("ERROR");
      }
    });
  });

  // Request for 'available' and 'disabled' bikes at specific station.
  $(".search-btn").click(function(event) {
    // Initial counter for station data.
    var stationTotalAvailable = 0;
    var stationTotalDisabled = 0;
    var stationTotalDocks = 0;

    event.preventDefault();

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

        var stationSearch = $(".search-input").val();

        for (var i = 0; i < response.length; i++) {
          if (response[i].station_id == stationSearch) {
            stationTotalAvailable = response[i].num_bikes_available;
            stationTotalDisabled = response[i].num_bikes_disabled;
            stationTotalDocks = response[i].num_docks_available;
          }
        }

        $(".available > p").html("");
        $(".disabled > p").html("");
        $(".in-use > p").html("");

        $("h2").html("Estación " + stationSearch);
        $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
        $(".in-use > p").html("<strong>" + stationTotalDocks + "</strong><br>posiciones libres");

        //console.log("Estación: " + stationSearch);
        //console.log("Disponibles: " + stationTotalAvailable);
        //console.log("Bloqueadas: " + stationTotalDisabled);
        //console.log("Docks: " + stationTotalDocks);
      },
      error: function(data) {
        //console.log("ERROR STATION");
      }
    });
  });
})();

// Request for stations static data.
function stationsStatic() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + urlInformation,
    async: true,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },

    success: function(data) {
      var response = data.data.stations;

      for (var i = 0; i < response.length; i++) {
        stationID = response[i].station_id;
        stationName = response[i].name;

        //console.log(stationID, stationName);
      }
    },
    error: function(data) {
      console.log("ERROR");
    }
  });
}
