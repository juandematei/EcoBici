// Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";
// Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const url_stationStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const url_stationInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";
// 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
const client_id = config.ID;
const client_secret = config.SECRET;

// Global variables ---------------------------------------------------------->
//  Initial counters
var totalAvailable = 0;
var totalDisabled = 0;
var totalDocks = 0;
var totalDocksDisabled = 0;
//  Search
var searchValue;
var searchForm = document.getElementById("search");
var searchButton = document.getElementById("search-button");
var searchInput = document.getElementById("search-input");
var searchFixed = document.getElementById("search-fixed");
var searchLocation = document.getElementById("search-location");
//  Refresh
var refreshButton = document.getElementById("refresh-button");

//* Show bikes totals when page loads ----------------------------------------->
$(document).ready(function() {});

//* Search button click ------------------------------------------------------->
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = pad(searchInput.value);
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

//* Refresh results ----------------------------------------------------------->
refreshButton.addEventListener("click", function(event) {
  event.preventDefault();
  if (searchFixed.checked == true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

//! Makes all 'searchValue' a 3-digit number ----------------------------------->
function pad(number) {
  if (number <= 999) {
    number = ("00" + number).slice(-3);
  }
  return number;
}

//! STATION ------------------------------------------------------------------->
function bikesStation() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + url_stationInformation,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function(data) {
      var stationInformation = data.data.stations;

      const findStationId = function(allStations, number) {
        const resultStationId = allStations.find(function(oneStation, station_id) {
          return oneStation.name.slice(0, 3) === number;
        });
        return resultStationId.station_id;
      };

      let result = findStationId(stationInformation, searchValue);
      console.log("El station_id de la estación " + searchValue + " es: " + result);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("jqXHR:");
      console.log(jqXHR);
      console.log("textStatus:");
      console.log(textStatus);
      console.log("errorThrown:");
      console.log(errorThrown);
    }
  });
}
