(function() {
  // This is the API url prefixed with 'cors-anywhere' to avoid CORS blocking.
  const urlStatus = "https://cors-anywhere.herokuapp.com/https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
  const urlInformation = "https://cors-anywhere.herokuapp.com/https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

  // client_id and client_secret MUST be requested to API owner at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
  var client_id = config.ID;
  var client_secret = config.SECRET;

  $(document).ready(function() {
    $(".updating").show();

    // Initial counters for total system.
    var totalBikes = 4000;
    var totalAvailable = 0;
    var totalDisabled = 0;
    var totalInUse = totalBikes - totalAvailable - totalDisabled;

    // Request for total system data.
    $.ajax({
      type: "GET",
      dataType: "json",
      url: urlStatus,
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

        console.log("Hay " + totalAvailable + " disponibles");
        console.log("Hay " + totalDisabled + " bloqueadas");

        totalInUse = totalBikes - totalAvailable - totalDisabled;

        $(".available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
        $(".in-use > p").html("<strong>" + totalInUse + "</strong><br>en uso<sup>*</sup>");
        $(".updating").hide();
      },
      error: function(data) {
        $(".updating").hide();
        $(".disabled").append("ERROR");
        console.log("ERROR");
      }
    });
  });

  // Request for specific station data.
  $(".search-btn").click(function(event) {
    stationName = "";

    // Request for stations static data.
    $.ajax({
      type: "GET",
      dataType: "json",
      url: urlInformation,
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

          console.log(stationID, stationName);
        }
      },
      error: function(data) {
        console.log("ERROR");
      }
    });

    // Initial counter for station data.
    var stationTotalAvailable = 0;
    var stationTotalDisabled = 0;

    event.preventDefault();

    var stationSearch = $(".search-input").val();

    $.ajax({
      type: "GET",
      dataType: "json",
      url: urlStatus,
      data: {
        client_id: client_id,
        client_secret: client_secret
      },
      success: function(data) {
        var response = data.data.stations;

        console.log(response);

        stationTotalAvailable = response[238].num_bikes_available;
        stationTotalDisabled = response[238].num_bikes_disabled;

        $(".available > p").html("");
        $(".disabled > p").html("");
        $(".in-use > p").html("");

        $(".response > h1").html(response[238].name);
        $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
        $(".in-use > p").html("<strong>" + response[238].num_docks_available + "</strong><br>docks vacíos");

        console.log("Estación: " + response[238].station_id);
        console.log("Disponibles: " + stationTotalAvailable);
        console.log("Bloqueadas: " + stationTotalDisabled);
        console.log("Docks: " + response[238].num_docks_available);
      },
      error: function(data) {
        console.log("ERROR STATION");
      }
    });
  });
})();
