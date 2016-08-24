(function() {
  'use strict';

  angular
    .module('youproductiveApp')
    .factory('LogsOfflineService', LogsOfflineService);

  LogsOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService','$filter'];

  function LogsOfflineService($q, $rootScope, SQliteDB, TokenService,$filter) {
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
      return SQliteDB.query('SELECT * FROM logs;').then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }


    function _get(id) {
      $rootScope.$broadcast('logs.get');
      return SQliteDB.query('SELECT * FROM logs WHERE id =?;', [id]).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }

    function _create(data) {
      data.description = data.description || '';
      data.type = data.type || '';
      data.associated_id = data.associated_id || null;
      data.user_id = data.organization_id || $rootScope.globals.currentUser.user_id;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'logs.create';
      return SQliteDB.query('INSERT INTO logs(description,type,associated_id,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?)', [
          data.description, data.type,data.associated_id,data.user_id,
          data.created_at, data.updated_at
        ])
        .then(successHandler, errorHandler);
    }


    function _update(data) {
      data.description = data.description || '';
      data.type = data.type || '';
      data.associated_id = data.associated_id || null;
      data.user_id = data.organization_id || $rootScope.globals.currentUser.user_id;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'logs.update';
      return SQliteDB.query('UPDATE logs SET description=?,type=?,associated_id=?,user_id=?,updated_at=? WHERE id=?', [
          data.description, data.type,data.associated_id,data.user_id,
          data.updated_at, data.id
        ])
        .then(successHandler, errorHandler);
    }


    function _delete(id) {
      _broadcastType = 'logs.delete';
      return SQliteDB.query('DELETE FROM logs WHERE id=?', [id], function(result) {
        return result.rowsAffected;
      }, errorHandler);
    }


    function successHandler(response) {
      var data = {};
      if (_broadcastType == 'logs.create') {
        data.message = 'Successfully created.';
      } else if (_broadcastType == 'logs.update' || _broadcastType == 'logs.delete') {
        data.message = 'success';
      }
      $rootScope.$broadcast(_broadcastType, data);
    }

    function errorHandler(error) {
      console.log(error);
      // console.log(angular.toJson(error));
      $rootScope.$broadcast('logs.error', error);
    }
  }
})();
