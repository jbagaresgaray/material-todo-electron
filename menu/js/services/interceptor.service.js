(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('AuthInterceptor', AuthInterceptor);

    AuthInterceptor.$inject = ['TokenService', 'jwtHelper', '$q', '$localStorage', '$location'];

    function AuthInterceptor(TokenService, jwtHelper, $q, $localStorage, $location) {
        var service = {};

        service.request = request;
        service.requestError = requestError;
        service.response = response;
        service.responseError = responseError;

        return service;

        function request(config) {
            var checkAuthorization = TokenService.isAuthenticated();
            if (checkAuthorization) {
                var token = TokenService.getToken();
                if (!jwtHelper.isTokenExpired(token)) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
            }
            return config;
        }

        function response(response) {
            var checkAuthorization = TokenService.isAuthenticated();
            if (checkAuthorization) {
                var token = TokenService.getToken();
                if (jwtHelper.isTokenExpired(token)) {
                    delete $localStorage.userToken;
                    $location.path('/main');
                    return $q.reject(response);
                }
            }
            return response;
        }

        function responseError(rejection) {
            return $q.reject(rejection);
        }

        function requestError(response) {
            var checkAuthorization = TokenService.isAuthenticated();
            if (checkAuthorization) {
                var token = TokenService.getToken();
                if (jwtHelper.isTokenExpired(token)) {
                    delete $localStorage.userToken;
                    $location.path('/main');
                    return $q.reject(response);
                } else if (response != null && response.status === 401 && token) {
                    delete $localStorage.userToken;
                    $location.path('/main');
                    return $q.reject(response);
                } else if (response.status === 500) {
                    return $q.reject(response);
                } else if (response.status === 0) {
                    return $q.reject(response);
                } else {
                    return $q.reject(response);
                }
            } else if (response.status === 500) {
                return $q.reject(response);
            } else if (response.status === 0) {
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    }
})();
