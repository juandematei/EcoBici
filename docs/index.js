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
//  Valid station numbers
var stationNumber = [];
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
$(document).ready(function() {
  bikesTotal();
});

//* Search -------------------------------------------------------------------->
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

  if (searchValue !== "") {
    if (stationNumber.includes(searchValue)) {
      bikesStation();
    } else {
      document.getElementById("search").classList.add("error");
      searchInput.placeholder = "No existe esa estación";
      searchInput.value = "";
      searchValue = "";
      setTimeout(function() {
        document.getElementById("search").classList.remove("error");
        searchInput.placeholder = "Ingresa una estación";
      }, 4000);
    }
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
  }
}
function showPosition(position) {
  searchLocation = "Lat: " + position.coords.latitude + " / Lon: " + position.coords.longitude;
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

      var lastUpdated = new Date(data.last_updated * 1000);
      var options = { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
      var lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);

      $(".last-update > p").html("Última actualización total " + lastUpdatedTotal);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalAvailable = totalAvailable + responseBikesTotal[i].num_bikes_available;
        totalDisabled = totalDisabled + responseBikesTotal[i].num_bikes_disabled;
        totalDocks = totalDocks + responseBikesTotal[i].num_docks_available;

        responseStationId = responseBikesTotal[i].station_id;
        stationNumber.push(responseStationId);
      }

      //TODO Correct totals
      totalAvailable = totalAvailable - 396;
      totalDocks = totalDocks - 198;

      $("#available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $("#disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $("#docks > p").html("<strong>" + totalDocks + "</strong><br>espacios libres");

      var tweet = "Hay " + totalDisabled + " EcoBici bloqueadas. Probá la app ➡";

      twttr.widgets.createHashtagButton("EliminenElBotón", document.getElementById("twitter"), {
        size: "large",
        text: tweet,
        hashtags: "EliminenElBotón,EcoBici",
        via: "juandematei",
        related: "baecobici,elbotonmalo",
        url: "https://juandematei.github.io/EcoBici"
      });

      $(".updating").hide();
    },
    error: function() {
      $(".updating").hide();
      $("h2").html("ERROR");
    }
  });
}

//! STATION ------------------------------------------------------------------->
function bikesStation() {
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
      }
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

          const search = function(stations, id) {
            const index = stations.findIndex(function(station, index) {
              return station.station_id === id;
            });
            return stations[index];
          };

          let result = search(responseStatus, searchValue);

          var stationAvailable = result.num_bikes_available;
          var stationDisabled = result.num_bikes_disabled;
          var stationDocks = result.num_docks_available;

          $("#available > p").html("<strong>" + stationAvailable + "</strong><br>disponibles");
          $("#disabled > p").html("<strong>" + stationDisabled + "</strong><br>bloqueadas");
          $("#docks > p").html("<strong>" + stationDocks + "</strong><br>espacios libres");

          var stationLastReported = new Date(result.last_reported * 1000);
          var options = { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
          var lastUpdatedStation = stationLastReported.toLocaleString("es-AR", options);

          $(".last-update > p").html("Última actualización estación " + lastUpdatedStation);

          var tweet = "Hay " + stationDisabled + " EcoBici bloqueadas en la estación " + searchValue + ". Probá la app ➡";

          $("#twitter").html("");
          twttr.widgets.createHashtagButton(document.getElementById("twitter"), {
            text: tweet,
            url: "https://juandematei.github.io/EcoBici",
            hashtags: "EliminenElBotón,EcoBici",
            via: "juandematei",
            related: "baecobici,elbotonmalo",
            size: "large",
            lang: "es"
          });
          document.getElementById("search").classList.remove("error");
          $(".updating").hide();
        },
        error: function() {
          $(".updating").hide();
          $("h2").html("ERROR");
        }
      });
    },
    error: function() {
      $(".updating").hide();
      $("h2").html("ERROR");
    }
  });
  if (searchFixed.checked == false) {
    searchInput.value = "";
  }
}
