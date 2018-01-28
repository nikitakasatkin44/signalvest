function initializeMap() {
    var myCenter = new google.maps.LatLng(57.77579307282587, 40.91325760137693);
    var mapProp = {
        center: myCenter,
        zoom: 13,
        scrollwheel: false,
        draggable: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    var marker = new google.maps.Marker({position: myCenter});
    marker.setMap(map);
}