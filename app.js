(function() {
  const url = "https://cors-anywhere.herokuapp.com/https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";

  var client_id = config.ID;
  var client_secret = config.SECRET;

  $(document).ready(function() {
    $(".updating").show();

    $.ajax({
      type: "GET",
      dataType: "json",
      url: url,
      data: {
        client_id: client_id,
        client_secret: client_secret
      },

      success: function(data) {
        var response = data.data.stations;
        //console.log(response);

        var totalAvailable = 0;
        var totalDisabled = 0;
        var totalInUse = 0;

        for (var i = 0; i < response.length; i++) {
          var stationID = response[i].station_id;
          var stationNumBikesDisabled = response[i].num_bikes_disabled;
          var stationNumBikesAvailable = response[i].num_bikes_available;

          //console.log("Estación " + stationID + ": " + stationNumBikesDisabled + " bicis bloqueadas.");

          totalAvailable = totalAvailable + response[i].num_bikes_available;
          totalDisabled = totalDisabled + response[i].num_bikes_disabled;
        }

        console.log("Hay " + totalAvailable + " disponibles");
        console.log("Hay " + totalDisabled + " bloqueadas");

        totalInUse = 4000 - totalAvailable - totalDisabled;

        $(".available > p").append("<strong>" + totalAvailable + "</strong><br>disponibles");
        $(".disabled > p").append("<strong>" + totalDisabled + "</strong><br>bloqueadas");
        $(".in-use > p").append("<strong>" + totalInUse + "</strong><br>en uso*");
        $(".updating").hide();
      },
      error: function(data) {
        $(".updating").append("ERROR");
        console.log("ERROR");
      }
    });
  });
})();
