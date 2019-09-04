(function () {
  const url = "https://cors-anywhere.herokuapp.com/https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
  const client_id = "c9f17951eca1433a8744072cd6ed90c9";
  const client_secret = "d16cdAd7C5a44875825649808f94ca6B";

  $(document).ready(function () {
    $(".updating").show();

    $.ajax({
      type: "GET",
      dataType: "json",
      url: url,
      data: {
        client_id: client_id,
        client_secret: client_secret
      },

      success: function (data) {
        var response = data.data.stations;
        //console.log(response);

        var totalDisabled = 0;

        for (var i = 0; i < response.length; i++) {
          var stationID = response[i].station_id;
          var stationNumBikesDisabled = response[i].num_bikes_disabled;

          //console.log("Estación " + stationID + ": " + stationNumBikesDisabled + " bicis bloqueadas.");

          totalDisabled = totalDisabled + response[i].num_bikes_disabled;
        }

        //console.log("Hay " + totalDisabled + " bicis bloquedas en la red.");

        $(".response").append("Hay " + totalDisabled + " bicis bloquedas");
        $(".updating").hide();
      },
      error: function (data) {
        $(".updating").hide();
        $(".response").append("ERROR");
        //console.log("Error");
      }
    });
  });
})();
