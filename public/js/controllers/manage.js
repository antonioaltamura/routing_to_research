
/**
 * Controller for the complete listing of an Entity
 * **/
app.controller('manage', ['$scope', '$stateParams', 'api', 'SweetAlert', "$http", "$timeout", "$filter", '$state', function ($scope, $stateParams, api, SweetAlert, $http, $timeout, $filter, $state) {
	console.log($stateParams)
	$scope.goToSearch = function () {
		console.log("goToSearch")
		$scope.edit_mode = false;
		$state.go("search");
	}

	let SweetError = (msg, e = {}) => {
		SweetAlert.swal("Error", msg + '\n' + JSON.stringify(e, null, "\t"), "warning");
		console.error(e)
	};

	$scope.toggle_edit_mode = function () {
		$scope.edit_mode = !$scope.edit_mode;
	};

	$scope.model = {}

	$scope.autocomplete = {
		Author:api.autocomplete.Author,
		Journal:api.autocomplete.Journal,
		Paper:api.autocomplete.Paper,
		Topic:api.autocomplete.Topic,
		Book:api.autocomplete.Book
	}
	$scope.autocomplete_authors = api.autocomplete.Author;
	$scope.autocomplete_Journal = api.autocomplete.Journal;
	$scope.autocomplete_papers = api.autocomplete.Paper;
	$scope.autocomplete_topics = api.autocomplete.Topic;

	$scope.changeType = function (type) {
		console.log(type)
		$scope.model.type = type;
		$scope.loadData(type)
		$scope.edit_mode = false;
	}
	$scope.edit = function (id) {
		console.log("edit")
		$state.go("manage/edit", {type: $scope.model.type, id: id});
	}
	$scope.goToList = function () {
		console.log("gotolist")
		$scope.edit_mode = false;
		//$state.go("manage/list", {type:$scope.model.type});
		$state.transitionTo("manage/list", {type: $scope.model.type}, {
			reload: true,
			notify: true
		});
	}


	$scope.goToView = function (type, id) {
		$state.go("view", {type: type, id: id});
	}

	//loads a single document
	$scope.loadDoc = function (id) {
		api[$scope.model.type].get(id).then(function (res) {
			console.log(res)
			$scope.model = {...$scope.model, ...res.data}
			console.log($scope.model)

			if ($scope.model.date) $scope.model._date = new Date($scope.model.date.split('/'))
			if ($scope.model.birthdate) $scope.model._birthdate = new Date($scope.model.birthdate.split('/'))

			$scope.edit_mode = true;

		}, function (e) {
			SweetError("error", e)
		});
	}
	$scope.dataHeader = (type) => (
		{
			Author: ["id", "name"],
			Paper: ["id", "name", "date", "doi"],
			Journal: ["id", "name", "date"],
			Topic: ["id", "name"],
			Book: ["id", "name", "date"]
		}[type]
	);

	// loads a list of docuemts
	//in case of data model doesn't have DOI field there will be just an empty column
	$scope.loadData = function (type) {

		api[type].getAll().then(function (res) {
			//console.log(res);
			if (res.data.message === "error") {
				SweetError("Error", res.data)
			} else {
				if (res.data.length) {
					let d = res.data.map(n => {
						delete n.file;
						delete n.authors;
						delete n.topics;
						delete n.abstract;
						return n
					});
					d.sort((a, b) => a.id - b.id);
					$scope.data = d;
				} else {
					$scope.data = [];
				}
			}
		}, function (e) {
			SweetError(e)
		});
	};

	//delete a document
	$scope.delete = function (id) {
		api[$scope.model.type].delete(id).then(function (res) {
			if (res.data.message === "error") {
				SweetError("Cannot delete " + $scope.model.type, res.data)
			} else {
				let count = res.data.data.summary.counters._stats.nodesDeleted
				if (count > 0) {
					SweetAlert.swal("Ok!", $scope.model.type + " has been deleted", "success");
					$scope.loadData($scope.model.type)
				} else {
					SweetError("error", {text: "Cannot match node id!"})
				}
			}
		}, function (e) {
			console.log("delete error", e)
			SweetError("error", e)
		});
	};

	if ($stateParams.type) {
		$scope.model.type = $stateParams.type;

		console.log("controller reload: $stateParams.type", $stateParams)
		if ($stateParams.id) {
			$scope.loadDoc($stateParams.id)
		} else {
			$scope.loadData($scope.model.type)
		}

	}


	$scope.submit = function () {
		console.log($scope.model)
		api[$scope.model.type].save($scope.model).then(function (res) {
			if (res.data.message === "error") {
				SweetError("Cannot save " + $scope.model.type, res.data)
			} else {
				SweetAlert.swal("Ok!", $scope.model.type + " has been saved", "success");


			}
		}, function (e) {
			SweetError(e)
		});
	};

	$scope.validated=true;
	$scope.validate = function(){
		//name validation
		let c = 0; //name has been found?
		api[$scope.model.type].getAll().then(res => {
			res.data.forEach(doc => {
				//console.log(doc)
				if(doc.name === $scope.model.name) {
					//console.log("name is there!")
					c = 1;
				}
			});
			$scope.validated = !c;
		});
	};

	let typingTimer;
	$scope.similarTitles = [];
	$scope.similarTitlesShow = true;

	//check for the phrase similarity on Papers
	$scope.onTitleKeyUp = function () {
		$timeout.cancel(typingTimer);
		typingTimer = $timeout(function () {
			$http.get('/api/papers/titlecheck', {params: {q: $scope.model.name}})
				.then(function (res) {
					console.log(res)

					$scope.similarTitles = res.data.map(n => n.name);
					$scope.similarTitlesShow = true;
				})
				.catch(function (e) {
					console.error(e)
				});

		}, 1000);
	};
	$scope.onTitleKeyDown = function () {
		$timeout.cancel(typingTimer);
	};


	$scope.$watch('model._date', function (newValue) {
		if (newValue) {
			$scope.model.date = $filter('date')(newValue, 'yyyy/MM/dd');
		} else {
			delete $scope.model.date
			//console.log("no _date value")
		}

	});
	$scope.$watch('model._birthdate', function (newValue) {
		if (newValue) {
			$scope.model.birthdate = $filter('date')(newValue, 'yyyy/MM/dd');
		} else {
			delete $scope.model.birthdate
			//console.log("no _birthdate value")
		}

	});

}]);