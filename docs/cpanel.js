//! Use 'urlPrefix' as first part of any API request url to avoid CORS blocking.
const urlPrefix = "https://cors-anywhere.herokuapp.com/";

//! Use 'urlStatus' for stations dynamic data and 'urlInformation' for stations static data.
const urlStatus = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus";
const urlInformation = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationInformation";

//! 'client_id' and 'client_secret' MUST be requested at https://www.buenosaires.gob.ar/form/formulario-de-registro-api-transporte.
const client_id = config.ID;
const client_secret = config.SECRET;

//! Global variables ---------------------------------------------------------->
//  Initial counters
var totalAvailable = 0;
var totalDisabled = 0;
var totalDocks = 0;

//* Show bikes totals when page loads ----------------------------------------->
$(document).ready(function() {
  bikesTotal();
  stationStatus();
});

//! TOTAL --------------------------------------------------------------------->
function bikesTotal() {
  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + urlStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },
    success: function(data) {
      var responseBikesTotal = data.data.stations;
      console.log(responseBikesTotal);

      var lastUpdated = new Date(data.last_updated * 1000);
      var lastDateTime = lastUpdated.toLocaleTimeString("es-AR");

      $(".last-update > p").html("Última actualización total " + lastDateTime);

      for (var i = 0; i < responseBikesTotal.length; i++) {
        totalAvailable = totalAvailable + responseBikesTotal[i].num_bikes_available;
        totalDisabled = totalDisabled + responseBikesTotal[i].num_bikes_disabled;
        totalDocks = totalDocks + responseBikesTotal[i].num_docks_available;
      }

      $("#available > p").html("<strong>" + totalAvailable + "</strong><br>disponibles");
      $("#disabled > p").html("<strong>" + totalDisabled + "</strong><br>bloqueadas");
      $("#docks > p").html("<strong>" + totalDocks + "</strong><br>espacios libres");
    },
    error: function() {
      $("h2").html("ERROR");
    }
  });
}

//! Request stations by status ------------------------------------------------>
function stationStatus() {
  var totalPlanned = 0;
  var totalInService = 0;
  var totalEndOfLife = 0;
  var totalMaintenance = 0;

  $.ajax({
    type: "GET",
    dataType: "json",
    url: urlPrefix + urlStatus,
    data: {
      client_id: client_id,
      client_secret: client_secret
    },

    success: function(data) {
      var responseStationPlanned = data.data.stations;

      for (var i = 0; i < responseStationPlanned.length; i++) {
        if (responseStationPlanned[i].status === "PLANNED") {
          totalPlanned = totalPlanned + 1;
        }
        if (responseStationPlanned[i].status === "IN_SERVICE") {
          totalInService = totalInService + 1;
        }
        if (responseStationPlanned[i].status === "END_OF_LIFE") {
          totalEndOfLife = totalEndOfLife + 1;
        }
        if (responseStationPlanned[i].status === "MAINTENANCE") {
          totalMaintenance = totalMaintenance + 1;
        }
      }

      var responseCards;
      responseCards = document.getElementById("response-cards");

      var cardInService;
      cardInService = document.createElement("div");
      cardInService.classList.add("card");
      cardInService.innerHTML = "<p><strong>" + totalInService + "</strong><br>En servicio</p>";
      responseCards.appendChild(cardInService);

      var cardMaintenance;
      cardMaintenance = document.createElement("div");
      cardMaintenance.classList.add("card");
      cardMaintenance.innerHTML = "<p><strong>" + totalMaintenance + "</strong><br>En mantenimiento</p>";
      responseCards.appendChild(cardMaintenance);

      var cardPlanned;
      cardPlanned = document.createElement("div");
      cardPlanned.classList.add("card");
      cardPlanned.innerHTML = "<p><strong>" + totalPlanned + "</strong><br>Planeadas</p>";
      responseCards.appendChild(cardPlanned);

      var cardEndOfLife;
      cardEndOfLife = document.createElement("div");
      cardEndOfLife.classList.add("card");
      cardEndOfLife.innerHTML = "<p><strong>" + totalEndOfLife + "</strong><br>Fin ciclo</p>";
      responseCards.appendChild(cardEndOfLife);
    },
    error: function() {
      $(".updating").hide();
    }
  });
}
