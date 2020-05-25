//* API -----------------------------------------------------------------------> 
//  Tokens -------------------------------------------------------------------->
const client_id = config.ID;
const client_secret = config.SECRET;
const maps_api_key = config.MAPS_API_KEY;
//  URL ----------------------------------------------------------------------->
const urlCors = new URL("https://cors-anywhere.herokuapp.com/");
const urlBase = new URL("https://apitransporte.buenosaires.gob.ar");
//  stationStatus ------------------------------------------------------------->
const urlStatus = new URL("/ecobici/gbfs/stationStatus", urlBase);
urlStatus.searchParams.set("client_id", client_id);
urlStatus.searchParams.set("client_secret", client_secret);
const xhrStatus = urlCors + urlStatus;
//  stationInformation -------------------------------------------------------->
const urlInformation = new URL("/ecobici/gbfs/stationInformation", urlBase);
urlInformation.searchParams.set("client_id", client_id);
urlInformation.searchParams.set("client_secret", client_secret);
const xhrInformation = urlCors + urlInformation;

//* Initial variables --------------------------------------------------------->
//  Counters ------------------------------------------------------------------>
let bikesAvailableInitial = 0;
let bikesDisabledInitial = 0;
let docksAvailableInitial = 0;
let bikesFakeInitial = 0;
//  Search -------------------------------------------------------------------->
let stationsValid = [];
let stationsLocation = [];
let searchValue = "";
let searchFixed = false;
//  Chart --------------------------------------------------------------------->
let chartAvailable = "";
let chartDisabled = "";
// Date & Time ---------------------------------------------------------------->
let options = {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

//* Selectors ----------------------------------------------------------------->
//  Navigation ---------------------------------------------------------------->
const navBottom = document.querySelector("#navBottom");
const navHomeBtn = document.querySelector("#navHomeBtn");
const navSearchBtn = document.querySelector("#navSearchBtn");
const navStatusBtn = document.querySelector("#navStatusBtn");
//  Search -------------------------------------------------------------------->
const searchSection = document.querySelector("#searchSection");
//  Updating ------------------------------------------------------------------>
const updating = document.querySelector("#updating");
//  Response ------------------------------------------------------------------>
const updateTime = document.querySelector("#updateTime");
//  Cards --------------------------------------------------------------------->
const cardTotals = document.querySelector("#cardTotals");
const cardNearest = document.querySelector("#cardNearest");
//  Total stations ------------------------------------------------------------>
const cardBikesAvailableNumb = document.querySelector("#cardBikesAvailableNumb");
const cardBikesDisabledNumb = document.querySelector("#cardBikesDisabledNumb");
//  Nearest station ----------------------------------------------------------->
const cardNearestStationName = document.querySelector("#cardNearestStationName");
const cardNearestStationBikesAvailable = document.querySelector("#cardNearestStationBikesAvailable");
const cardNearestStationBikesDisabled = document.querySelector("#cardNearestStationBikesDisabled");
const cardNearestStationDocksAvailable = document.querySelector("#cardNearestStationDocksAvailable");
const cardNearestStationMap = document.querySelector("#cardNearestStationMap");
const cardNearestStationMapLink = document.querySelector("#cardNearestStationMapLink");

//* Twitter button ------------------------------------------------------------>
const cardBikesTwitterButton = document.querySelector("#cardBikesTwitterButton");
const cardNearestStationTwitterButton = document.querySelector("#cardNearestStationTwitterButton");
const url = "http://ecobici.juandematei.com";
const hashtags = "EliminenElBotón,EcoBici,QuedateEnCasa";
const via = "juandematei";
const related = "elbotonmalo,baecobici";

//! Main functions ------------------------------------------------------------>
// Get accumulated quantities ------------------------------------------------->
function bikesTotal() {
  updating.classList.remove("updating--hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrStatus, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      //* Success!
      let resp = JSON.parse(this.response);
      let stationStatus = resp.data.stations;

      // Get total bikes available
      let bikesAvailableAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_available;
      }, bikesAvailableInitial);

      // Get total bikes disabled
      let bikesDisabledAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_disabled;
      }, bikesDisabledInitial);

      // Get total bikes fake
      let bikesFakeAcc = stationStatus.reduce(function (acc, currentValue) {
        return acc + currentValue.num_bikes_available_types.ebike;
      }, bikesFakeInitial);

      // Correct totals
      bikesAvailableAcc = bikesAvailableAcc - bikesFakeAcc * 2;

      // Data
      cardBikesAvailableNumb.textContent = bikesAvailableAcc;
      cardBikesDisabledNumb.textContent = bikesDisabledAcc;

      // Chart
      chartTotal = bikesAvailableAcc + bikesDisabledAcc;
      chartAvailable = bikesAvailableAcc / chartTotal;
      chartDisabled = bikesDisabledAcc / chartTotal;
      chart();

      // Tweet button
      let text = encodeURIComponent(`Hay 🚲 ${bikesAvailableAcc} bicis disponibles y 🚳 ${bikesDisabledAcc} bicis bloqueadas.\r\n\r\nProbá la app en el link ⤵️\r\n`);
      cardBikesTwitterButton.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;

      // Response date & time
      let responseDate = new Date(resp.last_updated * 1000);
      updateTime.textContent = responseDate.toLocaleString("es-AR", options);

      updating.classList.add("updating--hide");
      cardTotals.classList.remove("card--hidden");

      // !Debug
      // console.log("Response stationStatus - bikesTotal: ");
      // console.log(stationStatus);
      // console.log(`bikes: ${bikesAvailableAcc} / ${bikesDisabledAcc}`);
      // console.log(`fake bikes: ${bikesFakeAcc}`);

    } else {
      updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    updating.classList.add("updating--hide");
  };
  xhr.send();
}

