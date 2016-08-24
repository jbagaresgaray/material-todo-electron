(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('UsersOfflineService', UsersOfflineService);

    UsersOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService','$filter'];

    function UsersOfflineService($q, $rootScope, SQliteDB, TokenService,$filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.get = _get;
        service.create = _create;
        service.update = _update;
        service.delete = _delete;
        service.getByType = _getByType;

        return service;

        function StringToBoolean(str) {
            return (str === 'true') ? true : false;
        }

        function _list() {
            var sql = 'SELECT us.id AS user_id,us.email,us.username,us.first_name,us.last_name,us.public_key,us.timezone,us.country,fu.s3_file_uri as s3_file_uri_user_photo,fu.id ' +
                'FROM users AS us LEFT JOIN files AS fu ON fu.user_id = us.id AND fu.type=\'user_photo\' WHERE us.id= 1 LIMIT 1;';
            return SQliteDB.query(sql).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function _getByType(type) {
            var taskSQL;
            switch (type) {
                case 'inbox':
                    taskSQL = 'SELECT * FROM users WHERE status=\'false\' AND created_at=updated_at;';
                    break;
                default:
                    taskSQL = 'SELECT * FROM users;';
                    break;
            }
            return SQliteDB.query(taskSQL).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _get(id) {
            $rootScope.$broadcast('users.get');
            return SQliteDB.query('SELECT * FROM users WHERE id =? LIMIT 1;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function _create(data) {
            data.email = data.email || '';
            data.username = data.username || '';
            data.first_name = data.first_name || '';
            data.last_name = data.last_name || '';
            data.password = data.password || null;
            data.status = data.status || null;
            data.email_verification_code = data.email_verification_code || null;
            data.public_key = data.public_key || null;
            data.timezone = data.timezone || null;
            data.country = data.country || null;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'users.create';
            return SQliteDB.query('INSERT INTO users(email,username,first_name,last_name,password,status,email_verification_code,public_key,timezone,country,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [
                    data.email, data.username, data.first_name, data.last_name,
                    data.password, data.status, data.email_verification_code, data.public_key,
                    data.timezone, data.country, data.created_at, data.updated_at
                ])
                .then(successHandler, errorHandler);
        }

        function _update(data) {
            data.email = data.email || '';
            data.username = data.username || '';
            data.first_name = data.first_name || '';
            data.last_name = data.last_name || '';
            data.password = data.password || null;
            data.status = data.status || null;
            data.email_verification_code = data.email_verification_code || null;
            data.public_key = data.public_key || null;
            data.timezone = data.timezone || null;
            data.country = data.country || null;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'users.update';
            return SQliteDB.query('UPDATE users SET email=?,username=?,first_name=?,last_name=?,password=?,status=?,email_verification_code=?,public_key=?,timezone=?,country=?,updated_at=? WHERE id=?', [
                    data.email, data.username, data.first_name, data.last_name,
                    data.password, data.status, data.email_verification_code, data.public_key,
                    data.timezone, data.country, data.updated_at, data.user_id
                ])
                .then(successHandler, errorHandler);
        }


        function _delete(id) {
            _broadcastType = 'users.delete';
            return SQliteDB.query('DELETE FROM users WHERE id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function successHandler(response) {
            var data;
            if (_broadcastType == 'users.create') {
                data = response.insertId;
            } else if (_broadcastType == 'users.update' || _broadcastType == 'users.delete') {
                return {
                    message: 'success'
                }
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('users.error', error);
        }
    }
})();