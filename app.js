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

        var totalDisabled = 0;
        //var totalAvailable = 0;

        for (var i = 0; i < response.length; i++) {
          var stationID = response[i].station_id;
          var stationNumBikesDisabled = response[i].num_bikes_disabled;
          var stationNumBikesAvailable = response[i].num_bikes_available;

          console.log("Estación " + stationID + ": " + stationNumBikesDisabled + " bicis bloqueadas.");

          totalDisabled = totalDisabled + response[i].num_bikes_disabled;
          totalAvailable = totalAvailable + response[i].num_bikes_available;
        }

        console.log("Hay " + totalDisabled + " EcoBici bloqueadas");
        console.log("Hay " + totalAvailable + " EcoBici disponibles");

        $(".response").append("Hay " + totalDisabled + " EcoBici bloqueadas");
        $(".updating").hide();
      },
      error: function(data) {
        $(".updating").hide();
        $(".response").append("ERROR");
        //console.log("Error");
      }
    });
  });
})();
