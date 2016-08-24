(function() {
    'use strict';

    angular.module('youproductiveApp')
        .controller('mainCtrl', mainCtrl);

    mainCtrl.$inject = ['$scope', '$state', 'AuthService', 'UserService', '$timeout', 'ionicToast'];

    function mainCtrl($scope, $state, AuthService, UserService, $timeout, ionicToast) {
        $scope.user = {};

        $scope.login = function(user) {
            AuthService
                .login(user.email, user.password)
                .then(function(isSuccess) {
                    if (isSuccess) {
                        UserService.GetAll().then(function(data) {
                            if (data && data.user_details.length > 0) {
                                console.log('data: ', data.user_details[0]);
                                UserService.setCurrentUser(data.user_details[0]);
                            }
                        }, function(err) {
                            console.log('currentUser err: ', err);
                        });

                        $timeout(function() {
                            if (typeof module === "object" && typeof module.exports === "object") {
                                require('electron').ipcRenderer.send('login');
                            }
                            $state.go('app.tasks');
                        }, 1200);
                    } else {
                        $ionicPopup.alert({
                            title: 'WARNING',
                            template: isSuccess.message
                        });
                        vm.dataLoading = false;
                    }
                }, function(err) {
                    console.log("err: ", err);
                    if (err.email) {
                        ionicToast.showError(err.email[0], 'top', true, 1000);
                    }
                    if (err.password) {
                        ionicToast.showError(err.password[0], 'top', true, 2000);
                    }
                    if (err.error) {
                        ionicToast.showError(err.error.message, 'top', true, 2000);
                    }
                });
        };

        $scope.skipApp = function() {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('tray-skip');
            }
        };


        $scope.$on('$ionicView.enter', function() {
            $scope.user = {};
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('tray-login');
            }
        });
    }


})();
