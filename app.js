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
// Valid station numbers
var validStations = [];
// DOM elements
var searchBox = document.getElementById("search-box");
var searchButton = document.getElementById("search-button");
var searchInput = document.getElementById("search-input");
var searchFixed = document.getElementById("search-fixed");
var searchValue = "";
var locationButton = document.getElementById("location-button");
var refreshButton = document.getElementById("refresh-button");
var twitterButton = document.getElementById("twitter-button");
//  Add leading zeros to station_id number ------------------------------------>
function pad(n) {
  if (n <= 999) {
    n = ("00" + n).slice(-3);
  }
  return n;
}

//* Show bikes totals when page loads ----------------------------------------->
$(document).ready(function () {
  bikesTotal();
  getValidStations();
});

//* Search button click ------------------------------------------------------->
searchButton.addEventListener("click", function (event) {
  event.preventDefault();
  searchValue = searchInput.value;

  if (searchValue === "") {
    searchBox.classList.add("error");
    searchInput.placeholder = "Ingresá una estación";
    setTimeout(function () {
      searchBox.classList.remove("error");
      searchInput.placeholder = "Buscar una estación";
    }, 4000);
  } else {
    searchValue = pad(searchInput.value);
    if (validStations.includes(searchValue)) {
      bikesStation();
      searchInput.blur();
    } else {
      searchInput.value = "";
      searchBox.classList.add("error");
      searchInput.placeholder = "No existe esa estación";
      setTimeout(function () {
        searchBox.classList.remove("error");
        searchInput.placeholder = "Buscar una estación";
      }, 4000);
    }
  }
});

//* Start search by pressing enter on search box ------------------------------>
searchInput.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    searchButton.click();
  }
});

