/**
 * Created by Antonio Altamura on 01/06/2018.
 */
"use strict";
let app = angular.module("RtR", ['ui.router', 'ngSanitize', 'ngTagsInput', 'ngAnimate', 'angularFileUpload', 'oitozero.ngSweetAlert', 'ui.bootstrap']);


app.run(['$rootScope', '$state', '$timeout',
	function ($rootScope, $state, $timeout) {
		//state name visible in all controllers: $state.current.name
		$rootScope.$state = $state;
	}
]);


/**
 * Exposing Vis.js VisDataSet object in Angular env
 * **/
app.factory('VisDataSet', function () {
	'use strict';
	return function (data, options) {
		return new vis.DataSet(data, options);
	};
});









