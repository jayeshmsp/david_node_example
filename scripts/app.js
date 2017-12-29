
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
   $scope.submit= function($http){
      
      
      $scope.author ="author";
      $scope.title ="title";
      $scope.body ="body";
   }
});
app.controller('login', function($scope) {

   
      $http.get('/signup',$scope.formData).
        success(function(data) {
            console.log("posted successfully");
        }).error(function(data) {
            console.error("error in posting");
        })
    
  
});