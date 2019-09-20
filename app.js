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
var totalDocks = 0;

//* Show bikes totals when page loads ----------------------------------------->
$(document).ready(function() {
  bikesTotal();
});

//* Search -------------------------------------------------------------------->
//  Search elements
var searchValue = "";
var searchButton = document.getElementById("search-button");
var searchInput = document.getElementById("search-input");
var searchFixed = document.getElementById("search-fixed");
var searchLocation = document.getElementById("search-location");
const search = function(stations, id) {
  const index = stations.findIndex(function(station, index) {
    return station.station_id === id;
  });
  return stations[index];
};

//* Search button click ------------------------------------------------------->
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = searchInput.value;
  bikesStation();
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
var refreshButton = document.getElementById("refresh-button");
refreshButton.addEventListener("click", function(event) {
  event.preventDefault();
  if (searchFixed.checked == true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

//! STATION ------------------------------------------------------------------->
function bikesStation() {
  if (searchValue !== "") {
    $(".updating").show();
    $.ajax({
      type: "GET",
      dataType: "json",
      url: urlPrefix + urlInformation,
      data: {
        client_id: client_id,
        client_secret: client_secret
      },
      success: function(data) {
        var responseInfo = data.data.stations;
        console.log(responseInfo);

        let result = search(responseInfo, searchValue);

        if (typeof result !== "undefined") {
          number = pad(result.station_id);
          numberH2 = number.toString();

          name = result.name;
          nameNum = name.slice(0, 3);

          $("h2").html("");

          if (numberH2 === nameNum) {
            $("h2").html("Estación");
            $("h3").html(name);
          } else {
            $("h2").html("Estación");
            $("h3").html(numberH2);
          }
          console.log("station.name ------> " + name);
          console.log("station.nameNum ---> " + nameNum);
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
        console.log(responseStatus);

        const search = function(stations, id) {
          const index = stations.findIndex(function(station, index) {
            return station.station_id === id;
          });
          return stations[index];
        };

        let result = search(responseStatus, searchValue);

        console.log(result.num_bikes_available);
        console.log(result.num_bikes_disabled);

        $("#available > p").html("<strong>" + result.num_bikes_available + "</strong><br>disponibles");
        $("#disabled > p").html("<strong>" + result.num_bikes_disabled + "</strong><br>bloqueadas");
        $("#docks > p").html("<strong>" + result.num_docks_available + "</strong><br>espacios libres");

        var stationLastReported = new Date(result.last_reported * 1000);
        var lastDateTime = stationLastReported.toLocaleTimeString("es-AR");

        $(".last-update > p").html("Última actualización estación " + lastDateTime);
        document.getElementById("search").classList.remove("error");
      },
      error: function() {
        $(".updating").hide();
        $("h2").html("ERROR");
      }
    });
  } else {
    document.getElementById("search").classList.add("error");
  }
}

//! TOTAL --------------------------------------------------------------------->
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

      $(".last-update > p").html("Última actualización total " + lastDateTime);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalAvailable = totalAvailable + responseBikesTotal[i].num_bikes_available;
        totalDisabled = totalDisabled + responseBikesTotal[i].num_bikes_disabled;
        totalDocks = totalDocks + responseBikesTotal[i].num_docks_available;
      }

      //TODO Correct totals
      totalAvailable = totalAvailable - 396;
      totalDocks = totalDocks - 198;

      $("#available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $("#disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $("#docks > p").html("<strong>" + totalDocks + "</strong><br>espacios libres");

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