// Get quantities by station (search) ----------------------------------------->
function bikesStation(busqueda) {
  //updating.classList.remove("updating--hide");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationInformation = resp.data.stations;
      //console.log("Response stationInformation - bikesStation:");
      //console.log(stationInformation);

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
      //console.log(`station_id: ${result_id} - station_name: ${result_name}`);

      // Get station data ----------------------------------------------------->
      let xhr = new XMLHttpRequest();
      xhr.open("GET", xhrStatus, true);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          let resp = JSON.parse(this.response);
          let stationStatus = resp.data.stations;
          //console.log("Response stationStatus - bikesStation:");
          //console.log(stationStatus);

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

          //console.log(resultStationStatus);
          //console.log(`bikes: ${bikesAvailableStation} / ${bikesDisabledStation} docks: ${docksAvailableStation} / ${docksDisabledStation}`);

          cardNearestStationName.textContent = result_name;
          cardNearestStationBikesAvailable.textContent = bikesAvailableStation;
          cardNearestStationBikesDisabled.textContent = bikesDisabledStation;
          cardNearestStationDocksAvailable.textContent = docksAvailableStation;


          // cardBikesAvailableNumb.textContent = bikesAvailableStation;
          // if (bikesAvailableStation === 1) {
          //   cardBikesAvailableText.textContent = "bici disponible";
          // } else {
          //   cardBikesAvailableText.textContent = "bicis disponibles";
          // }

          // cardBikesDisabledNumb.textContent = bikesDisabledStation;
          // if (bikesDisabledStation === 1) {
          //   cardBikesDisabledText.textContent = "bici bloqueada";
          // } else {
          //   cardBikesDisabledText.textContent = "bicis bloqueadas";
          // }

          // cardDocksAvailableNumb.textContent = docksAvailableStation;
          // if (docksAvailableStation === 1) {
          //   cardDocksAvailableText.textContent = "espacio libre";
          // } else {
          //   cardDocksAvailableText.textContent = "espacios libres";
          // }

          // Tweet button
          let text = encodeURIComponent(`Hay 🚲 ${bikesAvailableStation} bicis disponibles y 🚳 ${bikesDisabledStation} bicis bloqueadas en la estación ${result_name}.\r\n\r\nProbá la app en el link ⤵️\r\n`);
          cardNearestStationTwitterButton.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;

          // if (searchFixed === false) {
          //   searchInput.value = ""; //! Important
          //   searchValue = ""; //! Important
          // }

          //updating.classList.add("updating--hide");
          cardNearest.classList.remove("card--hidden");

        } else {
          //updating.classList.add("updating--hide");
        }
      };
      xhr.onerror = function () {
        //updating.classList.add("updating--hide");
      };
      xhr.send();
    } else {
      //updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    //updating.classList.add("updating--hide");
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
        // Get each station number from station name
        stationNumber = stationInformation[i].name.slice(0, 3);
        stationsValid.push(stationNumber);
        // Get each station location (lat & lon)
        stationsLocation.id = stationInformation[i].name.slice(0, 3);
        stationsLocation.lat = stationInformation[i].lat;
        stationsLocation.lon = stationInformation[i].lon;
        stationsLocation.push([stationsLocation.id, stationsLocation.lat, stationsLocation.lon]);
      }
      //console.log("stationsValid");
      //console.log(stationsValid);

      //console.log("stationsLocation");
      //console.log(stationsLocation);

      checkGeolocation();
    } else {
      //updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    //updating.classList.add("updating--hide");
  };
  xhr.send();
}

