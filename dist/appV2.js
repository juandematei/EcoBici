// API tokens ----------------------------------------------------------------->
const client_id = config.ID;
const client_secret = config.SECRET;
const maps_api_key = config.MAPS_API_KEY;

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
let bikesAvailableInitial = 0;
let bikesDisabledInitial = 0;
let docksAvailableInitial = 0;
let docksDisabledInitial = 0;
let bikesFakeInitial = 0;
let capacityInitial = 0;

// Search initial values ------------------------------------------------------>
let stationsValid = [];
let stationsLocation = [];
let searchValue = "";
let searchFixed = false;

// DOM - Menu ----------------------------------------------------------------->
const menuToggler = document.querySelector(".toggler");
const menuTogglerIcon = document.querySelector(".toggler__icon");
const menuSidebar = document.querySelector(".menu");
let menuOpen = false;

// DOM - Search --------------------------------------------------------------->
const searchBox = document.querySelector(".search__box");
const searchButton = document.querySelector(".search__submit");
const searchInput = document.querySelector(".search__input");
const fixedButton = document.querySelector(".search__fixed");
const fixedButtonIcon = document.querySelector(".search__fixed > ion-icon");

// DOM - CTA buttons ---------------------------------------------------------->
const refreshButton = document.querySelector(".cta__refresh");
const favoriteButton = document.querySelector(".cta__favorite");
const locationButton = document.querySelector(".cta__location");
const mapButton = document.querySelector(".cta__map");
const twitterButton = document.querySelector(".cta__twitter");

// DOM - Updating ------------------------------------------------------------->
const updating = document.querySelector(".updating");

// DOM - Headers -------------------------------------------------------------->
const responseHeader = document.querySelector(".response__header");
const responseName = document.querySelector(".response__name");

// DOM - Response ------------------------------------------------------------->
const cardBikesAvailableNumb = document.querySelector(".card--bikes.card--available > .card__numb");
const cardBikesAvailableText = document.querySelector(".card--bikes.card--available > .card__text");
const cardBikesDisabledNumb = document.querySelector(".card--bikes.card--disabled > .card__numb");
const cardBikesDisabledText = document.querySelector(".card--bikes.card--disabled > .card__text");
const cardDocksAvailableNumb = document.querySelector(".card--docks > .card__numb");
const cardDocksAvailableText = document.querySelector(".card--docks > .card__text");
const updateTime = document.querySelector(".update-time");
const mapImage = document.querySelector(".map-test");

//! Main ---------------------------------------------------------------------->
(function () {
  getStationsValid();
  bikesTotal();
})();

// Get accumulated quantities ------------------------------------------------->
function bikesTotal() {
  updating.classList.remove("updating--hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrStatus, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationStatus = resp.data.stations;
      console.log("Response stationStatus - bikesTotal: ");
      console.log(stationStatus);

      // Get last update time & date
      let lastUpdated = new Date(resp.last_updated * 1000);
      let options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };
      let lastUpdatedTotal = lastUpdated.toLocaleString("es-AR", options);
      updateTime.textContent = lastUpdatedTotal;

      // Get total bikes available
      let bikesAvailableAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_available;
      }, bikesAvailableInitial);
      cardBikesAvailableNumb.textContent = bikesAvailableAcc;

      // Get total bikes disabled
      let bikesDisabledAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_disabled;
      }, bikesDisabledInitial);
      cardBikesDisabledNumb.textContent = bikesDisabledAcc;

      // Get total docks available
      let docksAvailableAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_docks_available;
      }, docksAvailableInitial);
      cardDocksAvailableNumb.textContent = docksAvailableAcc;

      // Get total docks disabled
      let docksDisabledAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_docks_disabled;
      }, docksDisabledInitial);

      console.log(`bikes: ${bikesAvailableAcc} / ${bikesDisabledAcc} docks: ${docksAvailableAcc} / ${docksDisabledAcc}`);

      // Get total fake bikes
      let bikesFakeAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_available_types.ebike;
      }, bikesFakeInitial);
      console.log(`bikes_available_types.ebike: ${bikesFakeAcc}`);
      // Correct totals
      bikesAvailableAcc = bikesAvailableAcc - bikesFakeAcc * 2;
      cardBikesAvailableNumb.textContent = bikesAvailableAcc;
      docksAvailableAcc = docksAvailableAcc - bikesFakeAcc * 1;
      cardDocksAvailableNumb.textContent = docksAvailableAcc;

      // Tweet button
      let text = encodeURIComponent(`🚳 Hay ${bikesDisabledAcc} EcoBici bloqueadas. Probá la app!`);
      let url = "http://ecobici.juandematei.com";
      let hashtags = "EliminenElBotón,EcoBici,QuedateEnCasa";
      let via = "juandematei";
      let related = "elbotonmalo,baecobici";
      twitterButton.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;

      updating.classList.add("updating--hide");
    } else {
      responseHeader.textContent = "Error";
      updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    responseHeader.textContent = "Error";
    updating.classList.add("updating--hide");
  };
  xhr.send();
}

