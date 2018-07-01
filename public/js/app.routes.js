app.config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('home', {
                url:"/",
                templateUrl: "partials/home.html",
                controller: "home"
            })
			.state('search', {
				url:"/search",
				templateUrl: "partials/search.html",
				controller: 'search',
			})
			.state('search/advanced', {
				url:"/search/advanced/:type/:name",
				templateUrl: "partials/search_advanced.html",
				controller: 'search',
				params: {
					type: { squash: true, value: null },
					name: { squash: true, value: null }
				}
			})
			.state('profile', {
				url:"/profile",
				templateUrl: "partials/profile.html",
				controller: 'profile'
			})
			.state('view', {
				url:"/view/:type/:id",
				templateUrl: "partials/view.html",
				controller: 'view'
			})
			.state('manage', {
				url:"/manage",
				templateUrl: "partials/manage.html",
				controller: 'manage'
			})
			.state('manage/list', {
				url:"/manage/:type",
				templateUrl: "partials/manage.html",
				controller: 'manage'
			})
			.state('manage/edit', {
				url:"/manage/:type/:id",
				templateUrl: "partials/manage.html",
				controller: 'manage'
			})
			.state('graph', {
				url:"/graph",
				templateUrl: "partials/graph.html",
				controller: 'graph'
			})
}]);
