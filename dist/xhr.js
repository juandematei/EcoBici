// TODO Ocultar --------------------------------------------------------------->
const client_id = "c9f17951eca1433a8744072cd6ed90c9";
const client_secret = "d16cdAd7C5a44875825649808f94ca6B";

const urlCors = new URL("https://cors-anywhere.herokuapp.com/");
const urlBase = new URL("https://apitransporte.buenosaires.gob.ar");

const urlStatus = new URL("/ecobici/gbfs/stationStatus", urlBase);
urlStatus.searchParams.set("client_id", client_id);
urlStatus.searchParams.set("client_secret", client_secret);
const xhrStatus = urlCors + urlStatus;

const urlInformation = new URL("/ecobici/gbfs/stationInformation", urlBase);
urlInformation.searchParams.set("client_id", client_id);
urlInformation.searchParams.set("client_secret", client_secret);
const xhrInformation = urlCors + urlInformation;

let xhr = new XMLHttpRequest();
xhr.open("GET", xhrInformation, true);
xhr.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var resp = JSON.parse(this.response);
    console.log(resp.data.stations);
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
