var Map = {
  points: 0,
  
  infoWindowContent: function(hcard) {
    var address = hcard.adrList[0]
    return ('<b>'
      +(hcard.urlList ? '<a href="'+hcard.urlList[0]+'">'+hcard.fn+'</a>' : hcard.fn)
      +'</b><br/>'
      +address.streetAddress
      +'<br/>'
      +address.locality+', '+address.region+' '+address.postalCode+' '+address.country)
    .gsub('undefined', '');
  },
  
  plotPoint: function(hcard, point) {
    Map.points++;

    if (Map.points == 1) {
      Map.center = point;
      Map.bounds = new google.maps.LatLngBounds(Map.center);
      Map.map = new google.maps.Map(document.getElementById(Map.domId), Map.options);
    } else {
      Map.bounds.extend(point);
    }

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
  },
  
  showPoint: function(hcard) {
    if (!hcard.geo || !hcard.geo.latitude || !hcard.geo.longitude) {
      var address = hcard.adrList[0].streetAddress+', '+hcard.adrList[0].locality+', '+hcard.adrList[0].region+' '+hcard.adrList[0].postalCode;
      Map.geocoder().geocode( { address: address, country: hcard.adrList[0].country}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK && results.length) {
          // You should always check that a result was returned, as it is
          // possible to return an empty results object.
          if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
            Map.plotPoint(hcard, results[0].geometry.location);
            Map.fitPoints(); // Have to re-fit, as it may be already called.
          }
        } else {
          alert("Geocode was unsuccessful due to: " + status);
        }
      });
    } else {
      point = new google.maps.LatLng(hcard.geo.latitude, hcard.geo.longitude);
      Map.plotPoint(hcard, point);
    }
  },
  
  hcards: function() {
    if (!Map._hcards) {
      Map._hcards = HCard.discover(eval(Map.hcardSelector));
    }
    return Map._hcards;
  },
  
  domId: 'map',
    
  options: {
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  },
  
  maxZoom: 13,
  
  display: function() {
    if (Map.hcards().length == 0) return

    // Map.map.enableScrollWheelZoom();
    // Map.map.addControl(new GOverviewMapControl());

    Map.hcards().forEach(Map.showPoint); // forEach is defined in microformat.js

    // Fit all points in view
    Map.fitPoints();
  },
  
  fitPoints: function() {
    Map.map.fitBounds(Map.bounds); 
  },
  
  geocoder: function() {
    if (!Map._geocoder) {
      Map._geocoder = new google.maps.Geocoder();
    }
    return Map._geocoder;
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
