/**
 * Created by Antonio Altamura on 04/06/2018.
 */

/**
 * Controller for the home page (including Hightchart graph)
 * **/
app.controller('home', ['$scope', '$stateParams', 'api', function ($scope, $stateParams, api) {

	api.count().then(function (res) {
		$scope.count = res.data;
		let g = Object.entries(res.data)
		let labels = ["Author", "Paper", "Journal", "Book", "Topic"];
		let data = labels.map(label => res.data[label])
		Highcharts.chart('home-graph-container', {
			chart: {
				backgroundColor: 'rgba(255, 255, 255, 0.0)',
				type: 'area',
				 marginBottom: 50
			},
			legend: {
				enabled: false
			},
			title: {
				text: ''
			},
			xAxis: {
			visible: false,
			categories: labels
			},
			yAxis: {
				title: "",
				labels: {
					enabled: true
				},
				gridLineColor: '#173558'

			},
			plotOptions: {
				areaspline: {
					fillOpacity: 0.3
				}
			},
			series: [{
				fillColor: {
					linearGradient: [0, 0, 0, 300],
					stops: [
						[0, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.5).get('rgba')],
						[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.1).get('rgba')]
					]
				},
				color: '#fff',
				data: data
			}],
			credits: {
				enabled: false
			},
		});

	}, function (e) {
		console.log(e)
	});


}]);