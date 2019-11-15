// API tokens ----------------------------------------------------------------->
const client_id = config.ID;
const client_secret = config.SECRET;
// API url -------------------------------------------------------------------->
const urlCors = new URL("https://cors-anywhere.herokuapp.com/");
const urlBase = new URL("https://apitransporte.buenosaires.gob.ar");
// API "stationStatus" -------------------------------------------------------->
const urlStatus = new URL("/ecobici/gbfs/stationStatus", urlBase);
urlStatus.searchParams.set("client_id", client_id);
urlStatus.searchParams.set("client_secret", client_secret);
const xhrStatus = urlCors + urlStatus;
// API "stationInformation" --------------------------------------------------->
const urlInformation = new URL("/ecobici/gbfs/stationInformation", urlBase);
urlInformation.searchParams.set("client_id", client_id);
urlInformation.searchParams.set("client_secret", client_secret);
const xhrInformation = urlCors + urlInformation;

// Initial variables
var bikesAvailable = 0;
var bikesDisabled = 0;
var docksAvailable = 0;
var docksDisabled = 0;
var bikesFake = 0;
// Valid station numbers
var validStations = [];
// DOM elements
var searchBox = document.querySelector("#search-box");
var searchButton = document.querySelector("#search-button");
var searchInput = document.querySelector("#search-input");
var searchFixed = document.querySelector("#search-fixed");
var searchValue = "";
var locationButton = document.querySelector("#location-button");
var refreshButton = document.querySelector("#refresh-button");
var twitterButton = document.querySelector("#twitter-button");
var updating = document.querySelector(".updating");

//  Add leading zeros to station_id number ------------------------------------>
function pad(n) {
  if (n <= 999) {
    n = ("00" + n).slice(-3);
  }
  return n;
}

// Show bikes totals when page loads ----------------------------------------->
(function () {
  bikesTotal();
  //getValidStations();
})();

// Search button click ------------------------------------------------------->
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

// Start search by pressing enter on search box ------------------------------>
searchInput.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    searchButton.click();
  }
});

// Refresh results ----------------------------------------------------------->
refreshButton.addEventListener("click", function (event) {
  event.preventDefault();
  if (searchFixed.checked == true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

// Change refresh-button color when searh is fixed --------------------------->
searchFixed.addEventListener("click", function (event) {
  if (searchFixed.checked === true) {
    refreshButton.classList.add("fixed");
  } else {
    refreshButton.classList.remove("fixed");
  }
});

//! TOTAL --------------------------------------------------------------------->
function bikesTotal() {
  updating.classList.remove("hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrStatus, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationStatus = resp.data.stations;
      console.log("Resultado bikesTotal: ");
      console.log(stationStatus);

      var lastUpdated = new Date(resp.last_updated * 1000);
      var options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      };
      var lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);

      //$(".last-update > p").html("Última actualización total " + lastUpdatedTotal);

      for (var i = 0; i < stationStatus.length; i++) {
        bikesAvailable = bikesAvailable + stationStatus[i].num_bikes_available;
        bikesDisabled = bikesDisabled + stationStatus[i].num_bikes_disabled;
        docksAvailable = docksAvailable + stationStatus[i].num_docks_available;
        docksDisabled = docksDisabled + stationStatus[i].num_docks_disabled;
        bikesFake =
          bikesFake + stationStatus[i].num_bikes_available_types.ebike;
      }

      //! Correct totals
      console.log("Total bicis falsas: " + bikesFake);
      bikesAvailable = bikesAvailable - bikesFake * 2;
      docksAvailable = docksAvailable - bikesFake * 1;

      var card_available = document.querySelector("#bikes-available > span.numb");
      card_available.append(bikesAvailable);
      //$("#bikes-available > span.text").html("bicis disponibles");

      //$("#bikes-disabled > span.numb").html(bikesDisabled);
      //$("#bikes-disabled > span.text").html("bicis bloqueadas");

      //$("#docks-available > span.numb").html(docksAvailable);
      //$("#docks-available > span.text").html("posiciones libres");

      //$("#docks-disabled > span.numb").html(docksDisabled);
      //$("#docks-disabled > span.text").html("posiciones bloqueadas");

      var text = encodeURIComponent(
        "🚳 Hay " + bikesDisabled + " EcoBici bloqueadas. Probá la app!"
      );
      var url = "https://juandematei.github.io/EcoBici/";
      var hashtags = "EliminenElBotón,EcoBici";
      var via = "juandematei";
      var related = "elbotonmalo,baecobici";

      twitterButton.href =
        "https://twitter.com/intent/tweet?text=" +
        text +
        "&url=" +
        url +
        "&hashtags=" +
        hashtags +
        "&via=" +
        via +
        "&related=" +
        related;

      updating.classList.add("hide");


    } else {
      // We reached our target server, but it returned an error
      console.log("Error 1");
    }
  };
  xhr.onerror = function () {
    // There was a connection error of some sort
    console.log("Error 2");
  };
  xhr.send();
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
      console.log("Resultado bikesStation INFO: ");
      console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function (stations, number) {
        const resultStationId = stations.find(function (station) {
          return station.name.slice(0, 3) === number;
        });
        return resultStationId;
      };

      let resultStationId = findStationId(stationInformation, searchValue);
      console.log("Resultado stationId-name: " + resultStationId);

      result_id = resultStationId.station_id;
      result_name = resultStationId.name;
      console.log("ID info: " + result_id);
      console.log("Nombre: " + result_name);

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
          console.log("Resultado bikesStation STATUS: ");
          console.log(stationStatus);

          // Get station status for station_id -------------------------------->
          const getStationStatus = function (stations, result_id) {
            const resultStationStatus = stations.find(function (station) {
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
          console.log("Disponibles: " + bikesAvailable);
          console.log("Bloqueadas: " + bikesDisabled);
          console.log("Docks disponibles: " + docksAvailable);
          console.log("Docks bloqueados: " + docksDisabled);

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

          var text = encodeURIComponent(
            "🚳 Hay " +
            bikesDisabled +
            " EcoBici bloqueadas en la estación " +
            result_name +
            ". Probá la app!"
          );
          var url = "https://juandematei.github.io/EcoBici/";
          var hashtags = "EliminenElBotón,EcoBici";
          var via = "juandematei";
          var related = "elbotonmalo,baecobici";

          twitterButton.href =
            "https://twitter.com/intent/tweet?text=" +
            text +
            "&url=" +
            url +
            "&hashtags=" +
            hashtags +
            "&via=" +
            via +
            "&related=" +
            related;

          $(".updating").fadeOut();
        },
        error: function (jqXHR) {
          console.log("Error: " + jqXHR.status);
          console.log("Error: " + jqXHR.responseText);
          $(".updating").fadeOut(100);
          $("h2").html("");
          $("h2").html("ERROR");
          $("h3").html("");
          $("h3").html("Mensaje");
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
      console.log("Números de estación válidos: ");
      console.log(validStations);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
}

//* Get number of "PLANNED" stations
function getStationStatus() {
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
      console.log("Resultado bikesTotal: ");
      console.log(stationStatus);

      var status = "END_OF_LIFE";
      var count = stationStatus.filter(obj => obj.status === status).length;
      console.log("Total: " + count);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
}
