(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('TagsUnionOfflineService', TagsUnionOfflineService);

    TagsUnionOfflineService.$inject = ['_', '$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function TagsUnionOfflineService(_, $q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = GetAllTagUnion;
        service.get = GetAllTagUnionByUser;
        service.create = AddTagUnion;
        service.delete = DeleteTagUnion;
        service.GetAllTagUnionByUser = GetAllTagUnionByUser;

        return service;

        function StringToBoolean(str) {
            return (str === 'true') ? true : false;
        }

        function GetAllTagUnion(department, id) {
            var taskSQL = 'SELECT tu.id,t.name FROM tags_union tu INNER JOIN tags t ON tu.tag_id = t.id WHERE tu.associated_id = ? AND tu.department = ?'
            return SQliteDB.query(taskSQL, [id, department]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function AddTagUnion(data) {
            console.log('tagsunion: ', data);
            data.tag_id = data.tag_id || '';
            data.associated_id = data.associated_id || '';
            data.department = data.department || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'tagsunion.delete';
            return SQliteDB.query('INSERT INTO tags_union(tag_id,associated_id,department,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?)', [
                    data.tag_id, data.associated_id, data.department,
                    data.user_id, data.created_at, data.updated_at
                ])
                .then(successHandler, errorHandler);
        }

        function DeleteTagUnion(id) {
            var taskSQL = 'DELETE FROM tags_union WHERE tag_id = ?;'
             _broadcastType = 'tagsunion.delete';
            return SQliteDB.query(taskSQL, [id]).then(function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function GetAllTagUnionByUser(userid) {
            var taskSQL = 'SELECT t.* FROM tags_union tu INNER JOIN tags t ON tu.tag_id = t.id WHERE tu.user_id = ? GROUP BY tu.tag_id;'
            return SQliteDB.query(taskSQL, [userid]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function successHandler(response) {
            var data;
            if (_broadcastType == 'tagsunion.create') {
                data = response.insertId;
            } else if (_broadcastType == 'tagsunion.update' || _broadcastType == 'tagsunion.delete') {
                data = 'success';
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('tagsunion.error', error);
        }
    }
})();
