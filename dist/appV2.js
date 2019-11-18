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
var bikesAvailableInitial = 0;
var bikesDisabledInitial = 0;
var docksAvailableInitial = 0;
var docksDisabledInitial = 0;
var bikesFakeInitial = 0;

var validStations = [];
var searchValue = "";
var searchFixed = false;

// DOM elements
var searchBox = document.querySelector(".search-box");
var searchButton = document.querySelector(".search-btn");
var searchInput = document.querySelector(".search-input");
var fixedButton = document.querySelector(".fixed-btn");
var locationButton = document.querySelector(".location-btn");
var refreshButton = document.querySelector(".refresh-btn");
var twitterButton = document.querySelector(".twitter-btn");
var updating = document.querySelector(".updating");
var updateTime = document.querySelector(".last-update > p > span");

//  Add leading zeros to station_id number ------------------------------------>
function pad(n) {
  if (n <= 999) {
    n = ("00" + n).slice(-3);
  }
  return n;
}

// Show bikes totals when page loads ----------------------------------------->
(function() {
  bikesTotal();
  getValidStations();
})();

// Search button click ------------------------------------------------------->
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchValue = searchInput.value;

  if (searchValue === "") {
    searchBox.classList.add("error");
    searchInput.placeholder = "Ingresá una estación";
    setTimeout(function() {
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
      setTimeout(function() {
        searchBox.classList.remove("error");
        searchInput.placeholder = "Buscar una estación";
      }, 4000);
    }
  }
});

// Start search by pressing enter on search box ------------------------------>
searchInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    searchButton.click();
  }
});

// Refresh results ----------------------------------------------------------->
refreshButton.addEventListener("click", function(event) {
  event.preventDefault();
  if (searchFixed === true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

// Change refresh-button color when searh is fixed --------------------------->
fixedButton.addEventListener("click", function(event) {
  searchFixed = !searchFixed;
  if (searchFixed === true) {
    refreshButton.classList.add("fixed");
  } else {
    refreshButton.classList.remove("fixed");
  }
});

// Get accumulated numbers
function bikesTotal() {
  updating.classList.remove("hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrStatus, true);
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationStatus = resp.data.stations;
      console.log("Resultado bikesTotal: ");
      console.log(stationStatus);

      // Get last update time & date
      var lastUpdated = new Date(resp.last_updated * 1000);
      var options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      };
      var lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);
      updateTime.append(lastUpdatedTotal);

      // Get total bikes available
      var bikesAvailableAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_bikes_available;
      }, bikesAvailableInitial);
      console.log(bikesAvailableAcc);
      var card_available = document.querySelector(".bikes-available > span.numb");
      card_available.append(bikesAvailableAcc);

      // Get total bikes disabled
      var bikesDisabledAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_bikes_disabled;
      }, bikesDisabledInitial);
      console.log(bikesDisabledAcc);
      var card_disabled = document.querySelector(".bikes-disabled > span.numb");
      card_disabled.append(bikesDisabledAcc);

      // Get total docks available
      var docksAvailableAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_docks_available;
      }, docksAvailableInitial);
      console.log(docksAvailableAcc);
      var docks_available = document.querySelector(".docks-available > span.numb");
      docks_available.append(docksAvailableAcc);

      // Get total docks disabled
      var docksDisabledAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_docks_disabled;
      }, docksDisabledInitial);
      console.log(docksDisabledAcc);
      var docks_disabled = document.querySelector(".docks-disabled > span.numb");
      docks_disabled.append(docksDisabledAcc);

      // Get total fake bikes
      var bikesFakeAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_bikes_available_types.ebike;
      }, bikesFakeInitial);
      console.log(bikesFakeAcc);

      // Correct totals
      console.log("Total bicis falsas: " + bikesFakeAcc);
      bikesAvailableAcc = bikesAvailableAcc - bikesFakeAcc * 2;
      docksAvailableAcc = docksAvailableAcc - bikesFakeAcc * 1;

      // Tweet button
      var text = encodeURIComponent("🚳 Hay " + bikesDisabledAcc + " EcoBici bloqueadas. Probá la app!");
      var url = "https://juandematei.github.io/EcoBici/";
      var hashtags = "EliminenElBotón,EcoBici";
      var via = "juandematei";
      var related = "elbotonmalo,baecobici";
      twitterButton.href = "https://twitter.com/intent/tweet?text=" + text + "&url=" + url + "&hashtags=" + hashtags + "&via=" + via + "&related=" + related;

      updating.classList.add("hide");
    } else {
      // We reached our target server, but it returned an error
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    // There was a connection error of some sort
    console.log("Error 2");
  };
  xhr.send();
}

//  STATION ------------------------------------------------------------------->
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
    success: function(data) {
      var stationInformation = data.data.stations;
      console.log("Resultado bikesStation INFO: ");
      console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function(stations, number) {
        const resultStationId = stations.find(function(station) {
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
        success: function(data) {
          var stationStatus = data.data.stations;
          console.log("Resultado bikesStation STATUS: ");
          console.log(stationStatus);

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

          var text = encodeURIComponent("🚳 Hay " + bikesDisabled + " EcoBici bloqueadas en la estación " + result_name + ". Probá la app!");
          var url = "https://juandematei.github.io/EcoBici/";
          var hashtags = "EliminenElBotón,EcoBici";
          var via = "juandematei";
          var related = "elbotonmalo,baecobici";

          twitterButton.href = "https://twitter.com/intent/tweet?text=" + text + "&url=" + url + "&hashtags=" + hashtags + "&via=" + via + "&related=" + related;

          $(".updating").fadeOut();
        },
        error: function(jqXHR) {
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
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
  if (searchFixed.checked == false) {
    searchInput.value = "";
  }
}

// Get valid station number from station name
async function getValidStations() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationInformation = resp.data.stations;
      console.log(resp);
      console.log(stationInformation);

      for (var i = 0; i < stationInformation.length; i++) {
        station = stationInformation[i].name.slice(0, 3);
        validStations.push(station);
      }
      console.log(validStations);
    } else {
      // We reached our target server, but it returned an error
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    // There was a connection error of some sort
    console.log("Error 2");
  };
  xhr.send();
}

// Get number of "PLANNED" stations
function getStationStatus() {
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
      console.log("Resultado bikesTotal: ");
      console.log(stationStatus);

      var status = "END_OF_LIFE";
      var count = stationStatus.filter(obj => obj.status === status).length;
      console.log("Total: " + count);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("jqXHR: " + jqXHR);
      console.log("textStatus: " + textStatus);
      console.log("errorThrown: " + errorThrown);
    }
  });
}
