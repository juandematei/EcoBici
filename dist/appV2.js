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

// Initial variables ---------------------------------------------------------->
var bikesAvailableInitial = 0;
var bikesDisabledInitial = 0;
var docksAvailableInitial = 0;
var docksDisabledInitial = 0;
var bikesFakeInitial = 0;
var capacityInitial = 0;

// Search initial values ------------------------------------------------------>
var stationsValid = [];
var stationsLocation = [];
var searchValue = "";
var searchFixed = false;

// DOM - Search --------------------------------------------------------------->
const searchBox = document.querySelector(".search-box");
const searchButton = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const fixedButton = document.querySelector(".fixed-btn");
const fixedButtonIcon = document.querySelector(".fixed-btn > ion-icon");
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
const cardBikesAvailableNumb = document.querySelector(".bikes-available > span.numb");
const cardBikesAvailableText = document.querySelector(".bikes-available > span.text");
const cardBikesDisabledNumb = document.querySelector(".bikes-disabled > span.numb");
const cardBikesDisabledText = document.querySelector(".bikes-disabled > span.text");
const cardDocksAvailableNumb = document.querySelector(".docks-available > span.numb");
const cardDocksAvailableText = document.querySelector(".docks-available > span.text");
const cardDocksDisabledNumb = document.querySelector(".docks-disabled > span.numb");
const updateTime = document.querySelector(".last-update > p > span");

//!  -------------------------------------------------------------------------->
(function() {
  bikesTotal();
  getstationsValid();
  checkGeolocation();
})();

searchButton.addEventListener("click", function(event) {
  searchValue = searchInput.value;
  searchButtonClick();
});

searchInput.addEventListener("keyup", function(event) {
  searchInputEnter();
});

fixedButton.addEventListener("click", function() {
  fixedButtonClick();
});

locationButton.addEventListener("click", function() {
  bikesStation();
});

refreshButton.addEventListener("click", function(event) {
  refreshButtonClick();
});

// Get accumulated numbers ---------------------------------------------------->
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
      updateTime.textContent = lastUpdatedTotal;

      // Get total bikes available
      var bikesAvailableAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_bikes_available;
      }, bikesAvailableInitial);
      console.log("num_bikes_available: " + bikesAvailableAcc);
      cardBikesAvailableNumb.textContent = bikesAvailableAcc;

      // Get total bikes disabled
      var bikesDisabledAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_bikes_disabled;
      }, bikesDisabledInitial);
      console.log("num_bikes_disabled: " + bikesDisabledAcc);
      cardBikesDisabledNumb.textContent = bikesDisabledAcc;

      // Get total docks available
      var docksAvailableAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_docks_available;
      }, docksAvailableInitial);
      console.log("num_docks_available: " + docksAvailableAcc);
      cardDocksAvailableNumb.textContent = docksAvailableAcc;

      // Get total docks disabled
      var docksDisabledAcc = stationStatus.reduce(function(acc, currentValue) {
        return acc + currentValue.num_docks_disabled;
      }, docksDisabledInitial);
      console.log("num_docks_disabled: " + docksDisabledAcc);

      // Get total fake bikes
      var bikesFakeAcc = stationStatus.reduce(function(acc, currentValue) {
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
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    console.log("Error 2");
  };
  xhr.send();
}

