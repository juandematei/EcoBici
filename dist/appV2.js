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

// DOM - Menu ----------------------------------------------------------------->
const menuToggler = document.querySelector(".menu-toggler");
const menuSidebar = document.querySelector(".side-menu");

// DOM - Search --------------------------------------------------------------->
const searchBox = document.querySelector(".search__box");
const searchButton = document.querySelector(".search__submit");
const searchInput = document.querySelector(".search__input");
const locationButton = document.querySelector(".search__location");

// DOM - CTA buttons ---------------------------------------------------------->
const refreshButton = document.querySelector(".cta__refresh");
const twitterButton = document.querySelector(".cta__twitter");
const fixedButton = document.querySelector(".cta__lock");
const fixedButtonIcon = document.querySelector(".cta__lock > ion-icon");

// DOM - Updating ------------------------------------------------------------->
const updating = document.querySelector(".updating");

// DOM - Headers -------------------------------------------------------------->
const h2 = document.querySelector(".response__header");
const h3 = document.querySelector(".response__name");

// DOM - Response ------------------------------------------------------------->
const cardBikesAvailableNumb = document.querySelector(".card--bikes.card--available > .card__numb");
const cardBikesAvailableText = document.querySelector(".card--bikes.card--available > .card__text");
const cardBikesDisabledNumb = document.querySelector(".card--bikes.card--disabled > .card__numb");
const cardBikesDisabledText = document.querySelector(".card--bikes.card--disabled > .card__text");
const cardDocksAvailableNumb = document.querySelector(".card--docks > .card__numb");
const cardDocksAvailableText = document.querySelector(".card--docks > .card__text");
const updateTime = document.querySelector(".update-time");

//! Main ---------------------------------------------------------------------->
(function() {
  getStationsValid();
  bikesTotal();
})();

// Get accumulated quantities ------------------------------------------------->
function bikesTotal() {
  updating.classList.remove("updating--hide");

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

      updating.classList.add("updating--hide");
    } else {
      console.log("Error 1");
    }
  };
  xhr.onerror = function() {
    console.log("Error 2");
  };
  xhr.send();
}

// Get quantities by station (search) ----------------------------------------->
function bikesStation(busqueda) {
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

      let resultStationId = findStationId(stationInformation, busqueda);

      result_id = resultStationId.station_id;
      result_name = resultStationId.name;
      console.log("station_id: " + result_id + " - station_name: " + result_name);

      // Get station data ----------------------------------------------------->
      let xhr = new XMLHttpRequest();
      xhr.open("GET", xhrStatus, true);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          let resp = JSON.parse(this.response);
          let stationStatus = resp.data.stations;
          //console.log("Respuesta stationStatus: ");
          //console.log(stationStatus);

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

          console.log(resultStationStatus);
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
            searchValue = ""; //TODO Check
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

// Get valid station numbers & location --------------------------------------->
function getStationsValid() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = JSON.parse(this.response);
      var stationInformation = resp.data.stations;

      for (var i = 0; i < stationInformation.length; i++) {
        //TODO Unificar en un único array??
        // Get each station number from station name
        stationNumber = stationInformation[i].name.slice(0, 3);
        stationsValid.push(stationNumber);
        // Get each station location (lat & lon)
        stationsLocation.id = stationInformation[i].name.slice(0, 3);
        stationsLocation.lat = stationInformation[i].lat;
        stationsLocation.lon = stationInformation[i].lon;
        stationsLocation.push([stationsLocation.id, stationsLocation.lat, stationsLocation.lon]);
      }
      console.log("Valid station numbers: ");
      console.log(stationsValid);

      console.log("Stations id, lat, lon: ");
      console.log(stationsLocation);

      checkGeolocation();
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
    fixedButtonIcon.setAttribute("name", "lock");
  } else {
    refreshButton.classList.remove("fixed");
    fixedButton.classList.remove("fixed");
    fixedButtonIcon.setAttribute("name", "unlock");
    searchInput.value = "";
  }
}

// Refresh results ------------------------------------------------------------>
function refreshButtonClick() {
  if (searchFixed === true) {
    searchButton.click();
  } else {
    location.reload();
  }
}

// Search button click -------------------------------------------------------->
function searchButtonClick() {
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
    if (stationsValid.includes(searchValue)) {
      bikesStation(searchValue);
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

//* Search by user location --------------------------------------------------->
// Get User's Coordinate from their Browser
function checkGeolocation() {
  // Geolocation OK
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(UserLocation);
    locationButton.disabled = false;
    locationButton.classList.add("watching");
  }
  // Geolocation not available
  else {
    locationButton.disabled = true;
    locationButton.classList.remove("watching");
  }
}

// Callback function for asynchronous call to HTML5 geolocation
function UserLocation(position) {
  nearestStation(position.coords.latitude, position.coords.longitude);
  console.log("User location: " + position.coords.latitude + position.coords.longitude);
}

// Convert Degress to Radians
function Deg2Rad(deg) {
  return (deg * Math.PI) / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
  lat1 = Deg2Rad(lat1);
  lat2 = Deg2Rad(lat2);
  lon1 = Deg2Rad(lon1);
  lon2 = Deg2Rad(lon2);
  var R = 6371; // km
  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  var y = lat2 - lat1;
  var d = Math.sqrt(x * x + y * y) * R;
  return d;
}

function nearestStation(latitude, longitude) {
  var minDif = 99999;
  var closest;

  for (index = 0; index < stationsLocation.length; ++index) {
    var dif = PythagorasEquirectangular(latitude, longitude, stationsLocation[index][1], stationsLocation[index][2]);
    if (dif < minDif) {
      closest = index;
      minDif = dif;
    }
  }

  searchLocation = stationsLocation[closest][0];
  console.log("Closests station: " + searchLocation);

  var origin = latitude + "," + longitude;
  var destination = stationsLocation[closest][1] + "," + stationsLocation[closest][2];
  var mapLink = "https://www.google.com/maps/dir/?api=1&origin=" + origin + "&destination=" + destination + "&travelmode=walking";
  console.log(mapLink);
}

//* Event listeners ----------------------------------------------------------->
searchButton.addEventListener("click", function(event) {
  event.preventDefault();
  searchButtonClick();
});
searchInput.addEventListener("keyup", function(event) {
  searchInputEnter();
});
//fixedButton.addEventListener("click", function(event) {
//  event.preventDefault();
//  fixedButtonClick();
//});
locationButton.addEventListener("click", function(event) {
  event.preventDefault();
  bikesStation(searchLocation);
});
//refreshButton.addEventListener("click", function(event) {
//  event.preventDefault();
//  refreshButtonClick();
//});
menuToggler.addEventListener("click", function(event) {
  event.preventDefault();
  if (menuSidebar.style.right === "-80%") {
    menuSidebar.style.right = "0";
  } else {
    menuSidebar.style.right = "-80%";
  }
});