// Get quantities by station (search) ----------------------------------------->
function bikesStation(busqueda) {
  updating.classList.remove("updating--hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationInformation = resp.data.stations;
      console.log("Response stationInformation - bikesStation:");
      console.log(stationInformation);

      // Find station_id ------------------------------------------------------>
      const findStationId = function (stations, number) {
        const resultStationId = stations.find(function (station) {
          return station.name.slice(0, 3) === number;
        });
        return resultStationId;
      };

      let resultStationId = findStationId(stationInformation, busqueda);

      result_id = resultStationId.station_id;
      result_name = resultStationId.name;
      console.log(`station_id: ${result_id} - station_name: ${result_name}`);

      // Get station data ----------------------------------------------------->
      let xhr = new XMLHttpRequest();
      xhr.open("GET", xhrStatus, true);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          let resp = JSON.parse(this.response);
          let stationStatus = resp.data.stations;
          console.log("Response stationStatus - bikesStation:");
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

          console.log(resultStationStatus);
          console.log(`bikes: ${bikesAvailableStation} / ${bikesDisabledStation} docks: ${docksAvailableStation} / ${docksDisabledStation}`);

          responseHeader.textContent = "Estación";
          responseName.textContent = result_name;

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
          let text = encodeURIComponent(`🚳 Hay ${bikesDisabledStation} EcoBici bloqueadas en la estación ${result_name}. Probá la app!`);
          let url = "http://ecobici.juandematei.com";
          let hashtags = "EliminenElBotón,EcoBici,QuedateEnCasa";
          let via = "juandematei";
          let related = "elbotonmalo,baecobici";
          twitterButton.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;

          if (searchFixed === false) {
            searchInput.value = ""; //! Important
            searchValue = ""; //! Important
          }

          //TODO favoriteButton.disabled = false;
          //TODO mapButton.disabled = false;

          updating.classList.add("updating--hide");
        } else {
          responseHeader.textContent = "Error";
          updating.classList.add("updating--hide");
        }
      };
      xhr.onerror = function () {
        responseHeader.textContent = "Error";
        updating.classList.add("updating--hide");
      };
      xhr.send();
    } else {
      responseHeader.textContent = "Error";
      updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    responseHeader.textContent = "Error";
    updating.classList.add("updating--hide");
  };
  xhr.send();
}

// Get valid station numbers & location --------------------------------------->
function getStationsValid() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationInformation = resp.data.stations;

      for (let i = 0; i < stationInformation.length; i++) {
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
      console.log("stationsValid");
      console.log(stationsValid);

      console.log("stationsLocation");
      console.log(stationsLocation);

      checkGeolocation();
    } else {
      responseHeader.textContent = "Error";
      updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    responseHeader.textContent = "Error";
    updating.classList.add("updating--hide");
  };
  xhr.send();
}

