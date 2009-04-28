var infoTemplate = new Template('<b><a href="#{urlList[0]}">#{fn}</a></b><br/>');
var addressTemplate = new Template('#{streetAddress}<br/>#{locality}, #{region} #{postalCode} #{country}');

var Map = {
  showPoint: function(hcard) {
    var point = new GLatLng(hcard.geo.latitude, hcard.geo.longitude);
    var marker = new GMarker(point, {icon:colored_pin((hcard.categoryList ? hcard.categoryList[0] : 'red'))});
    marker.html = infoTemplate.evaluate(hcard) + addressTemplate.evaluate(hcard.adrList[0]);
    Map.map.addOverlay(marker);
    Map.bounds.extend(point);    
  },
  
  display: function() {
    if (GBrowserIsCompatible()) {
      Map.map = new GMap2(document.getElementById("map"));        

      var hcards = HCard.discover().select(function(card) { return card.geo });
      if (hcards.length == 0) return

      var center = new GLatLng(hcards[0].geo.latitude, hcards[0].geo.longitude);
      Map.map.setCenter(center, 3);
      Map.map.enableScrollWheelZoom();
      Map.map.addControl(new GLargeMapControl());
      Map.map.addControl(new GMapTypeControl());
      Map.map.addControl(new GScaleControl());
      Map.map.addControl(new GOverviewMapControl());

      Map.bounds = new GLatLngBounds;
      hcards.each(Map.showPoint);

      // listen for clicks
      GEvent.addListener(Map.map, 'click', function(overlay, point) {
        if (overlay) {
          // we now need a check here in case the overlay is the info window
          // only our markers will have a .html property
          if (overlay.html) {
            overlay.openInfoWindowHtml(overlay.html);
          }
        } else if (point) {
          //whatever you want to happen if you don't click on an overlay.
        }
      });


      // Fit all points in view
      Map.map.setZoom(Map.map.getBoundsZoomLevel(Map.bounds));
      Map.map.setCenter(Map.bounds.getCenter());

      Event.observe(window, "unload", GUnload);
    }
  }
}

icons = {}

function colored_pin(color) {
  if (!icons[color]) {
    var icon = new GIcon();
    icon.image = "http://labs.google.com/ridefinder/images/mm_20_"+(color || 'red')+".png";
    icon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
    icon.iconSize = new GSize(12, 20);
    icon.shadowSize = new GSize(22, 20);
    icon.iconAnchor = new GPoint(6, 20);
    icon.infoWindowAnchor = new GPoint(5, 1);
    icons[color] = icon;
  }
  return icons[color];
}

// Dunno why IE doesn't like dom:loaded.
if (Prototype.Browser.IE) {
  Event.observe(window, "load", Map.display);
} else {
  Event.observe(window, "dom:loaded", Map.display);
}
