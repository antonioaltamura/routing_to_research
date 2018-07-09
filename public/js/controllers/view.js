/**
 * Created by Antonio Altamura on 04/06/2018.
 */

/**
 * Controller for the detailed view of an Entity with id $stateParams.id
 * **/
app.controller('view', ['$scope', '$stateParams', 'api', 'SweetAlert', function ($scope, $stateParams, api, SweetAlert) {

	console.log($stateParams);

	let id = $stateParams.id
	let SweetError = (msg, e = {}) => {
		SweetAlert.swal("Error", msg + '\n' + JSON.stringify(e, null, "\t"), "warning");
		console.error(e)
	};
	$scope.loadDoc = function (id) {
		api[$scope.type].get(id).then(function (res) {
			console.log(res)
			//$scope.fields = Object.keys(res.data)
			$scope.model = {...$scope.model, ...res.data}
			$scope.edit_mode = true

		}, function (e) {
			SweetError("error", e)
		});
	};
	$scope.type = $stateParams.type;

	$scope.loadDoc(id);

}]);