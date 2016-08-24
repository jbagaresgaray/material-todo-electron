(function() {
    'use strict';

    angular.module('youproductiveApp')
        .factory('TokenService', TokenService);

    TokenService.$inject = ['$localStorage'];

    function TokenService($localStorage) {
        var cachedToken;
        var isSkipApp;
        var userToken = 'userToken';

        var service = {};

        service.setToken = setToken;
        service.getToken = getToken;
        service.isAuthenticated = isAuthenticated;
        service.removeToken = removeToken;
        service.isAuthSkip = isAuthSkip;
        service.setSkipApp = setSkipApp;
        service.unsetSkipApp = unsetSkipApp;

        return service;

        function setToken(token) {
            cachedToken = token;
            $localStorage.userToken = token;
        }

        function getToken() {
            if (!cachedToken)
                cachedToken = $localStorage.userToken;
            return cachedToken;
        }

        function isAuthenticated() {
            return !!service.getToken();
        }

        function removeToken() {
            cachedToken = null;
            $localStorage.$reset();
        }

        function setSkipApp() {
            $localStorage.skipApp = true;
        }

        function unsetSkipApp() {
            $localStorage.skipApp = false;
        }

        function isAuthSkip() {
            return $localStorage.skipApp;
        }
    }
})();
