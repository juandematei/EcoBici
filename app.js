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
//  Refresh
var refreshButton = document.getElementById("refresh-button");

$(document).ready(function() {
  //* Show bikes totals when page loads.
  bikesTotal();
});

//* Search by station.
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = searchInput.value;
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

//* Refresh
refreshButton.addEventListener("click", function(event) {
  event.preventDefault();
  if (searchValue !== "") {
    searchButton.click();
  } else {
    location.reload();
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
        console.log(responseStationInfo);

        const findStationInfo = function(stations, id) {
          const index = stations.findIndex(function(station, index) {
            return station.station_id === id;
          });
          return stations[index];
        };
        let result = findStationInfo(responseStationInfo, stationStaticId);

        if (typeof result !== "undefined") {
          $("h2").html("");
          $("h2").html("Estación " + result.station_id);
          $(".updating").hide();
        } else {
          $(".updating").hide();
          $("h2").html("ERROR");
          searchInput.value = "";
          searchValue = "";
        }
      },
      error: function() {
        $(".updating").hide();
        $("h2").html("ERROR");
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
      console.log(responseBikesTotal);

      var lastUpdated = new Date(data.last_updated * 1000);
      var lastDateTime = lastUpdated.toLocaleTimeString("es-AR");

      $(".last-update > p").html("Última actualización de datos " + lastDateTime);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalAvailable = totalAvailable + responseBikesTotal[i].num_bikes_available;
        totalDisabled = totalDisabled + responseBikesTotal[i].num_bikes_disabled;
      }

      //TODO Correct totals
      totalAvailable = totalAvailable - 396;

      $(".available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $(".disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $(".updating").hide();
    },
    error: function() {
      $(".updating").hide();
      $("h2").html("ERROR");
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

        $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
      },
      error: function() {
        $(".updating").hide();
        $("h2").html("ERROR");
      }
    });
  } else {
    $(".updating").hide();
    $("h2").html("ERROR");
  }
}

//! Request stations by status.
function stationStatus() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + urlStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },

    success: function(data) {
      var responseStationPlanned = data.data.stations;
      var totalPlanned = 0;
      var totalInService = 0;
      var totalEndOfLife = 0;
      var totalMaintenance = 0;

      for (var i = 0; i < responseStationPlanned.length; i++) {
        if (responseStationPlanned[i].status === "PLANNED") {
          totalPlanned = totalPlanned + 1;
        }
        if (responseStationPlanned[i].status === "IN_SERVICE") {
          totalInService = totalInService + 1;
        }
        if (responseStationPlanned[i].status === "END_OF_LIFE") {
          totalEndOfLife = totalEndOfLife + 1;
        }
        if (responseStationPlanned[i].status === "MAINTENANCE") {
          totalMaintenance = totalMaintenance + 1;
        }
      }
      console.log(totalPlanned);
      console.log(totalInService);
      console.log(totalMaintenance);
      console.log(totalEndOfLife);
      console.log(totalPlanned + totalInService + totalMaintenance + totalEndOfLife);
    },
    error: function() {
      $(".updating").hide();
    }
  });
}
