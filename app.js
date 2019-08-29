$(document).ready(function() {
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: "https://apitransporte.buenosaires.gob.ar/ecobici/gbfs/stationStatus?client_id=c9f17951eca1433a8744072cd6ed90c9&client_secret=d16cdAd7C5a44875825649808f94ca6B",
    success: function(data) {
      console.log(data);
    }
  });
});
