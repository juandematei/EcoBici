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

// Search initial values ------------------------------------------------------>
let stationsActive = [];

// DOM - Updating ------------------------------------------------------------->
const updating = document.querySelector(".updating");

// DOM - Response ------------------------------------------------------------->
const cardNumb = document.querySelector(".card--status.card--available > .card__numb");
const cardText = document.querySelector(".card--status.card--available > .card__text");
const updateTime = document.querySelector(".update-time");
const stationList = document.querySelector(".response-table");

//! Main ---------------------------------------------------------------------->
(function () {
  getStationsList();
})();

// Get valid station numbers & location --------------------------------------->
function getStationsList() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", xhrInformation, true);
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      let resp = JSON.parse(this.response);
      let stationInformation = resp.data.stations;

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

      for (let i = 0; i < stationInformation.length; i++) {
        stationsActive.id = stationInformation[i].name.slice(0, 3);
        stationsActive.name = stationInformation[i].name;
        stationsActive.lat = stationInformation[i].lat;
        stationsActive.lon = stationInformation[i].lon;
        stationsActive.push([stationsActive.id, stationsActive.name, stationsActive.lat, stationsActive.lon]);
        var row = stationList.insertRow(i + 1);
        var cell1 = row.insertCell(0);
        cell1.innerHTML = stationsActive.id;
        var cell2 = row.insertCell(1);
        cell2.innerHTML = stationsActive.name;
        var cell3 = row.insertCell(2);
        cell3.innerHTML = stationsActive.lat;
        var cell4 = row.insertCell(3);
        cell4.innerHTML = stationsActive.lon;
      }
      console.log("stationsActive");
      console.log(stationsActive);
      cardNumb.textContent = stationsActive.length;
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

// Export CSV
// Quick and simple export target #table_id into a csv
function download_table_as_csv(table_id) {
  // Select rows from table_id
  var rows = document.querySelectorAll("table#" + table_id + " tr");
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll("td, th");
    for (var j = 0; j < cols.length; j++) {
      // Clean innertext to remove multiple spaces and jumpline (break csv)
      var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, "").replace(/(\s\s)/gm, " ");
      // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
      data = data.replace(/"/g, '""');
      // Push escaped string
      row.push('"' + data + '"');
    }
    csv.push(row.join(";"));
  }
  var csv_string = csv.join("\n");
  // Download it
  var filename = "export_" + table_id + "_" + new Date().toLocaleDateString() + ".csv";
  var link = document.createElement("a");
  link.style.display = "none";
  link.setAttribute("target", "_blank");
  link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string));
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