// Get station numbers (search) ----------------------------------------------->
function bikesStation() {
  updating.classList.remove("hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationInformation = resp.data.stations;
      console.log("Respuesta stationInformation: ");
      console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function(stations, number) {
        const resultStationId = stations.find(function(station) {
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
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          let resp = JSON.parse(this.response);
          let stationStatus = resp.data.stations;
          console.log("Respuesta stationStatus: ");
          console.log(stationStatus);

          // Get station status for station_id -------------------------------->
          const getStationStatus = function(stations, result_id) {
            const resultStationStatus = stations.find(function(station) {
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

          cardBikesAvailableNumb.textContent = bikesAvailableStation;
          if (bikesAvailableStation === 1) {
            cardBikesAvailableText.textContent = "bici disponible";
          } else {
            cardBikesAvailableText.textContent = "bicis disponibles";
          }

          cardBikesDisabledNumb.textContent = bikesDisabledStation;
          if (bikesDisabledStation === 1) {
            cardBikesDisabledText.textContent = "bici bloqueada";
          } else {
            cardBikesDisabledText.textContent = "bicis bloqueadas";
          }

          cardDocksAvailableNumb.textContent = docksAvailableStation;
          if (docksAvailableStation === 1) {
            cardDocksAvailableText.textContent = "espacio libre";
          } else {
            cardDocksAvailableText.textContent = "espacios libres";
          }

          // Tweet button
          var text = encodeURIComponent("🚳 Hay " + bikesDisabledStation + " EcoBici bloqueadas en la estación " + result_name + ". Probá la app!");
          var url = "https://juandematei.github.io/EcoBici/";
          var hashtags = "EliminenElBotón,EcoBici";
          var via = "juandematei";
          var related = "elbotonmalo,baecobici";
          twitterButton.href = "https://twitter.com/intent/tweet?text=" + text + "&url=" + url + "&hashtags=" + hashtags + "&via=" + via + "&related=" + related;

          if (searchFixed === false) {
            searchInput.value = "";
            searchValue = "";
          }

          updating.classList.add("hide");
        } else {
          console.log("Error 1");
        }
      };
      xhr.onerror = function() {
        console.log("Error 2");
      };
      xhr.send();
    } else {
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    console.log("Error 2");
  };
  xhr.send();
}

// Get valid station number from station name --------------------------------->
function getstationsValid() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationInformation = resp.data.stations;

      for (var i = 0; i < stationInformation.length; i++) {
        stationNumber = stationInformation[i].name.slice(0, 3);
        stationsValid.push(stationNumber);
        stationsLocation.id = stationInformation[i].name.slice(0, 3);
        stationsLocation.lat = stationInformation[i].lat;
        stationsLocation.lon = stationInformation[i].lon;
        stationsLocation.push({ id: stationsLocation.id, lat: stationsLocation.lat, lon: stationsLocation.lon });
      }
      console.log("Stations id, lat, lon: ");
      console.log(stationsLocation);
    } else {
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    console.log("Error 2");
  };
  xhr.send();
}

// Get all different status in "stationStatus" and count them ----------------->
function getUniqueStatus() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrStatus, true);
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationStatus = resp.data.stations;

      let uniqueStatus = [...new Set(stationStatus.map(item => item.status))];

      console.log("Unique status: ");
      console.log(uniqueStatus);

      uniqueStatus.forEach(element => {
        let count = stationStatus.filter(obj => obj.status === element).length;
        console.log("Total " + element + ": " + count);
      });
    } else {
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    console.log("Error 2");
  };
  xhr.send();
}

// Change refresh-button color when searh is fixed ---------------------------->
function fixedButtonClick() {
  searchFixed = !searchFixed;
  if (searchFixed === true) {
    refreshButton.classList.add("fixed");
    fixedButton.classList.add("fixed");
    fixedButtonIcon.classList.remove("fa-unlock");
    fixedButtonIcon.classList.add("fa-lock");
  } else {
    refreshButton.classList.remove("fixed");
    fixedButton.classList.remove("fixed");
    fixedButtonIcon.classList.remove("fa-lock");
    fixedButtonIcon.classList.add("fa-unlock");
    searchInput.value = "";
  }
}

// Refresh results ------------------------------------------------------------>
function refreshButtonClick() {
  event.preventDefault();
  if (searchFixed === true) {
    searchButton.click();
  } else {
    location.reload();
  }
}

// Search button click -------------------------------------------------------->
function searchButtonClick() {
  event.preventDefault();

  if (searchValue === "") {
    searchBox.classList.add("error");
    searchInput.placeholder = "Ingresá una estación";
    setTimeout(function() {
      searchBox.classList.remove("error");
      searchInput.placeholder = "Buscar una estación";
    }, 4000);
  } else {
    searchValue = pad(searchInput.value);
    if (stationsValid.includes(searchValue)) {
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
}

// Start search by pressing enter on search box ------------------------------->
function searchInputEnter() {
  if (event.keyCode === 13) {
    searchButton.click();
  }
}

// Add leading zeros to station_id number ------------------------------------->
function pad(n) {
  if (n <= 999) {
    n = ("00" + n).slice(-3);
  }
  return n;
}

// Distance function ---------------------------------------------------------->
function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
}

// Check geolocation
function checkGeolocation() {
  if ("geolocation" in navigator) {
    /* geolocation is available */
    navigator.geolocation.watchPosition(function(position) {
      var closestStation = "";
      var poslat = position.coords.latitude;
      var poslon = position.coords.longitude;
      for (var i = 0; i < stationsLocation.length; i++) {
        // if this location is within 0.1KM of the user, add it to the list
        if (distance(poslat, poslon, stationsLocation[i].lat, stationsLocation[i].lon, "K") <= 1) {
          var closestStation = stationsLocation[i].id;
          searchValue = closestStation;
          locationButton.disabled = false;
          locationButton.classList.add("watching");
        }
      }
      console.log("User position: " + position.coords.latitude + position.coords.longitude);
      console.log("Estacion mas cercana: " + closestStation);
    });
  } else {
    /* geolocation IS NOT available */
    locationButton.disabled = true;
    locationButton.classList.remove("watching");
  }
}
