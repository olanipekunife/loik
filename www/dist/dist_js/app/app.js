
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
  





