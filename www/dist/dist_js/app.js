
angular.module('starter', ['ionic', 'ngRoute', 'ngCordova', 'starter.controllers', 'starter.services', 'auth0', 
  'angular-storage', 
  'angular-jwt', 'templates'])


.run(['$ionicPlatform', '$ionicPopup', '$cordovaNetwork', '$rootScope', 'auth', 'store', 'jwtHelper', '$state', '$cordovaStatusbar', function ($ionicPlatform, $ionicPopup, $cordovaNetwork, $rootScope, auth, store, jwtHelper, $state, $cordovaStatusbar) {
  $ionicPlatform.ready(function() {
     var toke = store.get('accessToken');
     var type = $cordovaNetwork.getNetwork();
    var isOffline = $cordovaNetwork.isOffline();
     if (window.StatusBar) {
  $cordovaStatusbar.styleHex('#564A47');
    }
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }  
 if (isOffline) {
      $ionicPopup.confirm({
           title: 'Internet',
           template: 'Internet is not working on your device'
         });
    }else if(type == Connection.CELL_2G){
       if (toke) {
          $state.go('signup');
  }
       $ionicPopup.alert({
           title: 'Network',
           template: 'Please Switch To 3G To Get A Better Experience'
         });
    }else{
      if (toke) {
           $state.go('signup');
  }
    }
  });
  auth.hookEvents();
  var refreshingToken = null;
  $rootScope.$on('$locationChangeStart', function() {
    var token = store.get('token');
    var refreshToken = store.get('refreshToken');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
           $rootScope.isAuthenticated = auth.isAuthenticated;

        }
      } else {
        if (refreshToken) {
          if (refreshingToken === null) {
            refreshingToken = auth.refreshIdToken(refreshToken).then(function(idToken) {
              store.set('token', idToken);
              auth.authenticate(store.get('profile'), idToken);
            }).finally(function() {
              refreshingToken = null;
            });
          }
          return refreshingToken;
        } else {
          $state.go('authlogin');
        }                        
      }
    }
  });
}])
.config(['$ionicConfigProvider', '$stateProvider', '$urlRouterProvider', 'authProvider', '$httpProvider', 'jwtInterceptorProvider', '$routeProvider', function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, authProvider, $httpProvider, jwtInterceptorProvider, $routeProvider) {
  $ionicConfigProvider.scrolling.jsScrolling(false);
  $ionicConfigProvider.navBar.alignTitle('center');
 $stateProvider

       .state('menu', {
                url : '/menu',
                templateUrl : 'main.html',
                abstract : true,
                controller : 'mainCtrl',
                  data: {
      requiresLogin: true
    }
            })

    .state('menu.tab', {
    url: '/tab',
      views: {
                     'menu': {
                         templateUrl: 'tabs.html',
                         
                     }
                 }
  })


  .state('home', {
    url: '/home',
  
                         templateUrl: 'home.html',
                        controller : 'homeCtrl'              
  })
  .state('authlogin', {
    url: "/authlogin",
    templateUrl: "authlogin.html",
    controller: 'authloginCtrl'
  })
       .state('signup', {
    url: '/signup',
  
                         templateUrl: 'signup.html',
                        controller : 'signupCtrl' ,
                          data: {
      requiresLogin: true
    }      
  })
      .state('login', {
    url: '/login',
    templateUrl: 'login.html',
    controller: 'loginCtrl',
      data: {
      requiresLogin: true
    }
  })
        .state('about', {
    url: '/about',
    templateUrl: 'about.html',
    controller: 'aboutCtrl',
  })
     .state('menu.courses', {
    url: '/courses/:level/:department',
    views: {
      'menu': {
        templateUrl: 'menu-courses.html',
        controller: 'coursesCtrl'
      }
    }
  })
      .state('userInfo', {
    url: '/userInfo/:check',
    templateUrl: 'userInfo.html',
    controller: 'UserInfoCtrl',
  data: {
      requiresLogin: true
    }
  })
   .state('availableCourse', {
    url: '/availableCourse',
  
                         templateUrl: 'availableCourse.html',
                        controller : 'availableCourseCtrl'              
  })      

      
       .state('notification', {
    url: '/notification',
  
                         templateUrl: 'notification.html',
                        controller : 'notificationCtrl' ,
                          data: {
      requiresLogin: true
    }             
  })


  .state('menu.tab.book', {
    url: '/book/:level/:department/:id/:title',
    views: {
      'menu-tab-book': {
        templateUrl: 'menu-tab-book.html',
        controller: 'bookCtrl'
      }
    }
  })
   .state('menu.tab.chats', {
      url: '/chats',
      views: {
        'menu-tab-chats': {
          templateUrl: 'menu-tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })

    

  .state('menu.tab.account', {
    url: '/account',
    views: {
      'menu-tab-account': {
        templateUrl: 'menu-tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });
  authProvider.init({
    domain: 'coursehero.eu.auth0.com',
    clientID: 'WeDLKBlwta5duYgPg0IJDN5Ogwzd9j05',
    loginState: 'authlogin' // This is the name of the state where you'll show the login, which is defined above...
  });
 
// if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
}]);
  






angular.module('starter.controllers', [])
.controller('homeCtrl',["auth", "$scope", "store", "$cordovaInAppBrowser",function(auth, $scope, store, $cordovaInAppBrowser) {
$scope.logout= function(){

 auth.signout();
  store.remove('profile');
  store.remove('token');
  store.remove('accessToken');
   store.remove('refreshToken');
};
var options = {
  location: 'yes',
  clearcache:'yes',
  toolbar:'yes'
};
$scope.browse = function(){
  $cordovaInAppBrowser.open('http://coursehero.ensemblelab.com.ng', '_blank', options).then(function(event){
  }).catch(function(event){
  });
};
  
}])
.controller('authloginCtrl', ["store", "$scope", "$state", "auth",function(store, $scope, $state, auth){
  function doAuth() {
    auth.signin({
        closable: false,
       primaryColor: '#564A47',
      icon: 'img/logo.png' ,

      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      }
    }, function(profile, token, accessToken, state, refreshToken) {
      $scope.isAuthenticated = auth.isAuthenticated;
      store.set('profile', profile);
      store.set('token', token);
      store.set('accessToken', accessToken);
      store.set('refreshToken', refreshToken);
      
      $state.go('signup');
    }, function(error) {
      // Error callback
    });
  }
  $scope.$on('$ionic.reconnectScope', function() {
    doAuth();
  });

  doAuth();
  
}])
.controller('notificationCtrl',["apis" ,"$scope",function (apis, $scope) {
  $scope.data = [];
  apis.notification().success(function(response) {
 $scope.data  = response;
}).error(function (response) {
    alert('Unable To Connect To Server.Please Check Your Connection');   
 });
}])
.controller('signupCtrl',["apis", "$state", "$scope", "loader",function(apis, $state, $scope, loader
  ) {
 $scope.signup = function(matric,faculty,department,level,password) {
  loader.show();
  matric = matric.split('/').join('-');
  password = password.split('/').join('-');
   $scope.error = [];
  var data = {matric:matric,faculty:faculty,department:department,level:level,password:password};
    apis.signup(data).success(function(data){
      $scope.passwor = '';
       $scope.erro = '';
        $scope.matri = '';
    $state.go('login');
  }).error(function(error){
      $scope.erro = 'Please Try Again. Check Your Connection ';
           $scope.matri =error.matric[0];
     $scope.passwor =error.password[0];
 
  
  }).finally(function() { 
    loader.hide();
    });  
  };
  
}])
.controller('loginCtrl', ["$cordovaLocalNotification", "$ionicPlatform", "$scope", "$state", "apis", "$ionicPopup", "loader",function($cordovaLocalNotification, $ionicPlatform, $scope, $state, apis, $ionicPopup, loader) {

   $ionicPlatform.ready(function () {
    var notifyTitle = 'CourseHero';
       var notifySound = 'file://audio/Aurora.mp3';
       var notifyIcon = 'res://icon.png';
       var notifysmallIcon = 'res://ic_stat_social_school.png';
   var now = new Date().getTime();
      var _6Hours = new Date (now + 3600 * 12000);
   $scope.login = function (matric, password){
   loader.show();
    matric = matric.split('/').join('-');
    password = password.split('/').join('-');
     $scope.data = [];
   apis.login(matric, password).success(function(response) {
 $scope.data  = response;
 $scope.erro = '';
      $cordovaLocalNotification.schedule({
        id: 1,
        title: notifyTitle,
       text: 'Hello! Am Here If You Need To Read Anytime',
        at : _6Hours,
          every: 'day',
          sound: notifySound,
        icon: notifyIcon,
         smallIcon: notifysmallIcon     
      });
  $state.go("menu.courses",{level:$scope.data[0].level,department:$scope.data[0].department});
}).error(function (response) {
    $ionicPopup.alert({
               title: "Unauthorized",
               template: "Wrong Matric. No. Or Password"
             });  
   $scope.erro = 'Please check your connection';
 }).finally(function() { 
    loader.hide();
    });  
 
 
};
});
  $scope.profile = function(matric,password){
   
    
   loader.show();
    matric = matric.split('/').join('-');
    password = password.split('/').join('-');
    $scope.data = [];
   apis.login(matric, password).success(function(response) {

 $scope.data  = response;


  $scope.erro = '';
 $state.go("userInfo",{check:$scope.data[0].id});
 }).error(function (response) {
    $ionicPopup.alert({
               title: "Unauthorized",
               template: "Wrong Matric. No. Or Password"
             });  
   $scope.erro = 'Please check your connection';
 }).finally(function() { 
    loader.hide();
    });  
};

}])
   .controller('UserInfoCtrl', ["$stateParams", "loader", "apis", "$scope", "auth", "$ionicModal",function ($stateParams, loader, apis, $scope, auth, $ionicModal) {
  loader.show();
      $scope.data = [];
      $scope.err = [];
      $scope.error = '';
  $scope.auth = auth;
  var check = $stateParams.check;
  $scope.doRefresh = function(){
     $scope.data = [];
     $scope.error = '';
     $scope.passwor = '';
      $scope.leve = '';
     apis.userInfo(check).success(function(response){
    $scope.data = response;
  }).error(function(err){
    $scope.error = 'Check Your Connection.Please Try Again.Pull To Refresh';
        $scope.passwor =err.password[0];
  }).finally(function() { 
       $scope.$broadcast('scroll.refreshComplete');
    });  
  };
  apis.userInfo(check).success(function(response){
    $scope.data = response;
  }).error(function(){
    $scope.error = 'Check Your Connection.Please Try Again.Pull To Refresh';
  }).finally(function() { 
    loader.hide();
    });  
  $ionicModal.fromTemplateUrl('modal.html', {
    scope: $scope,
     backdropClickToClose: false,
      animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
   $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  $scope.update = function(u){
      loader.show();
       u.password = u.password.split('/').join('-');
       var data = {faculty:u.faculty,department:u.department,level:u.level,password:u.password};
            apis.update(check,data).success(function(er){
    $scope.error = '';
     $scope.passwor = '';
  }).error(function(er){
      $scope.error = 'Unable To Update Now.Pull To Refresh';
      $scope.passwor =er.password[0];
       $scope.leve =er.level[0];
  }).finally(function() { 
     $scope.modal.hide();
         loader.hide();
    }); 
      };
      

  }])
.controller('coursesCtrl',["apis", "$rootScope", "$stateParams", "$http", "$state" , "$scope", "loader",function (apis, $rootScope, $stateParams, $http, $state, $scope, loader) {
   loader.show();
$scope.books = [];
$scope.carrys = [];
$scope.l=$stateParams.level;
var level = $stateParams.level;
 var department = $stateParams.department;
  $rootScope.$broadcast('coursEvent', [level,department]);
var lastpage = 1;
  $scope.doRefresh = function(){
    var refresh = 1;
     $scope.nodata = false;
   $scope.books = [];
   $scope.carrys = [];
 apis.course(level, department).success(function(response) {
 $scope.data  = response;
    for(var i in $scope.data){
      $scope.books.push($scope.data[i]);
    }
    $scope.error = "";
}).error(function (response) {
   $scope.error = "Unable To Connect To Server.please check your connection.refresh again";
 }).finally(function() { 
   $scope.$broadcast('scroll.refreshComplete');
    });
   $http({
    url:'https://lumen-rest.scalingo.io/api/datas/carry/'+level +'/'+department,
    method:'GET',
    params: {page: refresh}
  }).success(function(response){
    $scope.dat =response.data;
     for(var i in $scope.dat){
      $scope.carrys.push($scope.dat[i]);
    }
    $scope.erro = ""; 
  }).error(function (er) {
  $scope.erro = "Unable To Connect To Server.please check your connection.Pull down to refresh";
 }).finally(function() { 
   $scope.$broadcast('scroll.refreshComplete');
    });

   };

  apis.course(level, department).success(function(response) {
 $scope.data  = response;
    for(var i in $scope.data){
      $scope.books.push($scope.data[i]);
    }
    $scope.error = ""; 
}).error(function (response) {
   $scope.error = "Unable To Connect To Server.please check your connection.pull down to refresh";
 }).finally(function() { 
      // On both cases hide the loading
      loader.hide();
    }); 
    $http({
    url:'https://lumen-rest.scalingo.io/api/datas/carry/'+level +'/'+department,
    method:'GET',
    params: {page: lastpage}
  }).success(function(response){
    $scope.dat = response.data;
     for(var i in $scope.dat){
      $scope.carrys.push($scope.dat[i]);
    }
    $scope.erro = "";
  }).error(function (er) {
     $scope.erro = "Unable To Connect To Server.please check your connection.Pull down to refresh";
      $scope.nodata = true;
 }).finally(function() { 
  loader.hide();
    });
  $scope.nodata = false;
$scope.loadMore = function(){
 lastpage +=1;
   $http({
    url:'https://lumen-rest.scalingo.io/api/datas/carry/'+level +'/'+department,
    method:'GET',
    params: {page: lastpage}
  }).success(function(response){
    if (response.next_page_url === null) {
      $scope.nodata = true;
    }
    $scope.dat =response.data;
     for(var i in $scope.dat){
      $scope.carrys.push($scope.dat[i]);
    }
    $scope.erro = "";
  }).error(function (er) {  
  $scope.erro = "Unable To Connect To Server.please check your connection.Pull down to refresh";
   $scope.nodata = true; 
 }).finally(function() { 
  $scope.$broadcast('scroll.infiniteScrollComplete');
    });
};
}])
 .controller('mainCtrl', ["$scope", "auth",function ($scope, auth) {
  $scope.auth = auth;
   $scope.$on('coursEvent', function(event, mass) {  
  $scope.level = mass[0]; 
  $scope.department = mass[1];
});
}])
.controller('bookCtrl',["$ionicPopup", "$cordovaFile", "$cordovaFileOpener2", "$cordovaFileTransfer", "$scope", "apis", "$stateParams", "loader", "$timeout",function ($ionicPopup, $cordovaFile, $cordovaFileOpener2, $cordovaFileTransfer, $scope, apis, $stateParams, loader, $timeout) {
  loader.show();
    $scope.data = [];
   
  var level = $stateParams.level;
  var department = $stateParams.department;
   var id = $stateParams.id;
  var title = $stateParams.title;
   $scope.doRefresh = function(){
 $scope.data = [];

 apis.book(level, department, id).success(function(response) {
   $scope.data  = response;
   }).error(function (response) {
   $scope.error = "please check your connection.pull to refresh";
  }).finally(function() { 
   $scope.$broadcast('scroll.refreshComplete');
    });
 
  };

var ur = title.replace(/[^A-Za-z0-9]/g , '');

   
  apis.book(level, department, id).success(function(response) {
   $scope.data  = response;
   }).error(function (response) {
   $scope.error = "please check your connection.pull to refresh";
  }).finally(function() { 
   loader.hide();
    });
function getSpace(){
$cordovaFile.getFreeDiskSpace().then(function (success){
 $ionicPopup.alert({
           title: 'Connection Error',
           template: 'Please Check Your Network And Try Again. Available Space ->'+ success+'Kb',
         });
        loader.hide();
}, function (error) {
   $ionicPopup.alert({
           title: 'Connection Error',
           template: 'Please Check Your Network And Try Again',
         });
        loader.hide();
});
}
function download(){

$scope.downloadProgress = 0;
 var url = "http://loik.herokuapp.com/pdf/"+ur+".pdf";
    var targetPath = cordova.file.externalRootDirectory + "CourseHero/" + title;
    var trustHosts = true;
    var options = {};

    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
      .then(function(result) {
        // Success!
        loader.hide();
        open();
      }, function(err) {
       
       getSpace();
      }, function (progress) {
        $timeout(function () {
          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        });
      });

}

function open(){

  $cordovaFileOpener2.open(
    cordova.file.externalRootDirectory+ "CourseHero/" + title,
    'application/pdf'
  ).then(function() {
    loader.hide();
      // file opened successfully
  }, function(err) {
      $ionicPopup.alert({
           title: 'Error',
           template: 'Make Sure You Have A PDF Reader Installed',
         });
        loader.hide();
  });
}
$scope.check=function(){
loader.show();
    $cordovaFile.checkFile(cordova.file.externalRootDirectory,  "CourseHero/" + title)
      .then(function (success) {
        // success
        open();
      }, function (error) {
        // error
      download();
      });
  };

}])
.controller('availableCourseCtrl',["$cordovaFileOpener2", "$cordovaFile", "$scope", "loader", "$ionicPopup",function ($cordovaFileOpener2, $cordovaFile, $scope, loader, $ionicPopup) {
     loader.hide();
function listFile(path){
  window.resolveLocalFileSystemURL(path, 
    function (fileSystem){
      var reader = fileSystem.createReader();
      reader.readEntries(
        function (book){
          if (book) {
            $scope.data = book; 
          }else{
             $ionicPopup.confirm({
           title: 'Empty',
           template: 'You currently do not have any book available.',
         });
          }
         
        },
        function (err){
            $ionicPopup.confirm({
           title: 'Error',
           template:'You have no book available.',
         });
        });
    }, function (err){
       $ionicPopup.confirm({
           title: 'Error',
           template:'You have no book available.',
         });
    });
}
$scope.open = function (u){
  loader.show();
  $cordovaFileOpener2.open(
    cordova.file.externalRootDirectory+ "CourseHero/" + u.name ,
    'application/pdf'
  ).then(function() {
  }, function(err) {  
      $ionicPopup.alert({
           title: 'Error',
           template: 'Make Sure You Have A PDF Reader Installed',
         });
    loader.hide();
  });
};
listFile(cordova.file.externalRootDirectory + "CourseHero/");
}])

.controller('aboutCtrl', function () { 
})
.controller('ChatsCtrl', function () { 
})
.controller('AccountCtrl', function() {
});


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
 //  var api0 = 'http://localhost:8000/api/datas/';
 // var api1 = 'http://localhost:8000/api/matric/';
   var api0 = 'https://lumen-rest.scalingo.io/api/datas/';
   var api1 = 'https://lumen-rest.scalingo.io/api/matric/';
   // var api2 = 'http://localhost:8000/api/datas/notification/';
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