//* Refresh results ----------------------------------------------------------->
refreshButton.addEventListener("click", function (event) {
  event.preventDefault();
  if (searchFixed.checked == true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

//* Change refresh-button color when searh is fixed --------------------------->
searchFixed.addEventListener("click", function (event) {
  if (searchFixed.checked === true) {
    refreshButton.classList.add("fixed")
  } else {
    refreshButton.classList.remove("fixed")
  }
});

//! TOTAL --------------------------------------------------------------------->
function bikesTotal() {
  $(".updating").fadeIn();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + url_stationStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function (data) {
      var stationStatus = data.data.stations;
      //console.log(stationStatus);

      var lastUpdated = new Date(data.last_updated * 1000);
      var options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      };
      var lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);

      $(".last-update > p").html(
        "Última actualización total " + lastUpdatedTotal
      );

      for (var i = 0; i < stationStatus.length; i++) {
        bikesAvailable = bikesAvailable + stationStatus[i].num_bikes_available;
        bikesDisabled = bikesDisabled + stationStatus[i].num_bikes_disabled;
        docksAvailable = docksAvailable + stationStatus[i].num_docks_available;
        docksDisabled = docksDisabled + stationStatus[i].num_docks_disabled;
      }

      //! Correct totals
      bikesAvailable = bikesAvailable - 396;
      docksAvailable = docksAvailable - 198;

      $("#bikes-available > span.numb").html(bikesAvailable);
      $("#bikes-available > span.text").html("bicis disponibles");

      $("#bikes-disabled > span.numb").html(bikesDisabled);
      $("#bikes-disabled > span.text").html("bicis bloqueadas");

      $("#docks-available > span.numb").html(docksAvailable);
      $("#docks-available > span.text").html("posiciones libres");

      $("#docks-disabled > span.numb").html(docksDisabled);
      $("#docks-disabled > span.text").html("posiciones bloqueadas");

      var text = encodeURIComponent("🚳 Hay " + bikesDisabled + " EcoBici bloqueadas. Probá la app!");
      var url = "https://juandematei.github.io/EcoBici/";
      var hashtags = "EliminenElBotón,EcoBici";
      var via = "juandematei";
      var related = "elbotonmalo,baecobici";

      twitterButton.href = "https://twitter.com/intent/tweet?text=" + text + "&url=" + url + "&hashtags=" + hashtags + "&via=" + via + "&related=" + related;

      $(".updating").fadeOut(100);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
}

//! STATION ------------------------------------------------------------------->
function bikesStation() {
  $(".updating").fadeIn();
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + url_stationInformation,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function (data) {
      var stationInformation = data.data.stations;
      //console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function (stations, number) {
        const resultStationId = stations.find(function (station) {
          return station.name.slice(0, 3) === number;
        });
        return resultStationId;
      };

      let resultStationId = findStationId(stationInformation, searchValue);
      //console.log(resultStationId);

      result_id = resultStationId.station_id;
      result_name = resultStationId.name;
      //console.log(result_id);
      //console.log(result_name);

      // Get station data ----------------------------------------------------->
      $.ajax({
        type: "GET",
        dataType: "json",
        url: urlPrefix + url_stationStatus,
        data: {
          client_id: client_id,
          client_secret: client_secret
        },
        success: function (data) {
          var stationStatus = data.data.stations;
          //console.log(stationStatus);

          // Get station status for station_id -------------------------------->
          const getStationStatus = function (stations, result_id) {
            const resultStationStatus = stations.find(function (station) {
              return station.station_id === result_id;
            });
            return resultStationStatus;
          };

          let resultStationStatus = getStationStatus(stationStatus, result_id);
          //console.log(resultStationStatus);

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

          if (bikesAvailable === 1) {
            $("#bikes-available > span.numb").html(bikesAvailable);
            $("#bikes-available > span.text").html("bici disponible");
          } else {
            $("#bikes-available > span.numb").html(bikesAvailable);
            $("#bikes-available > span.text").html("bicis disponibles");
          }

          if (bikesDisabled === 1) {
            $("#bikes-disabled > span.numb").html(bikesDisabled);
            $("#bikes-disabled > span.text").html("bici bloqueada");
          } else {
            $("#bikes-disabled > span.numb").html(bikesDisabled);
            $("#bikes-disabled > span.text").html("bicis bloqueadas");
          }

          if (docksAvailable === 1) {
            $("#docks-available > span.numb").html(docksAvailable);
            $("#docks-available > span.text").html("posición libre");
          } else {
            $("#docks-available > span.numb").html(docksAvailable);
            $("#docks-available > span.text").html("posiciones libres");
          }

          if (docksDisabled === 1) {
            $("#docks-disabled > span.numb").html(docksDisabled);
            $("#docks-disabled > span.text").html("posición bloqueada");
          } else {
            $("#docks-disabled > span.numb").html(docksDisabled);
            $("#docks-disabled > span.text").html("posiciones bloqueadas");
          }

          var text = encodeURIComponent("🚳 Hay " + bikesDisabled + " EcoBici bloqueadas en la estación " + result_name + ". Probá la app!");
          var url = "https://juandematei.github.io/EcoBici/";
          var hashtags = "EliminenElBotón,EcoBici";
          var via = "juandematei";
          var related = "elbotonmalo,baecobici";

          twitterButton.href = "https://twitter.com/intent/tweet?text=" + text + "&url=" + url + "&hashtags=" + hashtags + "&via=" + via + "&related=" + related;

          $(".updating").fadeOut();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log("jqXHR: " + jqXHR);
          console.log("textStatus: " + textStatus);
          console.log("errorThrown: " + errorThrown);
        }
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
  if (searchFixed.checked == false) {
    searchInput.value = "";
  }
}

//! GET VALID STATION NUMBERS ------------------------------------------------->
function getValidStations() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + url_stationInformation,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function (data) {
      var response = data.data.stations;

      for (var i = 0; i < response.length; i++) {
        station = response[i].name.slice(0, 3);
        validStations.push(station);
      }
      //console.log(validStations);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
}
