(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$timeout', '$state', 'AuthService', 'FlashService', 'UserService'];

    function LoginController($timeout, $state, AuthService, FlashService, UserService) {
        var vm = this;

        vm.login = login;



        function login() {
            AuthService
                .login(vm.email, vm.password)
                .then(function(isSuccess) {
                    if (isSuccess) {
                        FlashService.barSlideTop('Login successfully');

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
                                require('electron').ipcRenderer.send('tray-show');
                            }

                            $state.go('tasks');
                        }, 1200);
                    } else {
                        FlashService.barSlideTop(isSuccess.message, 'warning');
                        vm.dataLoading = false;
                    }
                }, function(err) {
                    var error = err.error;
                    FlashService.barSlideTop(error.message, 'error');
                });
        }
    }

})();
