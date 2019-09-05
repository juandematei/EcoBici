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

// Request for specific station data.
$(".search-btn").click(function(event) {
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
