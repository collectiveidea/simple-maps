var infoTemplate = new Template('<b><a href="#{urlList[0]}">#{fn}</a></b><br/>');
var addressTemplate = new Template('#{streetAddress}<br/>#{locality}, #{region} #{postalCode} #{country}');

var Map = {
  showPoint: function(hcard) {
    var point = new google.maps.LatLng(hcard.geo.latitude, hcard.geo.longitude);
    var marker = new google.maps.Marker({
          position: point, 
          map: Map.map, 
          title: hcard.fn,
          icon: colored_pin((hcard.categoryList ? hcard.categoryList[0] : 'red')),
          shadow: shadow(),
          shape: {
                coord: [1, 1, 1, 20, 18, 20, 18 , 1],
                type: 'poly'
            }
      });
    
    var infowindow = new google.maps.InfoWindow({
      content: infoTemplate.evaluate(hcard) + addressTemplate.evaluate(hcard.adrList[0]),
      size: new google.maps.Size(250,50)
    });
    
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(Map.map, marker);
    });
    
    Map.bounds.extend(point);    
  },
  
  display: function() {
    var hcards = HCard.discover().select(function(card) { return card.geo });
    if (hcards.length == 0) return

    var center = new google.maps.LatLng(hcards[0].geo.latitude, hcards[0].geo.longitude);

    var mapOptions = {
      zoom: 8,
      center: center,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    Map.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Map.map.enableScrollWheelZoom();
    // Map.map.addControl(new GOverviewMapControl());

    Map.bounds = new google.maps.LatLngBounds(center);
    hcards.each(Map.showPoint);

    // Fit all points in view
    Map.map.fitBounds(Map.bounds);
  }
}

icons = {}

function colored_pin(color) {
  if (!icons[color]) {
    icons[color] = new google.maps.MarkerImage("http://labs.google.com/ridefinder/images/mm_20_"+(color || 'red')+".png",
      new google.maps.Size(12, 20),
      new google.maps.Point(0,0),
      new google.maps.Point(6,20));
  }
  return icons[color];
}

function shadow() {
    return new google.maps.MarkerImage("http://labs.google.com/ridefinder/images/mm_20_shadow.png",
      new google.maps.Size(22, 20),
      new google.maps.Point(6,20),
      new google.maps.Point(5,1));      
  
}

// Dunno why IE doesn't like dom:loaded.
if (Prototype.Browser.IE) {
  Event.observe(window, "load", Map.display);
} else {
  Event.observe(window, "dom:loaded", Map.display);
}
