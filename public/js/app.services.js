/**
 * Created by Antonio Altamura on 01/06/2018.
 */
"use strict";
angular.module('RtR')
    .factory("api", ['$http', function ($http) {
    return {
		count: () => $http.get('/api/count'),
		graph: () => $http.get('/api/graph'),
		search: (q) =>$http({
			url: '/api/search',
			method: "GET",
			params: {q:q}
		}),
		search_advanced: (type,name) =>$http({
			url: '/api/search/advanced',
			method: "GET",
			params: {type:type,name:name}
		}),
      autocomplete: {
		  Author: (query) => $http({
			  url: '/api/autocomplete/authors',
			  method: "GET",
			  params: {q:query}
		  }),
		  Journal: (query) => $http({
			  url: '/api/autocomplete/journals',
			  method: "GET",
			  params: {q:query}
		  }),
		  Paper: (query) => $http({
			  url: '/api/autocomplete/papers',
			  method: "GET",
			  params: {q:query}
		  }),
		  Topic: (query) => $http({
			  url: '/api/autocomplete/topics',
			  method: "GET",
			  params: {q:query}
		  }),
		  Book: (query) => $http({
			  url: '/api/autocomplete/books',
			  method: "GET",
			  params: {q:query}
		  })
      },
		Author: {
      		get: (id)  => $http({
				url: '/api/authors/' +id,
				method: "GET"
			}),
			getAll: () => $http({
				url: '/api/authors',
				method: "GET"
			}),
			save: (model) => $http.post('/api/authors', {model:model}),
			delete: (id) => $http.delete('/api/authors/' + id),
		},
		Book: {
			get: (id)  => $http({
				url: '/api/books/' +id,
				method: "GET"
			}),
			getAll: () => $http({
				url: '/api/books',
				method: "GET"
			}),
			save: (model) => $http.post('/api/books', {model:model}),
			delete: (id) => $http.delete('/api/books/' + id)
		},
		Journal: {
			get: (id)  => $http({
				url: '/api/journals/' +id,
				method: "GET"
			}),
			getAll: () => $http({
				url: '/api/journals',
				method: "GET"
			}),
			save: (model) => $http.post('/api/journals', {model:model}),
			delete: (id) => $http.delete('/api/journals/' + id)

		},
		Paper: {
			get: (id)  => $http({
				url: '/api/papers/' +id,
				method: "GET"
			}),
			getAll: () => $http({
				url: '/api/papers',
				method: "GET"
			}),
			save: (model) => $http.post('/api/papers', {model:model}),
			delete: (id) => $http.delete('/api/papers/' + id)

		},
		Topic: {
			get: (id)  => $http({
				url: '/api/topics/' +id,
				method: "GET"
			}),
			getAll: () => $http({
				url: '/api/topics',
				method: "GET"
			}),
			save: (model) => $http.post('/api/topics', {model:model}),
			delete: (id) => $http.delete('/api/topics/' + id)
		}
    }
}]);

