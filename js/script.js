//list of cities
var cityIds = [
  4180439,
  5128638,
  4560349,
  4726206,
  4671654,
  5809844,
  5368361,
  5391811,
  5308655,
  4684888,
  4887398,
  5391959,
  5392171,
  4164138,
  4273837,
  5746545,
  4699066,
  5419384,
  4990729
];

var cityIdList = cityIds.join(',');

//app module
var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MapController',
      templateUrl: 'main.html'
    })
    .when('/city/:cityId', {
      controller: 'ForecastController',
      templateUrl: 'forecast.html'
    });
});

//app - weather factory
app.factory('weather', function($http) {
  var APPID = '16b35f21e8495fad2af63abb2d969031';
  return {
    getByCityIds: function(cityIdList, callback) {
      $http({
        url:'http://api.openweathermap.org/data/2.5/group',
        params: {
          APPID: APPID,
          id: cityIdList,
          units: 'imperial'
        }
      }).success(callback);
    }
  };
}); //end - weather factory

//app - google maps factory
app.factory('googleMaps', function() {
  return {
    //initialize new google map
    newMap: function(lat, lng, zoom) {
      var mapOptions = {
        center: {lat: lat, lng: lng},
        zoom: zoom
      };
      var map = new google.maps.Map(document.getElementById('map'), mapOptions);
      return map;
    },
    plotData: function(result, map) {
      var infowindows = [];
      //add markers
      var markers = result.map(function(result) {
        //image icons base
        var iconBase = 'http://openweathermap.org/img/w/';
        //get coordinates
        var position = { lat: result.coord.lat, lng: result.coord.lon };
        var marker = new google.maps.Marker({
          position: position,
          anchorPoint: new google.maps.Point(0, -15),
          title: result.name,
          map: map,
          // icon: image
          icon: {
            url: iconBase + result.weather[0].icon + '.png',
            size: new google.maps.Size(50, 50),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(25, 25)
          }
        });
        console.log(result);

        var windowContent =
        '<p><strong>' + result.name.toLowerCase() + '</strong></p>' +
        '<p>weather: ' + result.weather[0].description.toLowerCase() + '<br>' +
        'current temp: ' + result.main.temp + '°F<br>' +
        'high temp: ' + result.main.temp_max + '°F<br>' +
        'low temp: ' + result.main.temp_min + '°F<br>' +
        'pressure: ' + result.main.pressure + ' hPa<br>' +
        'humidity: ' + result.main.humidity + '%<br>' +
        'wind degree: ' + result.wind.deg + '<br>' +
        'wind speed: ' + result.wind.speed + ' mph</p>';

        var infowindow = new google.maps.InfoWindow({
          content: windowContent
        });

        function hideAllInfoWindows(){
          infowindows.forEach(function(infowindow){
            infowindow.close();
          });
        }

        marker.addListener('click', function() {
          hideAllInfoWindows();
          infowindow.open(map, marker);
        });
        infowindows.push(infowindow);

        result.infoWindowSidebar = function() {
          hideAllInfoWindows();
          infowindow.open(map, marker);
        };

        return marker;
      });
      // console.log(markers);
    },
    plotForecastData: function(result, map) {
      var infowindows = [];
      //add markers
      // var markers = result.map(function(result) {
      //image icons base
      var iconBase = 'http://openweathermap.org/img/w/';
      //get coordinates
      var position = { lat: result.city.coord.lat, lng: result.city.coord.lon };
      var marker = new google.maps.Marker({
        position: position,
        anchorPoint: new google.maps.Point(0, -15),
        title: result.city.name,
        map: map,
        // icon: image
        icon: {
          url: iconBase + result.list[0].weather[0].icon + '.png',
          size: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 25)
        }
      });
      console.log(result);
    }
  };
}); //end - google maps factory

//app - main map controller
app.controller('MapController', function($scope, weather, googleMaps) {
  weather.getByCityIds(cityIdList, function(data) {
    $scope.result = data.list;
    var result = data.list;
    var map = googleMaps.newMap(39.099727, -94.578567, 4);
    googleMaps.plotData(result, map);
  });
}); //end - main map controller

//forecast controller
app.controller('ForecastController', function($scope, $http, $routeParams, googleMaps) {
  $scope.cityId = $routeParams.cityId;
  $http({
    url:'http://api.openweathermap.org/data/2.5/forecast',
    params: {
      APPID: '16b35f21e8495fad2af63abb2d969031',
      id: $routeParams.cityId,
      units: 'imperial'
    }
  }).success(function(data) {
    $scope.data = data;
    console.log(data);
    var map = googleMaps.newMap(data.city.coord.lat, data.city.coord.lon, 6);
    googleMaps.plotForecastData(data, map);
  });
}); //end -forecast controller
