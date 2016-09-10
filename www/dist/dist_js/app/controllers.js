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
    url:'https://loik.herokuapp.com/api/datas/carry/'+level +'/'+department,
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
    url:'https://loik.herokuapp.com/api/datas/carry/'+level +'/'+department,
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
    url:'https://loik.herokuapp.com/api/datas/carry/'+level +'/'+department,
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
  $cordovaFileOpener2.open(
    cordova.file.externalRootDirectory+ "CourseHero/" + u.name ,
    'application/pdf'
  ).then(function() {
  }, function(err) {  
      $ionicPopup.alert({
           title: 'Error',
           template: 'Make Sure You Have A PDF Reader Installed',
         });
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

