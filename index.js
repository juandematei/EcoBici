// Variables for jQuery AJAX
const urlPrefix = "https://cors-anywhere.herokuapp.com/";
const url_stationStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const url_stationInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";
const client_id = config.ID;
const client_secret = config.SECRET;
// Initial variables
var bikesAvailable = 0;
var bikesDisabled = 0;
var docksAvailable = 0;
var docksDisabled = 0;
var searchValue;
// Valid station numbers
var validStations = []; //TODO
// DOM elements
const searchForm = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const searchFixed = document.getElementById("search-fixed");
const searchLocation = document.getElementById("search-location");
const refreshButton = document.getElementById("refresh-button");
//  Add leading zeros to station_id number ------------------------------------>
function pad(n) {
  if (n <= 999) {
    n = ("00" + n).slice(-3);
  }
  return n;
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
  $(".updating").show();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + url_stationStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function(data) {
      var stationStatus = data.data.stations;
      //console.log(stationStatus);

      var lastUpdated = new Date(data.last_updated * 1000);
      var options = { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
      var lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);

      $(".last-update > p").html("Última actualización total " + lastUpdatedTotal);

      for (var i = 0; i < stationStatus.length; i++) {
        bikesAvailable = bikesAvailable + stationStatus[i].num_bikes_available;
        bikesDisabled = bikesDisabled + stationStatus[i].num_bikes_disabled;
        docksAvailable = docksAvailable + stationStatus[i].num_docks_available;
        docksDisabled = docksDisabled + stationStatus[i].num_docks_disabled;
      }

      //! Correct totals
      bikesAvailable = bikesAvailable - 396;
      docksAvailable = docksAvailable - 198;

      $("#bikes-available > p").html("<strong>" + bikesAvailable + "</strong><br>disponibles");
      $("#bikes-disabled > p").html("<strong>" + bikesDisabled + "</strong><br>bloqueadas");
      $("#docks-available > p").html("<strong>" + docksAvailable + "</strong><br>posiciones vacías");
      //$("#docks-disabled > p").html("<strong>" + docksDisabled + "</strong><br>posiciones deshabilitadas");

      var tweet = "Hay " + bikesDisabled + " EcoBici bloqueadas. Probá la app ➡";

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

//! STATION ------------------------------------------------------------------->
function bikesStation() {
  $(".updating").show();
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
      //console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function(stations, number) {
        const resultStationId = stations.find(function(station) {
          return station.name.slice(0, 3) === number;
        });
        return resultStationId;
      };

      let resultStationId = findStationId(stationInformation, searchValue);
      console.log(resultStationId);

      result_id = resultStationId.station_id;
      result_name = resultStationId.name;
      console.log(result_id);
      console.log(result_name);

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
          var stationStatus = data.data.stations;
          //console.log(stationStatus);

          // Get station status for station_id -------------------------------->
          const getStationStatus = function(stations, result_id) {
            const resultStationStatus = stations.find(function(station) {
              return station.station_id === result_id;
            });
            return resultStationStatus;
          };

          let resultStationStatus = getStationStatus(stationStatus, result_id);
          console.log(resultStationStatus);

          bikesAvailable = resultStationStatus.num_bikes_available;
          bikesDisabled = resultStationStatus.num_bikes_disabled;
          docksAvailable = resultStationStatus.num_docks_available;
          docksDisabled = resultStationStatus.num_docks_disabled;
          console.log(bikesAvailable);
          console.log(bikesDisabled);
          console.log(docksAvailable);
          console.log(docksDisabled);

          $("h2").html("");
          $("h2").html("Estación");
          $("h3").html("");
          $("h3").html(result_name);

          $("#bikes-available > p").html("<strong>" + bikesAvailable + "</strong><br>disponibles");
          $("#bikes-disabled > p").html("<strong>" + bikesDisabled + "</strong><br>bloqueadas");
          $("#docks-available > p").html("<strong>" + docksAvailable + "</strong><br>posiciones vacías");
          //$("#docks-disabled > p").html("<strong>" + docksDisabled + "</strong><br>posiciones deshabilitadas");

          var tweet = "Hay " + bikesDisabled + " EcoBici bloqueadas en la estación " + result_name + ". Probá la app ➡";

          $("#twitter").html("");
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
  if (searchFixed.checked == false) {
    searchInput.value = "";
  }
}
