(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('OrganizationsOfflineService', OrganizationsOfflineService);

    OrganizationsOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService','$filter'];

    function OrganizationsOfflineService($q, $rootScope, SQliteDB, TokenService,$filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.get = _get;
        service.create = _create;
        service.update = _update;
        service.delete = _delete;

        return service;

        function _list() {
            return SQliteDB.query('SELECT * FROM organizations;').then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _get(id) {
            $rootScope.$broadcast('organizations.get');
            return SQliteDB.query('SELECT * FROM organizations WHERE id =?;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function _create(data) {
            data.description = data.description || '';
            data.name = data.name || '';
            data.user_id = data.organization_id || null;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'organizations.create';
            return SQliteDB.query('INSERT INTO organizations(name,description,user_id,created_at,updated_at) VALUES (?,?,?,?,?)', [
                    data.name, data.description, data.user_id,
                    data.created_at, data.updated_at
                ])
                .then(successHandler, errorHandler);
        }


        function _update(data) {
            data.description = data.description || '';
            data.name = data.name || '';
            data.user_id = data.organization_id || null;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'organizations.update';
            return SQliteDB.query('UPDATE organizations SET name=?,description=?,user_id=?,updated_at=? WHERE id=?', [
                    data.name, data.description, data.user_id,
                    data.updated_at, data.id
                ])
                .then(successHandler, errorHandler);
        }


        function _delete(id) {
            _broadcastType = 'organizations.delete';
            return SQliteDB.query('DELETE FROM organizations WHERE id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function successHandler(response) {
            var data = {};
            if (_broadcastType == 'organizations.create') {
                data.message = 'Successfully created.';
            } else if (_broadcastType == 'organizations.update' || _broadcastType == 'organizations.delete') {
                data.message = 'success';
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('organizations.error', error);
        }
    }
})();