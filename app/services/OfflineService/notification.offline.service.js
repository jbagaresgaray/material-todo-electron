(function() {
  'use strict';

  angular
    .module('youproductiveApp')
    .factory('NotificationOfflineService', NotificationOfflineService);

  NotificationOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService','$filter'];

  function NotificationOfflineService($q, $rootScope, SQliteDB, TokenService,$filter) {
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
      return SQliteDB.query('SELECT * FROM notifications;').then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }


    function _get(id) {
      $rootScope.$broadcast('notifications.get');
      return SQliteDB.query('SELECT * FROM notifications WHERE id =?;', [id]).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }

    function _create(data) {
      data.description = data.description || '';
      data.status = data.status || '';
      data.user_id = data.organization_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'notifications.create';
      return SQliteDB.query('INSERT INTO notifications(description,status,user_id,created_at,updated_at) VALUES (?,?,?,?,?)', [
          data.description, data.status,data.user_id,
          data.created_at, data.updated_at
        ])
        .then(successHandler, errorHandler);
    }


    function _update(data) {
      data.description = data.description || '';
      data.status = data.status || '';
      data.user_id = data.organization_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'notifications.update';
      return SQliteDB.query('UPDATE notifications SET description=?,status=?,user_id=?,updated_at=? WHERE id=?', [
          data.description, data.status,data.user_id,
          data.updated_at, data.id
        ])
        .then(successHandler, errorHandler);
    }


    function _delete(id) {
      _broadcastType = 'notifications.delete';
      return SQliteDB.query('DELETE FROM notifications WHERE id=?', [id], function(result) {
        return result.rowsAffected;
      }, errorHandler);
    }


    function successHandler(response) {
      var data = {};
      if (_broadcastType == 'notifications.create') {
        data.message = 'Successfully created.';
      } else if (_broadcastType == 'notifications.update' || _broadcastType == 'notifications.delete') {
        data.message = 'success';
      }
      $rootScope.$broadcast(_broadcastType, data);
    }

    function errorHandler(error) {
      console.log(error);
      // console.log(angular.toJson(error));
      $rootScope.$broadcast('notifications.error', error);
    }
  }
})();
