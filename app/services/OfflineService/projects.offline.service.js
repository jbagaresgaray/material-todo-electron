(function() {
  'use strict';

  angular
    .module('youproductiveApp')
    .factory('ProjectsOfflineService', ProjectsOfflineService);

  ProjectsOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService','$filter'];

  function ProjectsOfflineService($q, $rootScope, SQliteDB, TokenService,$filter) {
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
      return SQliteDB.query('SELECT * FROM projects;').then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }


    function _get(id) {
      $rootScope.$broadcast('projects.get');
      return SQliteDB.query('SELECT * FROM projects WHERE id =?;', [id]).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }

    function _create(data) {
      data.name = data.name || '';
      data.description = data.description || '';
      data.public_key = data.public_key || '';
      data.status = data.status || null;
      data.start_date = data.start_date || '';
      data.end_date = data.end_date || '';
      data.organization_id = data.organization_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'projects.create';
      return SQliteDB.query('INSERT INTO projects(name,description,public_key,status,start_date,end_date,organization_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)', [
          data.name, data.description, data.organization_id,data.public_key,data.status,data.start_date,data.end_date,
          data.created_at, data.updated_at
        ])
        .then(successHandler, errorHandler);
    }


    function _update(data) {
      data.name = data.name || '';
      data.description = data.description || '';
      data.public_key = data.public_key || '';
      data.status = data.status || null;
      data.start_date = data.start_date || '';
      data.end_date = data.end_date || '';
      data.organization_id = data.organization_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'projects.update';
      return SQliteDB.query('UPDATE projects SET name=?,description=?,public_key=?,status=?,start_date=?,end_date=?,organization_id=?,updated_at=? WHERE id=?', [
          data.name, data.description, data.organization_id,data.public_key,data.status,data.start_date,data.end_date,
          data.updated_at, data.id
        ])
        .then(successHandler, errorHandler);
    }


    function _delete(id) {
      _broadcastType = 'projects.delete';
      return SQliteDB.query('DELETE FROM projects WHERE id=?', [id], function(result) {
        return result.rowsAffected;
      }, errorHandler);
    }


    function successHandler(response) {
      var data = {};
      if (_broadcastType == 'projects.create') {
        data.message = 'Successfully created.';
      } else if (_broadcastType == 'projects.update' || _broadcastType == 'projects.delete') {
        data.message = 'success';
      }
      $rootScope.$broadcast(_broadcastType, data);
    }

    function errorHandler(error) {
      console.log(error);
      // console.log(angular.toJson(error));
      $rootScope.$broadcast('projects.error', error);
    }
  }
})();
