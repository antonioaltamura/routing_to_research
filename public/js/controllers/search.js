/**
 * Created by Antonio Altamura on 20/06/2018.
 */
"use strict";

/**
 * Controller for the simple search by name on all entities
 * **/
app.controller('search', ['$scope', '$stateParams', 'api', '$http', function ($scope, $stateParams, api, $http) {

	$scope.q = {}
	console.log("search")
	$scope.search = function () {
		console.log("search")
		api.search($scope.model.q).then(function (res) {
			$scope.results = res.data;
		}, function (e) {
			console.log(e)
		});
	}
	console.log($stateParams)

	$scope.simple = $stateParams
	$scope.params = $stateParams;
	$scope.selectType = function () {
		console.log($scope.q.type)
		api[$scope.q.type].getAll().then(function (res) {
			console.log(res)
			//$scope.results = res.data;
			$scope.list = res.data;
		}, function (e) {
			console.log(e)
		});
	}


	$scope.autocomplete = function (query) {
		return api.autocomplete[$scope.q.type](query)
			.then(function (res) {
				return res.data.map(n => n.name)
			}, function (e) {
				console.log(e)
			});
	}
	$scope.onSelect = function (a, b, c) {
		console.log(a, b, c)
	}

	$scope.search_advanced = function (type, name) {
		//console.log("search_advanced ")
		//console.log($scope.q)
		api.search_advanced($scope.q.type, $scope.q.name).then(function (res) {
			console.log(res)
			$scope.results = res.data;
		}, function (e) {
			console.log(e)
		});
	}
	if ($stateParams.type && $stateParams.name) {
		$scope.q = {type: $stateParams.type}
		$scope.selectType()
		$scope.q.name = $stateParams.name;
		$scope.search_advanced($scope.q.type, $scope.q.name)
	}
}]);