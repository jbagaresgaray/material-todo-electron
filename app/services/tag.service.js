(function () {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('TagsService', TagsService);

    TagsService.$inject = ['$http', '$sessionStorage', 'CONFIG'];
    function TagsService($http, $sessionStorage, CONFIG) {
        var service = {};

        service.GetAll = GetAll;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetAllTagUnion = GetAllTagUnion;
        service.AddTagUnion = AddTagUnion;
        service.DeleteTagUnion = DeleteTagUnion;
        service.CreateTagIfNotExist = CreateTagIfNotExist;
        service.GetAllTagUnionByUser = GetAllTagUnionByUser;

        return service;

        function GetAll(uid) {
            return $http.get(CONFIG.APIHost + 'tags/' + uid).then(handleSuccess, handleError('Error getting all tags'));
        }

        function GetAllTagUnion(department, id) {
            return $http.get(CONFIG.APIHost + 'tagsunion/' + department + '/' + id).then(handleSuccess, handleError('Error getting all tags'));
        }

        function GetAllTagUnionByUser(userid) {
            return $http.get(CONFIG.APIHost + 'tagsunion/' + userid).then(handleSuccess, handleError('Error getting all union tags'));
        }

        function CreateTagIfNotExist(tag_name) {
            return $http.post(CONFIG.APIHost + 'tagcheck/' + tag_name).then(handleSuccess, handleError('Error creating tag'));
        }

        function DeleteTagUnion(id) {
            return $http.delete(CONFIG.APIHost + 'tagsunions/' + id).then(handleSuccess, handleError('Error deleting tagunion'));
        }

        function AddTagUnion(tagsunion) {
            return $http.post(CONFIG.APIHost + 'tagsunions', tagsunion).then(handleSuccess, handleError('Error creating tag union'));
        }

        function Create(tag) {
            return $http.post(CONFIG.APIHost + 'tag', tag).then(handleSuccess, handleError('Error creating tag'));
        }

        function Update(tag) {
            return $http.post(CONFIG.APIHost + 'tag/' + tag.id, tag).then(handleSuccess, handleError('Error updating tag'));
        }

        function Delete(id) {
            return $http.delete(CONFIG.APIHost + 'tag/' + id).then(handleSuccess, handleError('Error deleting tag'));
        }

        // private functions
        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }


})();