// Get all different status in "stationStatus" and count them ----------------->
function getUniqueStatus() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrStatus, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationStatus = resp.data.stations;

      let uniqueStatus = [...new Set(stationStatus.map((item) => item.status))];
      console.log(`Unique status: ${uniqueStatus}`);

      uniqueStatus.forEach((element) => {
        let count = stationStatus.filter((obj) => obj.status === element).length;
        console.log(`Total ${element}: ${count}`);
      });
    } else {
      responseHeader.textContent = "Error";
      updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    responseHeader.textContent = "Error";
    updating.classList.add("updating--hide");
  };
  xhr.send();
}

// Change refresh-button color when searh is fixed ---------------------------->
function fixedButtonClick() {
  searchFixed = !searchFixed;
  if (searchFixed === true) {
    refreshButton.classList.add("btn--fixed");
    fixedButton.classList.add("btn--fixed");
    fixedButtonIcon.setAttribute("name", "lock");
  } else {
    refreshButton.classList.remove("btn--fixed");
    fixedButton.classList.remove("btn--fixed");
    fixedButtonIcon.setAttribute("name", "unlock");
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
  searchValue = searchInput.value; //! Important

  if (searchValue === "") {
    //! Important
    searchBox.classList.add("error");
    searchInput.placeholder = "Ingresá una estación";
    setTimeout(function () {
      searchBox.classList.remove("error");
      searchInput.placeholder = "Buscar una estación";
    }, 4000);
  } else {
    searchValue = pad(searchInput.value); //! Important
    if (stationsValid.includes(searchValue)) {
      //! Important
      bikesStation(searchValue); //! Important
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
    locationButton.classList.remove("btn--disabled");
    locationButton.classList.add("watching");
  }
  // Geolocation not available
  else {
    locationButton.classList.add("btn--disabled");
    locationButton.classList.remove("watching");
  }
}

// Callback function for asynchronous call to HTML5 geolocation
function UserLocation(position) {
  nearestStation(position.coords.latitude, position.coords.longitude);
  console.log(`User location: ${position.coords.latitude} ${position.coords.longitude}`);
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
  let R = 6371; // km
  let x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  let y = lat2 - lat1;
  let d = Math.sqrt(x * x + y * y) * R;
  return d;
}

function nearestStation(latitude, longitude) {
  let minDif = 99999;
  let closest;

  for (index = 0; index < stationsLocation.length; ++index) {
    let dif = PythagorasEquirectangular(latitude, longitude, stationsLocation[index][1], stationsLocation[index][2]);
    if (dif < minDif) {
      closest = index;
      minDif = dif;
    }
  }

  searchLocation = stationsLocation[closest][0];
  console.log(`Closest station: ${searchLocation}`);

  let origin = latitude + "," + longitude;
  let destination = stationsLocation[closest][1] + "," + stationsLocation[closest][2];
  let mapLink = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  console.log(mapLink);
  let mapImg = `https://maps.googleapis.com/maps/api/staticmap?center=${destination}&zoom=15&size=300x300&scale=2&markers=color:0xe66300%7C${destination}&key=${maps_api_key}`;
  mapImage.src = mapImg;

  mapButton.href = mapLink;
}

//* Event listeners ----------------------------------------------------------->
searchButton.addEventListener("click", function (event) {
  event.preventDefault();
  searchButtonClick();
});
searchInput.addEventListener("keyup", function (event) {
  searchInputEnter();
});
fixedButton.addEventListener("click", function (event) {
  event.preventDefault();
  fixedButtonClick();
});
locationButton.addEventListener("click", function (event) {
  refreshButton.classList.remove("btn--fixed");
  fixedButton.classList.remove("btn--fixed");
  fixedButtonIcon.setAttribute("name", "unlock");
  searchFixed = false;
  bikesStation(searchLocation);
  mapButton.classList.remove("btn--disabled");
});
refreshButton.addEventListener("click", function (event) {
  event.preventDefault();
  refreshButtonClick();
});
menuToggler.addEventListener("click", function (event) {
  event.preventDefault();

  menuOpen = !menuOpen;
  if (menuOpen === true) {
    menuTogglerIcon.classList.add("menu--open");
    menuSidebar.classList.add("menu--show");
  } else {
    menuTogglerIcon.classList.remove("menu--open");
    menuSidebar.classList.remove("menu--show");
  }
});
