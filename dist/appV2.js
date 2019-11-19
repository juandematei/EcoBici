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
var searchValue = "399";
var searchFixed = false;

// DOM - Search --------------------------------------------------------------->
const searchBox = document.querySelector(".search-box");
const searchButton = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const fixedButton = document.querySelector(".fixed-btn");
const locationButton = document.querySelector(".location-btn");
// DOM - CTA buttons ---------------------------------------------------------->
const refreshButton = document.querySelector(".refresh-btn");
const twitterButton = document.querySelector(".twitter-btn");
// DOM - Updating ------------------------------------------------------------->
const updating = document.querySelector(".updating");
// DOM - Headers -------------------------------------------------------------->
const h2 = document.querySelector("h2");
const h3 = document.querySelector("h3");
// DOM - Response ------------------------------------------------------------->
const cardBikesAvailable = document.querySelector(".bikes-available > span.numb");
const cardBikesDisabled = document.querySelector(".bikes-disabled > span.numb");
const cardDocksAvailable = document.querySelector(".docks-available > span.numb");
const cardDocksDisabled = document.querySelector(".docks-disabled > span.numb");
const updateTime = document.querySelector(".last-update > p > span");

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
  getValidStations();
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
  if (searchFixed === true) {
    searchButton.click();
  } else {
    location.reload();
  }
});

// Change refresh-button color when searh is fixed --------------------------->
fixedButton.addEventListener("click", function (event) {
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
  xhr.onload = function () {
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
      updateTime.textContent = lastUpdatedTotal;

      // Get total bikes available
      var bikesAvailableAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_available;
      }, bikesAvailableInitial);
      console.log("num_bikes_available: " + bikesAvailableAcc);
      cardBikesAvailable.textContent = bikesAvailableAcc;

      // Get total bikes disabled
      var bikesDisabledAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_disabled;
      }, bikesDisabledInitial);
      console.log("num_bikes_disabled: " + bikesDisabledAcc);
      cardBikesDisabled.textContent = bikesDisabledAcc;

      // Get total docks available
      var docksAvailableAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_docks_available;
      }, docksAvailableInitial);
      console.log("num_docks_available: " + docksAvailableAcc);
      //cardDocksAvailable.append(docksAvailableAcc);

      // Get total docks disabled
      var docksDisabledAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_docks_disabled;
      }, docksDisabledInitial);
      console.log("num_docks_disabled: " + docksDisabledAcc);
      //cardDocksDisabled.append(docksDisabledAcc);

      // Get total fake bikes
      var bikesFakeAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_available_types.ebike;
      }, bikesFakeInitial);
      console.log("num_bikes_available_types.ebike: " + bikesFakeAcc);
      // Correct totals
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
  xhr.onerror = function () {
    // There was a connection error of some sort
    console.log("Error 2");
  };
  xhr.send();
}

//  STATION ------------------------------------------------------------------->
function bikesStation() {
  updating.classList.remove("hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationInformation = resp.data.stations;
      console.log("Respuesta stationInformation: ");
      console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function (stations, number) {
        const resultStationId = stations.find(function (station) {
          return station.name.slice(0, 3) === number;
        });
        return resultStationId;
      };

      let resultStationId = findStationId(stationInformation, searchValue);

      result_id = resultStationId.station_id;
      result_name = resultStationId.name;
      console.log(result_id, result_name);

      // Get station data ----------------------------------------------------->
      let xhr = new XMLHttpRequest();
      xhr.open("GET", xhrStatus, true);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          let resp = JSON.parse(this.response);
          let stationStatus = resp.data.stations;
          console.log("Respuesta stationStatus: ");
          console.log(stationStatus);

          // Get station status for station_id -------------------------------->
          const getStationStatus = function (stations, result_id) {
            const resultStationStatus = stations.find(function (station) {
              return station.station_id === result_id;
            });
            return resultStationStatus;
          };

          let resultStationStatus = getStationStatus(stationStatus, result_id);
          bikesAvailableStation = resultStationStatus.num_bikes_available;
          bikesDisabledStation = resultStationStatus.num_bikes_disabled;
          docksAvailableStation = resultStationStatus.num_docks_available;
          docksDisabledStation = resultStationStatus.num_docks_disabled;
          console.log(bikesAvailableStation, bikesDisabledStation, docksAvailableStation, docksDisabledStation);

          h2.textContent = "Estación";
          h3.textContent = result_name;

          cardBikesAvailable.textContent = bikesAvailableStation;
          cardBikesDisabled.textContent = bikesDisabledStation;


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

// Get valid station number from station name
async function getValidStations() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationInformation = resp.data.stations;

      for (var i = 0; i < stationInformation.length; i++) {
        station = stationInformation[i].name.slice(0, 3);
        validStations.push(station);
      }
      console.log("Números estación válidos: ");
      console.log(validStations);
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
