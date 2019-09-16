//! Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";

//! Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

//! 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
const client_id = config.ID;
const client_secret = config.SECRET;

//! Global variables ---------------------------------------------------------->
//  Initial counters
var totalAvailable = 0;
var totalDisabled = 0;
//  Search elements
var searchButton = document.getElementById("search-button");
var searchInput = document.getElementById("search-input");
var searchValue = "";
var searchFixed = document.getElementById("search-fixed");
var searchLocation = document.getElementById("search-location");
//  Refresh
var refreshButton = document.getElementById("refresh-button");

//* Show bikes totals when page loads ----------------------------------------->
$(document).ready(function() {
  bikesTotal();
  getLocation();
});

//* Search by station --------------------------------------------------------->
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = searchInput.value;
  bikesStation();
  stationInfo();
});

//* Start search by pressing enter on search box ------------------------------>
searchInput.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    searchButton.click();
    searchInput.blur();
  }
});

//* Search by geolocation ----------------------------------------------------->
searchLocation.addEventListener("click", function(event) {
  event.preventDefault();
  showPosition();
});

//* Refresh results ----------------------------------------------------------->
refreshButton.addEventListener("click", function(event) {
  event.preventDefault();
  if (searchFixed.checked == true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

//! Request station static data (stationInformation) -------------------------->
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
        //console.log(responseStationInfo);

        const findStationInfo = function(stations, id) {
          const index = stations.findIndex(function(station, index) {
            return station.station_id === id;
          });
          return stations[index];
        };

        let result = findStationInfo(responseStationInfo, stationStaticId);

        if (typeof result !== "undefined") {
          number = pad(result.station_id);
          numberH2 = number.toString();

          name = result.name;
          nameNum = name.slice(0, 3);

          $("h2").html("");

          if (numberH2 === nameNum) {
            $("h2").html("Estación " + name);
          } else {
            $("h2").html("Estación " + numberH2);
          }
          $(".updating").hide();

          console.log("station.name ------> " + name);
          console.log("station.nameNum ---> " + nameNum);
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

//! Request bikes total (stationStatus) --------------------------------------->
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
      //console.log(responseBikesTotal);

      var lastUpdated = new Date(data.last_updated * 1000);
      var lastDateTime = lastUpdated.toLocaleTimeString("es-AR");

      $(".last-update > p").html("Última actualización total " + lastDateTime);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalAvailable = totalAvailable + responseBikesTotal[i].num_bikes_available;
        totalDisabled = totalDisabled + responseBikesTotal[i].num_bikes_disabled;
      }

      //TODO Correct totals
      totalAvailable = totalAvailable - 396;

      $(".available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $(".disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $(".updating").hide();
      console.log("bikesTotal ---> OK");
    },
    error: function() {
      $(".updating").hide();
      $("h2").html("ERROR");
      console.log("bikesTotal ---> ERROR");
    }
  });
}

//! Request bikes per station (stationStatus) --------------------------------->
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
        //console.log(responseBikesStation);

        for (var i = 0; i < responseBikesStation.length; i++) {
          if (responseBikesStation[i].station_id === searchValue) {
            stationStaticId = responseBikesStation[i].station_id;
            stationLastReported = responseBikesStation[i].last_reported;
            stationTotalAvailable = responseBikesStation[i].num_bikes_available;
            stationTotalDisabled = responseBikesStation[i].num_bikes_disabled;
          }
        }

        var stationLastReported = new Date(stationLastReported * 1000);
        var lastDateTime = stationLastReported.toLocaleTimeString("es-AR");

        $(".available > p").html("<strong>" + stationTotalAvailable + "</strong><br>disponibles");
        $(".disabled > p").html("<strong>" + stationTotalDisabled + "</strong><br>bloqueadas");
        $(".last-update > p").html("Última actualización estación " + lastDateTime);
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

//! Request stations by status ------------------------------------------------>
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
      console.log("Total PLANNED: " + totalPlanned);
      console.log("Total IN_SERVICE: " + totalInService);
      console.log("Total MAINTENANCE: " + totalMaintenance);
      console.log("Total END_OF_LIFE: " + totalEndOfLife);
      console.log("Total ESTACIONES: " + totalPlanned + totalInService + totalMaintenance + totalEndOfLife);
    },
    error: function() {
      $(".updating").hide();
    }
  });
}

//* Add leading zeros to station_id number ------------------------------------>
function pad(number) {
  if (number <= 999) {
    number = ("00" + number).slice(-3);
  }
  return number;
}

//* Geolocation --------------------------------------------------------------->
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    searchLocation = "Geolocation is not supported by this browser.";
    console.log(searchLocation.innerHTML);
  }
}
function showPosition(position) {
  searchLocation = "Lat: " + position.coords.latitude + " / Lon: " + position.coords.longitude;
  console.log(searchLocation);
}
