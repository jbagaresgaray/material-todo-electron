(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('TagsOfflineService', TagsOfflineService);

    TagsOfflineService.$inject = ['_', '$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function TagsOfflineService(_, $q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.get = _get;
        service.create = _create;
        service.update = _update;
        service.delete = _delete;
        service.CreateTagIfNotExist = CreateTagIfNotExist;

        return service;

        function StringToBoolean(str) {
            return (str === 'true') ? true : false;
        }

        function _list() {
            return SQliteDB.query('SELECT * FROM tags;').then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _get(id) {
            $rootScope.$broadcast('tags.get');
            return SQliteDB.query('SELECT * FROM tags WHERE id =? LIMIT 1;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _create(data) {
            data.name = data.name || '';
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            return SQliteDB.query('INSERT INTO tags(name,created_at,updated_at) VALUES (?,?,?)', [
                    data.name, data.created_at, data.updated_at
                ])
                .then(successHandler, errorHandler);
        }


        function _update(data) {
            data.name = _.lowerCase(data.name) || '';
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'tags.update';
            return SQliteDB.query('UPDATE tags SET name=?,updated_at=? WHERE id=?', [
                    data.name, data.id
                ])
                .then(successHandler, errorHandler);
        }


        function _delete(id) {
            _broadcastType = 'tags.delete';
            return SQliteDB.query('DELETE FROM tags WHERE id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function CreateTagIfNotExist(tag_name) {
            var taskSQL = 'SELECT t.* FROM tags t WHERE t.name = ?;'
            return SQliteDB.query(taskSQL, [tag_name]).then(function(result) {
                console.log('result.rows: ',result.rows);
                if (result.rows.length === 0) {
                    var created_at = $filter('date')(Date.now(), "d MMM h:mm a");
                    return SQliteDB.query('INSERT INTO tags (name,created_at,updated_at) VALUES (?,?,?);', [
                        tag_name, created_at, created_at
                    ]).then(function(result1) {
                        return {
                            data: result1.insertId
                        };
                    });
                } else {
                    return {
                        data: result.rows[0].id
                    };
                }
            }, errorHandler);
        }

        function successHandler(response) {
            var data = {};
            if (_broadcastType == 'tags.create') {
                data.data = response.insertId;
            } else if (_broadcastType == 'tags.update' || _broadcastType == 'tags.delete') {
                data = 'success';
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('tags.error', error);
        }
    }
})();
