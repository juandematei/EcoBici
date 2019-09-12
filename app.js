//! Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";

//! Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

//! 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
const client_id = config.ID;
const client_secret = config.SECRET;

//* Global variables
//  Initial counters
var totalAvailable = 0;
var totalDisabled = 0;
//  Search elements
var searchInput = document.getElementById("search-input");
var searchButton = document.getElementById("search-button");
var searchValue = "";

$(document).ready(function() {
  //* Show bikes totals when page loads.
  bikesTotal();
});

//* Search by station.
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = $("#search-input").val();
  bikesStation();
  stationInfo();
});

//* Start search by pressing enter on search box.
searchInput.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    searchButton.click();
  }
});

//! Request station static data (stationInformation)
function stationInfo() {
  if (searchValue !== "") {
    $.ajax({
      type: "GET",
      dataType: "json",
      url: urlPrefix + urlInformation,
      data: {
        client_id: client_id,
        client_secret: client_secret
      },

      success: function(data) {
        var responseStationInfo = data.data.stations;

        const findStationInfo = function(stations, id) {
          const index = stations.findIndex(function(station, index) {
            return station.station_id === id;
          });
          return stations[index];
        };
        let searchValue = findStationInfo(responseStationInfo, stationStaticId);
        $("h3").html(searchValue.name);
        $(".updating").hide();
      },
      error: function() {
        $(".updating").hide();
        $("h3").html("ERROR");
      }
    });
  }
}

//! Request bikes total (stationStatus)
function bikesTotal() {
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
      var responseBikesTotal = data.data.stations;

      var lastUpdated = new Date(data.last_updated * 1000);
      var lastDateTime = lastUpdated.toLocaleTimeString("es-AR");

      $(".last-update > p").html("Última actualización de datos " + lastDateTime);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalAvailable = totalAvailable + responseBikesTotal[i].num_bikes_available;
        totalDisabled = totalDisabled + responseBikesTotal[i].num_bikes_disabled;
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
}

//! Request bikes per station (stationStatus)
function bikesStation() {
  if (searchValue !== "") {
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
        var responseBikesStation = data.data.stations;
        for (var i = 0; i < responseBikesStation.length; i++) {
          if (responseBikesStation[i].station_id === searchValue) {
            stationStaticId = responseBikesStation[i].station_id;
            stationTotalAvailable = responseBikesStation[i].num_bikes_available;
            stationTotalDisabled = responseBikesStation[i].num_bikes_disabled;
          }
        }

        $("h2").html("Estación");
        $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
      },
      error: function() {
        $(".updating").hide();
        $("h3").html("ERROR");
      }
    });
  } else {
    alert("Ingrese una estacion");
  }
}
