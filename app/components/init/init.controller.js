(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .controller('InitController', InitController);

    InitController.$inject = ['$rootScope', '$scope', '$timeout', '$state', '$filter', 'TokenService', 'UserService', '$auth', 'UsersOfflineService', 'FlashService', '$sce'];

    function InitController($rootScope, $scope, $timeout, $state, $filter, TokenService, UserService, $auth, UsersOfflineService, FlashService, $sce) {
        var vm = this;
        var user_data = {};

        vm.preload = true;

        vm.skipApp = skipApp;
        vm.authenticate = authenticate;
        vm.onLoad = onLoad;


        function onLoad() {
            // if (typeof module === "object" && typeof module.exports === "object") {
            //     require('electron').ipcRenderer.send('logout');
            // }

            UsersOfflineService.list()
                .then(function(data) {
                    if (!_.isEmpty(data) && data.length > 0) {
                        data[0].old_user_photo = data[0].s3_file_uri_user_photo;
                        if (typeof module === "object" && typeof module.exports === "object") {
                            const nativeImage = require('electron').nativeImage;
                            var image = nativeImage.createFromPath(data[0].s3_file_uri_user_photo);
                            data[0].s3_file_uri_user_photo = image.toDataURL();
                        } else {
                            data[0].s3_file_uri_user_photo = data[0].s3_file_uri_user_photo || './assets/images/avatar.png';
                        }
                        user_data = data[0];
                    }
                }).then(function() {
                    if ($rootScope.isSkipApp && !$rootScope.checkAuthorization && ($rootScope.localUser !== 'null')) {
                        UserService.setCurrentUser(user_data);

                        $timeout(function() {
                            $rootScope.splashLoading = false;
                            vm.preload = false;

                            if (typeof module === "object" && typeof module.exports === "object") {
                                require('electron').ipcRenderer.send('login');
                                require('electron').ipcRenderer.send('tray-login');
                                require('electron').ipcRenderer.send('tray-show');
                            }

                            $state.go('tasks');
                        }, 5000);
                        return;
                    } else {
                        $timeout(function() {
                            vm.preload = false;
                            $rootScope.splashLoading = false;
                        }, 5000);
                    }
                });
        }

        function authenticate(provider) {
            $auth.authenticate(provider);
        };

        function skipApp() {
            if (!_.isEmpty(user_data)) {
                $timeout(function() {
                    if (typeof module === "object" && typeof module.exports === "object") {
                        require('electron').ipcRenderer.send('login');
                        require('electron').ipcRenderer.send('tray-show');
                    }
                    $state.go('tasks', null, {
                        reload: true
                    });
                }, 800);

                UserService.setCurrentUser(user_data);
                TokenService.setSkipApp();
            } else {
                console.log('else skipApp');

                var user = {
                    username: user_data.username || '',
                    first_name: user_data.first_name || '',
                    last_name: user_data.last_name || '',
                    email: user_data.email || '',
                    s3_file_uri_user_photo: './assets/images/avatar.png',
                    created_at: user_data.created_at || $filter('date')(Date.now(), "d MMM h:mm a")
                };
                user.updated_at = user.created_at;
                UsersOfflineService.create(user);
                UserService.setCurrentUser(user);
                TokenService.setSkipApp();
            }

        };

        $scope.$on('users.create', function() {
            $timeout(function() {
                if (typeof module === "object" && typeof module.exports === "object") {
                    var login_user_data = {};
                    if (!_.isUndefined(UserService.getCurrentUser())) {
                        login_user_data= JSON.parse($rootScope.localUser);
                    }
                    require('electron').ipcRenderer.send('login');
                    require('electron').ipcRenderer.send('tray-show');
                }

                $state.go('tasks');
            }, 800);
        });

        $scope.$on('users.error', function(event, response) {
            console.log('users.error');
            errorHandler(response);
        });

        $scope.$on('users.update', function(event, response) {
            if (response == 'success') {
                $timeout(function() {
                    if (typeof module === "object" && typeof module.exports === "object") {
                        var login_user_data = {};
                        if (!_.isUndefined(UserService.getCurrentUser())) {
                            login_user_data= JSON.parse($rootScope.localUser);
                        }
                        require('electron').ipcRenderer.send('login');
                        require('electron').ipcRenderer.send('tray-show');
                    }

                    $state.go('tasks');
                }, 800);
            }
        });

        function errorHandler(response) {
            console.log('Error => ' + angular.toJson(response));
            FlashService.barSlideTop(response.data.error.message, 'error', 100);
        }

    }
})();
