(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .controller('HomeController', HomeController);


    HomeController.$inject = ['$state', '$timeout', 'UserService', 'TokenService', '$rootScope', 'jwtHelper', 'UsersOfflineService', '$sce'];

    function HomeController($state, $timeout, UserService, TokenService, $rootScope, jwtHelper, UsersOfflineService, $sce) {
        var vm = this;
        vm.user = {};

        $rootScope.logout = logout;
        $rootScope.readnotif = readnotif;

        $rootScope.$on('app-logout',function(){
            console.log('app-logout');
            logout();
        });

        function readnotif() {
            $rootScope.notifications = 0;

            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notif-read');
            }
        }

        function logout() {
            console.log('logout');
            if (!$rootScope.isSkipApp && ($rootScope.localUser !== 'null')) {
                TokenService.removeToken();
                UserService.setCurrentUser(null);
                $timeout(function() {
                    $state.go('init', null, { reload: true });
                }, 200);
            } else {
                TokenService.unsetSkipApp();
                UserService.setCurrentUser(null);
                $timeout(function() {
                    $state.go('init');
                }, 200);
            }

            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('logout');
            }
        }
    }

})();
