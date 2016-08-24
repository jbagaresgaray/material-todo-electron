(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('UploadOfflineService', UploadOfflineService);

    UploadOfflineService.$inject = ['_', '$q', '$rootScope', 'SQliteDB', 'TokenService', 'Upload', 'FilesOfflineService'];

    function UploadOfflineService(_, $q, $rootScope, SQliteDB, TokenService, Upload, FilesOfflineService) {
        var service = {};

        service.localupload = localupload;
        service.uploadphoto = uploadphoto;

        return service;

        // function uploadphoto(oldfile, file,isFileChange, callback) {
        function uploadphoto(oldfile, file,isFileChange) {
            var deferred = $q.defer();
            if (!file.$error) {
                Upload.upload({
                    url: '/files?type=user_photo',
                    data: {
                        oldfile: oldfile,
                        user_id: $rootScope.globals.currentUser.user_id,
                        isFileChange: isFileChange,
                        filefield: file
                    },
                    method: 'POST'
                }).then(function(response) {
                        console.log('uploadphoto response: ', response);
                        console.log('$rootScope: ', $rootScope.globals.currentUser);

                        var files = {
                            s3_file_uri: response.data.file,
                            task_id: response.data.task_id,
                            project_id: response.data.project_id,
                            organization_id: response.data.organization_id,
                            comment_id: response.data.comment_id,
                            type: 'user_photo',
                            mime: response.data.file_mime,
                            user_id: $rootScope.globals.currentUser.user_id,
                            file_name: response.data.filename
                        };

                        if (isFileChange && !_.isNull($rootScope.globals.currentUser.id)) {
                            FilesOfflineService.delete($rootScope.globals.currentUser.id);
                        }
                        FilesOfflineService.create(files);

                        // callback(response.data);
                        deferred.resolve(response.data);
                    },
                    function(error) {
                        console.log('uploadphoto error: ', error);
                        callback(error);
                        deferred.reject(error);
                    });
            } else {
                deferred.reject();
            }
            return deferred.promise;
        }


        // function localupload(file, taskid, callback) {
        function localupload(file, taskid) {
            var deferred = $q.defer();
            if (!file.$error) {
                Upload.upload({
                    url: '/files',
                    data: {
                        type: 'tasks',
                        task_id: taskid,
                        user_id: $rootScope.globals.currentUser.user_id,
                        filefield: file
                    },
                    method: 'POST'
                }).then(function(response) {
                        var files = {
                            s3_file_uri: response.data.file,
                            task_id: response.data.task_id,
                            project_id: response.data.project_id,
                            organization_id: response.data.organization_id,
                            comment_id: response.data.comment_id,
                            type: response.data.type,
                            mime: response.data.file_mime,
                            user_id: $rootScope.globals.currentUser.user_id,
                            file_name: response.data.filename
                        };
                        FilesOfflineService.create(files);

                        // callback(response.data);
                        deferred.resolve(response.data);
                    },
                    function(error) {
                        callback(error);
                        deferred.reject(error);
                    });
            } else {
                deferred.reject();
            }
            return deferred.promise;
        }
    }

})();