//? Get all different status in "stationStatus" and count them ----------------->
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
      //updating.classList.add("updating--hide");
    }
  };
  xhr.onerror = function () {
    //updating.classList.add("updating--hide");
  };
  xhr.send();
}

//! Helper functions ---------------------------------------------------------->
// Draw chart ----------------------------------------------------------------->
function chart() {
  var ctx = document.getElementById("chart__canvas");
  new Chart(ctx, {
    type: "horizontalBar",
    data: {
      labels: ["Bicis"],
      barThickness: 24,
      datasets: [
        {
          label: "Disponibles",
          data: [chartAvailable],
          backgroundColor: "#43A047",
        },
        {
          label: "Bloqueadas",
          data: [chartDisabled],
          backgroundColor: "#E53935",
        }
      ],
    },
    options: {
      legend: false,
      tooltips: {
        enabled: false
      },
      scales: {
        yAxes: [{
          stacked: true,
          display: false
        }],
        xAxes: [{
          stacked: true,
          display: false
        }]
      }
    },
  });
};

// Hide bottom navigation ----------------------------------------------------->
function hideNavBar() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    navBottom.classList.add("nav--hidden");
  } else {
    navBottom.classList.remove("nav--hidden");
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
  }
  // Geolocation not available
  else {
    console.log("No hay ubicacion");
  }
}

// Callback function for asynchronous call to HTML5 geolocation
function UserLocation(position) {
  nearestStation(position.coords.latitude, position.coords.longitude);
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

  let origin = latitude + "," + longitude;
  let destination = stationsLocation[closest][1] + "," + stationsLocation[closest][2];
  let mapLink = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  let mapImg = `https://maps.googleapis.com/maps/api/staticmap?center=${destination}&zoom=15&size=300x150&scale=2&markers=color:0xe66300%7C${destination}&key=${maps_api_key}`;
  cardNearestStationMap.src = mapImg;
  cardNearestStationMapLink.href = mapLink;
  bikesStation(searchLocation);
}

//* Event listeners ----------------------------------------------------------->
navSearchBtn.addEventListener("click", function (event) {
  searchSection.classList.remove("search--hidden");
});
searchSection.addEventListener("click", function (event) {
  searchSection.classList.add("search--hidden");
});


//! Call functions on page load ----------------------------------------------->
(function () {
  getStationsValid();
  bikesTotal();
})();
