/**
 * Created by Antonio Altamura on 24/04/2016.
 */

app.controller('fileUploadController',["$scope","FileUploader","$http","$window","SweetAlert",function($scope,FileUploader,$http,$window,SweetAlert){

	let SweetError = (msg, e={}) => {
		SweetAlert.swal("Error", msg + '\n' + JSON.stringify(e,null, "\t"), "warning");
		console.error(e)
	};

	$scope.filename="";

    var uploader = $scope.uploader = new FileUploader({
        url: '/api/storage',
        queueLimit:1,
        autoUpload:true,
        //headers: { 'Authorization': 'Bearer ' + $window['localStorage'].satellizer_token },
    });
    // FILTERS
    uploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 10;
        }
    });
    // CALLBACKS
    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
        SweetAlert.swal("Error uploading file", "Please remove your previous file first", "warning");
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $scope.model.file=response.filename;
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        SweetAlert.swal("Error 401", response.message, "warning");
    };
    $scope.remove = function(){
        $http.delete('/api/storage/'+$scope.model.file)
            .then(function(res){
				if(res.data.message==="error") {
					SweetError("Cannot delete " + $scope.model.type, res.data)
				} else {
					$scope.model.file = null;
				}
            })
            .catch(function(){
                console.error('Error deleting file');
                SweetAlert.swal("Error deleting file", "Please contact the administrator", "warning");
            })
    };
}]);