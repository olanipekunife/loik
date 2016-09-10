angular.module('starter.services', [])
.factory('loader',["$ionicLoading", function($ionicLoading) {
  return {
        show : function() { 
           $ionicLoading.show({
                 template: '<ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner><br>Loading...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
            });
        },
        hide : function(){
           $ionicLoading.hide();
        }
  };
}])
.factory('apis', ["$http" ,function($http) {
  var apis = {};
   var api0 = 'https://loik.herokuapp.com/api/datas/';
   var api1 = 'https://loik.herokuapp.com/api/matric/';
   var api2 = 'https://loik.herokuapp.com/api/datas/notification/';
  apis.getData = function() {
   return $http.get(api0);
  };
    apis.notification = function() {
   return $http.get(api2);
  };
   apis.signup = function(data) {
   return $http.post(api1,data);
  };
  apis.login = function(matric, password){
  return   $http.get(api1 + matric + '/' + password);
    };
      apis.userInfo = function(check){
  return   $http.get(api1+'id/'+check);
    };
      apis.update = function(check, data){
  return   $http.put(api1+'id/'+check,data);
    };
      apis.course = function(level, department){
  return   $http.get(api0+level +'/'+department);
    };
  apis.book = function(level, department, id){
    return $http.get(api0+level +'/'+department+'/'+ id);
  };

  return apis;
}]);

