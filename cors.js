var createCORSRequest = function(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Most browsers.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // IE8 & IE9
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
};

var url = "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus?client_id=c9f17951eca1433a8744072cd6ed90c9&client_secret=d16cdAd7C5a44875825649808f94ca6B";
var method = "GET";
var xhr = createCORSRequest(method, url);

xhr.onload = function() {
  // Success code goes here.
  var response = data.data.stations;
  console.log(response);
};

xhr.onerror = function() {
  // Error code goes here.
};

xhr.send();
