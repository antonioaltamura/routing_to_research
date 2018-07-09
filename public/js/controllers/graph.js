/**
 * Created by Antonio Altamura on 04/06/2018.
 */

/**
 * Controller for graph visualization
 * **/
app.controller('graph', ['$scope', '$stateParams', 'api', 'SweetAlert', 'VisDataSet', "$http", function ($scope, $stateParams, api, SweetAlert, VisDataSet, $http) {

	let nodes = [];
	let edges = [];
	let node_ids = [];

	//actual vis data source
	$scope.data = {};

	$scope.visibility = {
		"Author": false,
		"Topic": false,
		"Book": false,
		"Paper": false,
		"Journal": false
	}
	$scope.toggleNode = function (type) {
		$scope.visibility[type] = !$scope.visibility[type]
		$scope.data.nodes.get().forEach(e => {
			if (e.type === type) $scope.data.nodes.update({id: e.id, hidden: $scope.visibility[type]})
		});

	}
	$scope.getAuthors = function () {
		api.Author.getAll().then(function (res) {
			$scope.authors = res.data
		})
	}
	$scope.autocomplete = function (query) {
		return api.autocomplete.Author(query)
			.then(function (res) {
				return res.data.map(n => n.name)
			}, function (e) {
				console.log(e)
			});
	}

	$scope.distanceShown = false;
	$scope.shortestPath = function () {
		if ($scope.author1 && $scope.author2) {
			$http.get('/api/graph/shortestPath', {params: {author1: $scope.author1, author2: $scope.author2}})
				.then(function (res) {
					$scope.data.edges.get().forEach(e => {
						$scope.data.edges.update({id: e.id, color: null, width: null})
					});

					if (res.data.length) {
						res.data.forEach(triple => {
							//console.log($scope.data.edges.get(triple[1].id))
							let id = triple[1].id
							let edge = $scope.data.edges.get(id)
							$scope.data.edges.update({id: triple[1].id, color: {color: '#ff383f'}, width: 5})
							console.log(triple[1].name)
						})
						$scope.distanceShown = true;
						$scope.distance = res.data.length / 2;
					}
				})
				.catch(function (e) {
					console.error(e)
				});
		} else {
			console.log("error authors on shortestPath")
		}
	}

	$scope.palette = {
		"Author": "#183070",
		"Topic": "#2bbe49",
		"Book": "#e1645b",
		"Paper": "#e1b836",
		"Journal": "#39e1e1",

	}
	let ellipsis = function (str, limit = 15) {
		return str.length > limit ? str.slice(0, limit) + "..." : str
	}
	api.graph().then(function (res) {
		if (res.data.length) {
			res.data.forEach(t => {
				let n1 = {
					id: t[0].id,
					label: ellipsis(t[0].name),
					fullLabel: t[0].name,
					color: $scope.palette[t[0].type],
					type: t[0].type
				}
				let n2 = {
					id: t[2].id,
					label: ellipsis(t[2].name),
					fullLabel: t[2].name,
					color: $scope.palette[t[2].type],
					type: t[2].type
				}
				let r = {id: t[1].id, from: n1.id, to: n2.id, label: t[1].type, font: {align: 'middle'}}

				if (!~node_ids.indexOf(n1.id)) {
					node_ids.push(n1.id)
					nodes.push(n1)
				}
				if (!~node_ids.indexOf(n2.id)) {
					node_ids.push(n2.id)
					nodes.push(n2)
				}
				edges.push(r)
			});

			$scope.nodes = nodes;
			$scope.edges = edges;
			$scope.data = {
				nodes: VisDataSet($scope.nodes),
				edges: VisDataSet($scope.edges)

			};

		}
	}, function (e) {
		alert("error")
	});

	//graph config
	$scope.options = {
		nodes: {
			font: {
				size: 10
			},
			shape: 'dot',
			size: 15,
			scaling: {
				label: {
					enabled: false
				}
			}
		},
		edges: {
			length: 150,
			font: {
				size: 10
			},
			arrows: {
				to: {enabled: true, scaleFactor: 1, type: 'arrow'}
			}
		},
		physics: {
			solver: 'forceAtlas2Based',
			enabled: true,
			forceAtlas2Based: {
				gravitationalConstant: -50,
				centralGravity: 0.01,
				springConstant: 0.08,
				springLength: 50,
				damping: 0.8,
				avoidOverlap: 0
			},
			maxVelocity: 50,
			minVelocity: 0.1,

		},
		layout: {
			improvedLayout: false
		}
	};

	//graph event handlers
	$scope.$on('clickNode', function (event, ids) {
		console.log("click", ids[0])
		console.log($scope.data.nodes.get(ids[0]).label);
		$scope.active_node = $scope.data.nodes.get(ids[0]).fullLabel;
		$scope.$apply()

	});
	$scope.$on('clickStage', function (event, ids) {
		console.log("clickstage")
		$scope.active_node = null;
		$scope.$apply()
	});


}]);