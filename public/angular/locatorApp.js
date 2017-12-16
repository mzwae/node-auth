angular.module('locatorApp', []);


var locationListCtrl = function ($scope, locatorData, geolocation) {

$scope.getData = function(position){
var lat = position.coords.latitude,
    lng = position.coords.longitude;
$scope.message = "Searching for nearby places";
$scope.working = true;
 locatorData.locationByCoords(lat, lng)
  .success(function(data){
   $scope.working = false;
   $scope.message = data.length > 0 ? "" : "No locations found";
   $scope.data = {locations: data};
 })
  .error(function(e){
   $scope.working = false;
   $scope.message = "Sorry, something's gone wrong";
   console.log(e);
 });
};
  
  
$scope.showError = function(error){
  $scope.$apply(function(){
    $scope.message = error.message;
  });
};
  
$scope.noGeo = function(){
  $scope.$apply(function(){
    $scope.message = "Geolocation not supported by this browser.";
  });
};
  
geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo);
};

/*var _isNumeric = function (n) {
  console.log(">>>>>>>>>>>>>>>>>>>>n is: ", n);
  var result = !_isNaN(parseFloat(n) && isFinite(n));
  console.log(">>>>>>>>>>>>>!_isNaN(parseFloat(n) && isFinite(n)) is: ", result);
  return !_isNaN(parseFloat(n) && isFinite(n));
};*/

/*Angular filter for the distance for displaying the distance in km if it's larger than a kilometer and in m if it's smaller than a kilometer */
var formatDistance = function () {
  return function (distance) {
    var numDistance, unit;
    if (!isNaN(distance)) {
      if (parseFloat(distance) >= 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
      } else {
        numDistance = parseInt(distance * 1000, 10);
        unit = 'm';
      }
      return numDistance + unit;
    } else {
      return "?";
    }
  };

};

/*A directive for displaying the rating stars*/
var ratingStars = function () {
  return {
    scope: {
      thisRating: '=rating'
    },
    templateUrl: '/angular/rating-stars.html'
  };
};

/*Data service for pulling data from the API*/
var locatorData = function ($http) {
  var locationByCoords = function (lat, lng) {
    return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxdist=20');
  };
  
  return {
    locationByCoords: locationByCoords
  };
};

/*geolocation service to get the current user position*/
var geolocation = function(){
  var getPosition = function(cbSuccess, cbError, cbNoGeo){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
      
    } else {
      cbNoGeo();
    }
  };
  return {
    getPosition: getPosition
  };
};

angular
  .module('locatorApp')
  .controller('locationListCtrl', locationListCtrl)
  .filter('formatDistance', formatDistance)
  .directive('ratingStars', ratingStars)
  .service('locatorData', locatorData)
  .service('geolocation', geolocation);