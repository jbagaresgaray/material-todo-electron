(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .controller('UpdateProfileController', UpdateProfileController);

    UpdateProfileController.$inject = ['$filter', '$rootScope', '$scope', '$http', '$timeout', '$location', 'UserService', 'UsersOfflineService', 'UploadOfflineService', 'FlashService', '$state', '$localStorage', 'jwtHelper', 'TokenService', 'Upload', 'CONFIG', '$sce'];

    function UpdateProfileController($filter, $rootScope, $scope, $http, $timeout, $location, UserService, UsersOfflineService, UploadOfflineService, FlashService, $state, $localStorage, jwtHelper, TokenService, Upload, CONFIG, $sce) {

        var vm = this;
        var on = {};
        var isFileChange = false;

        console.log('UpdateProfileController');

        vm.updateprofile = updateprofile;
        vm.getuserprofile = getuserprofile;
        vm.uploadProfilePic = uploadProfilePic;
        vm.isFileChange = false;

        vm.user = {};

        function getuserprofile() {
            if (!$rootScope.isSkipApp && $rootScope.checkAuthorization) {
                vm.dataLoading = true;
                UserService.GetAll()
                    .then(function(response) {
                        if (response.user_details && response.user_details.length > 0) {
                            vm.user = response.user_details[0];
                            vm.user.user_photo_file_id = vm.user.id;
                            vm.user.country = '';
                            vm.user.timezone = '';

                            console.log('vm.user1: ', vm.user);
                            UserService.setCurrentUser(vm.user);

                            vm.dataLoading = false;
                        }
                    });
            } else {
                UsersOfflineService.list().then(function(data) {
                    if (data && data.length > 0) {
                        data[0].old_user_photo = data[0].s3_file_uri_user_photo;
                        if (typeof module === "object" && typeof module.exports === "object") {
                            const nativeImage = require('electron').nativeImage;
                            var image = nativeImage.createFromPath(data[0].s3_file_uri_user_photo);
                            data[0].s3_file_uri_user_photo = image.toDataURL();
                        } else {
                            data[0].s3_file_uri_user_photo = data[0].s3_file_uri_user_photo || './assets/images/avatar.png';
                        }
                        vm.user = data[0];
                        vm.user.user_photo_file_id = vm.user.id;
                        vm.user.country = '';
                        vm.user.timezone = '';

                        console.log('vm.user2: ', vm.user);
                        UserService.setCurrentUser(vm.user);

                        vm.dataLoading = false;
                    }
                });
            }
        }


        function uploadProfilePic(files) {
            console.log('files: ', files);
            if (files) {
                isFileChange = true;
                vm.isFileChange = true;
                console.log('uploadProfilePic: ', isFileChange);
            }
        }

        function updateprofile() {
            vm.dataLoading = true;
            console.log('user not uploaded', vm.user);
            if (!$rootScope.isSkipApp) {
                UserService.Update(vm.user).then(function(response) {
                    console.log('first then', response);
                    if (response.message === 'success') {
                        UserService.setCurrentUser(vm.user);

                        if (typeof module === "object" && typeof module.exports === "object") {
                            require('electron').ipcRenderer.send('notify-message', 'User Profile successfully updated. . .');
                        } else {
                            FlashService.barSlideTop('User Profile successfully updated. . .');
                        }

                    } else {
                        FlashService.barSlideTop(response.message, 'error');
                        vm.dataLoading = false;
                    }
                }).then(function() {
                    var upload = Upload.upload({
                        url: CONFIG.APIHost + 'files?type=user_photo',
                        data: {
                            filefield: vm.user.s3_file_uri_user_photo
                        }
                    });

                    upload.then(function(resp) {
                        console.log('file ', resp, 'is uploaded successfully. Response: ', resp.data);
                    }, function(error) {
                        console.log('error: ', error.data.message);
                        if (error.data.message == 'Can only add one (1) user profile photo.') {
                            if (!_.isNull(vm.user.s3_file_uri_user_photo) || !_.isUndefined(vm.user.s3_file_uri_user_photo)) {
                                UserService.DeleteUserAvatar(vm.user.user_photo_file_id).then(function(response) {
                                    console.log('DeleteUserAvatar response: ', response);
                                });
                                Upload.upload({
                                    url: CONFIG.APIHost + 'files?type=user_photo',
                                    data: {
                                        filefield: vm.user.s3_file_uri_user_photo
                                    }
                                }).then(function() {
                                    $state.go($state.current, null, {
                                        reload: true
                                    });
                                    vm.dataLoading = false;
                                });
                            }
                        }
                        vm.dataLoading = false;
                    });
                }).then(function() {
                    getuserprofile();
                });
            } else {
                UsersOfflineService.update(vm.user).then(function(response) {
                    console.log('Offline first then', response);
                    if (response.message === 'success') {
                        UserService.setCurrentUser(vm.user);

                        if (typeof module === "object" && typeof module.exports === "object") {
                            require('electron').ipcRenderer.send('notify-message', 'User Profile successfully updated. . .');
                        } else {
                            FlashService.barSlideTop('User Profile successfully updated. . .');
                        }
                        
                    } else {
                        FlashService.barSlideTop(response.message, 'error');
                    }
                    vm.dataLoading = false;
                }).then(function() {
                    if (typeof module === "object" && typeof module.exports === "object") {
                        console.log('isFileChange: ', isFileChange);
                        if (isFileChange) {
                            UploadOfflineService.uploadphoto(vm.user.old_user_photo, vm.user.s3_file_uri_user_photo, isFileChange, function callback(response) {
                                console.log('response: ', response)
                                if (response) {
                                    getuserprofile();
                                    FlashService.otherThumbslider('User photo successfully uploaded', 'success', 100);
                                }
                            });
                        }
                    } else {
                        FlashService.otherThumbslider('Uploading via browser is not supported', 'warning', 100);
                    }
                }).then(function() {
                    $timeout(function() {
                        $state.reload();
                    }, 1000);
                });
            }
        }

        function handleSuccess(resp) {
            $state.reload();
            vm.dataLoading = false;
        }

        function errorHandler(response) {
            console.log('Error => ', response);
            vm.isRequesting = false;
        }

        function handleProgress(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ');
        }
    }

})();
