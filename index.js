// Variables for jQuery AJAX
const urlPrefix = "https://cors-anywhere.herokuapp.com/";
const url_stationStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const url_stationInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";
const client_id = config.ID;
const client_secret = config.SECRET;
// Initial variables
var totalBikesAvailable = 0;
var totalBikesDisabled = 0;
var totalDocksAvailable = 0;
var totalDocksDisabled = 0;
var searchValue;
// Valid station numbers
var stationNumber = []; //TODO
// DOM elements
const searchForm = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const searchFixed = document.getElementById("search-fixed");
const searchLocation = document.getElementById("search-location");
const refreshButton = document.getElementById("refresh-button");
//  Add leading zeros to station_id number ------------------------------------>
function pad(number) {
  if (number <= 999) {
    number = ("00" + number).slice(-3);
  }
  return number;
}

//* Show bikes totals when page loads ----------------------------------------->
$(document).ready(function() {
  bikesTotal();
});

//* Search button click ------------------------------------------------------->
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = pad(searchInput.value);

  if (searchValue !== "") {
    //TODO Add validation
    bikesStation();
  } else {
    document.getElementById("search").classList.add("error");
    searchInput.value = "";
    searchValue = "";
    setTimeout(function() {
      document.getElementById("search").classList.remove("error");
    }, 4000);
  }
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

//! TOTAL --------------------------------------------------------------------->
function bikesTotal() {
  //$(".updating").show();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + url_stationStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function(data) {
      var responseBikesTotal = data.data.stations;
      //console.log(responseBikesTotal);

      var lastUpdated = new Date(data.last_updated * 1000);
      var options = { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
      var lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);

      $(".last-update > p").html("Última actualización total " + lastUpdatedTotal);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalBikesAvailable = totalBikesAvailable + responseBikesTotal[i].num_bikes_available;
        totalBikesDisabled = totalBikesDisabled + responseBikesTotal[i].num_bikes_disabled;
        totalDocksAvailable = totalDocksAvailable + responseBikesTotal[i].num_docks_available;
        totalDocksDisabled = totalDocksDisabled + responseBikesTotal[i].num_docks_disabled;
        responseStationId = responseBikesTotal[i].station_id;
        stationNumber.push(responseStationId);
      }

      //! Correct totals
      totalBikesAvailable = totalBikesAvailable - 396;
      totalDocksAvailable = totalDocksAvailable - 198;

      $("#bikes-available > p").html("<strong>" + totalBikesAvailable + "</strong><br>disponibles");
      $("#bikes-disabled > p").html("<strong>" + totalBikesDisabled + "</strong><br>bloqueadas");
      $("#docks-available > p").html("<strong>" + totalDocksAvailable + "</strong><br>posiciones vacías");
      $("#docks-disabled > p").html("<strong>" + totalDocksDisabled + "</strong><br>posiciones deshabilitadas");

      var tweet = "Hay " + totalBikesDisabled + " EcoBici bloqueadas. Probá la app ➡";

      twttr.widgets.createHashtagButton("", document.getElementById("twitter"), {
        text: tweet,
        url: "https://juandematei.github.io/EcoBici",
        hashtags: "EliminenElBotón,EcoBici",
        via: "juandematei",
        related: "baecobici,elbotonmalo",
        size: "large",
        lang: "es"
      });

      $(".updating").hide();
    }
  });
}

//! STATION ------------------------------------------------------------------->
function bikesStation() {
  //$(".updating").show();
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
      console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const search = function(stations, number) {
        const resultStationId = stations.find(function(station, station_id) {
          return station.name.slice(0, 3) === number;
        });
        return resultStationId.station_id;
      };

      let resultStationId = search(stationInformation, searchValue);
      console.log("El station_id de la estación " + searchValue + " es: " + resultStationId);

      // Get station data ----------------------------------------------------->
      $.ajax({
        type: "GET",
        dataType: "json",
        url: urlPrefix + url_stationStatus,
        data: {
          client_id: client_id,
          client_secret: client_secret
        },
        success: function(data) {
          var responseBikesStation = data.data.stations;
          console.log(responseBikesStation);
        }
      });
    }
  });
  if (searchFixed.checked == false) {
    searchInput.value = "";
  }
}
