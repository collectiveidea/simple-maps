var Map = {
  infoWindowContent: function(hcard) {
    var address = hcard.adrList[0]
    return '<b>'
      +(hcard.urlList ? '<a href="'+hcard.urlList[0]+'">'+hcard.fn+'</a>' : hcard.fn)
      +'</b><br/>'
      +address.streetAddress
      +'<br/>'
      +address.locality+', '+address.region+' '+address.postalCode+' '+address.country
  },
  
  showPoint: function(hcard) {
    var point = new google.maps.LatLng(hcard.geo.latitude, hcard.geo.longitude);
    var marker = new google.maps.Marker({
        position: point, 
        map: Map.map, 
        title: hcard.fn,
        icon: Map.coloredPin((hcard.categoryList ? hcard.categoryList[0] : 'red')),
        shadow: Map.shadow(),
        shape: { coord: [1, 1, 1, 20, 18, 20, 18 , 1], type: 'poly'}
    });
    
    var infoWindow = new google.maps.InfoWindow({
      content: Map.infoWindowContent(hcard),
      size: new google.maps.Size(250,50)
    });
    
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.open(Map.map, marker);
    });
    
    Map.bounds.extend(point);    
  },
  
  hcards: function() {
    if (!Map._hcards) {
      Map._hcards = HCard.discover().select(function(card) { return card.geo })
    }
    return Map._hcards;
  },
  
  domId: 'map',
  
  options: {
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  },
  
  display: function() {
    if (Map.hcards().length == 0) return

    Map.map = new google.maps.Map(document.getElementById(Map.domId), Map.options);

    // Map.map.enableScrollWheelZoom();
    // Map.map.addControl(new GOverviewMapControl());

    var center = new google.maps.LatLng(Map.hcards()[0].geo.latitude, Map.hcards()[0].geo.longitude);
    Map.bounds = new google.maps.LatLngBounds(center);
    
    Map.hcards().forEach(Map.showPoint); // forEach is defined in microformat.js

    // Fit all points in view
    Map.map.fitBounds(Map.bounds);
  },
  
  icons: {},
  
  coloredPin: function(color) {
    if (!Map.icons[color]) {
      Map.icons[color] = new google.maps.MarkerImage("http://labs.google.com/ridefinder/images/mm_20_"+(color || 'red')+".png",
        new google.maps.Size(12, 20),
        new google.maps.Point(0,0),
        new google.maps.Point(6,20));
    }
    return Map.icons[color];
  },
  
  shadow: function() {
    return new google.maps.MarkerImage("http://labs.google.com/ridefinder/images/mm_20_shadow.png",
      new google.maps.Size(22, 20),
      new google.maps.Point(5,1),
      new google.maps.Point(0,20));          
  }
}

// Dunno why IE doesn't like dom:loaded.
if (Prototype.Browser.IE) {
  Event.observe(window, "load", Map.display);
} else {
  Event.observe(window, "dom:loaded", Map.display);
}
