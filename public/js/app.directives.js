/************Form directives************/
app.directive('notes', function () {
	return {
		restrict: "E",
		template: `<div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea rows="3" cols="80" class="form-control" ng-model="model.notes" placeholder="Notes"></textarea>
                    </div>
                </div>
            </div>`
	};
});

app.directive('topics', function () {
	return {
		restrict: "E",
		template: `<div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label>Topics</label>
                        <tags-input ng-model="model.topics" class="form-control tags-input-form-field"
                                    display-property="name"
                                    key-property="name"
                                    add-on-paste="true"
                                    onInvalidTag="{alert('1')}"
                                    replace-spaces-with-dashes="false"
                                    placeholder="Add a topic"
                        >
                            <auto-complete  min-length="1" source="autocomplete.Topic($query)"></auto-complete>
                        </tags-input>
                    </div>
                </div>
            </div>`
	};
});


app.directive('fileUpload', function () {
	return {
		restrict: "E",
		template: `<div ng-controller="fileUploadController" nv-file-drop="" uploader="uploader"
                 filters="queueLimit, customFilter">

                <div class="row">
                    <div class="col-md-12">

                        <div ng-show="uploader.isHTML5">
                            <div class="well drop-zone" nv-file-over="" uploader="uploader">
                                <span ng-show="model.file">
                                    <i class="now-ui-icons emoticons_satisfied checkFileOk"></i> Well done! Drop another file if you want to replace this.
                                </span>
                                <span ng-show="!model.file">
                                    Drop a file here or use the browse button
                                </span>
                            </div>
                        </div>

                        <input type="file" nv-file-select="" uploader="uploader"/><br>


                    </div>
                    <div class="col-md-12">
                        <br>
                        <input type="text" class="form-control" ng-model="model.file" disabled>
                    </div>
                    <div class="col-md-12" ng-show="uploader.queue.length>0">
                        <table class="table">
                            <thead>
                            <tr>
                                <th width="50%">Name</th>
                                <th ng-show="uploader.isHTML5">Size</th>
                                <th ng-show="uploader.isHTML5">Progress</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr ng-repeat="item in uploader.queue">
                                <td><strong>{{ item.file.name }}</strong></td>
                                <td ng-show="uploader.isHTML5" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>
                                <td ng-show="uploader.isHTML5">
                                    <div class="progress" style="margin-bottom: 0;">
                                        <div class="progress-bar" role="progressbar"
                                             ng-style="{ 'width': item.progress + '%' }">{{item.progress +'%'}}
                                        </div>
                                    </div>
                                </td>
                                <td class="text-center status-icon">
                                    <span ng-show="item.isSuccess" class="green"><i class="now-ui-icons ui-1_check"></i> </span>
                                    <span ng-show="item.isCancel" class="orange"><i
                                            class="now-ui-icons ui-1_simple-remove"></i></span>
                                    <span ng-show="item.isError" class="red"><i
                                            class="now-ui-icons ui-1_simple-remove"></i></span>
                                </td>
                                <td nowrap>
                                    <button type="button" class="btn btn-danger btn-xs"
                                            ng-click="item.remove();remove()">
                                        <span class="glyphicon glyphicon-trash"></span> Remove
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>`
	};
});
/*******************end form fields*************************/

/*******************Entity cards directives*****************/
app.directive('author', function () {
	return {
		restrict: "E",
		template: ` <div class="card card-nav-tabs text-center">
                <div class="card-header card-header-primary">
                </div>
                <div class="card-body">
					<i class="typeIcon now-ui-icons users_single-02"></i>
                    <h4 class="card-title">{{a.name}}</h4>
                    <a href="#" ui-sref="view({type:'Author',id:a.id})" class="btn btn-primary">View</a>
                </div>
				<div class="card-footer">
						Author
				</div>
            </div>`
	};
});
app.directive('book', function () {
	return {
		restrict: "E",
		template: ` <div class="card card-nav-tabs text-center">
                <div class="card-header card-header-primary">
                </div>
                <div class="card-body">
					<img class="img-fluid" ng-src="/api/storage/thumb/{{a.file}}"/>
                    <h4 class="card-title">{{a.name}}</h4>
                    <p class="card-text">{{a.notes}}</p>
                    <a href="#" ui-sref="view({type:'Book',id:a.id})" class="btn btn-primary">View</a>
                </div>
				<div class="card-footer">
						Book
				</div>
            </div>`
	};
});
app.directive('journal', function () {
	return {
		restrict: "E",
		template: `<div class="card card-nav-tabs text-center">
                <div class="card-header card-header-primary">
                </div>
                <div class="card-body">
					<i class="typeIcon now-ui-icons files_single-copy-04"></i>
                    <h4 class="card-title">{{a.name}}</h4>
                    <p class="card-text">{{a.notes}}</p>
                    <a  ui-sref="view({type:'Journal',id:a.id})" class="btn btn-primary">View</a>
                </div>
				<div class="card-footer">
						Journal
				</div>
            </div>`
	};
});
app.directive('paper', function () {
	return {
		restrict: "E",
		template: `<div class="card card-nav-tabs text-center">
                <div class="card-header card-header-primary">
                </div>
                <div class="card-body">
					<img class="img-fluid" ng-src="/api/storage/thumb/{{a.file}}"/>
                    <h4 class="card-title">{{a.name}}</h4>
                    <p class="card-text">{{a.notes}}</p>
                    <a  ui-sref="view({type:'Paper',id:a.id})" class="btn btn-primary">View</a>
                </div>
				<div class="card-footer">
						Paper
				</div>
        </div>
            </div>`
	};
});
app.directive('topic', function () {
	return {
		restrict: "E",
		template: `<div class="card card-nav-tabs text-center">
                <div class="card-header card-header-primary">
                </div>
                <div class="card-body">
					<i class="typeIcon now-ui-icons business_bulb-63"></i>
                    <h4 class="card-title">{{a.name}}</h4>
                    <a ui-sref="view({type:'Topic',id:a.id})" class="btn btn-primary">View</a>
                </div>
				<div class="card-footer">
						Topic
				</div>
            </div>`,
	};
});
/*******************end Entity cards directives*****************/

/*******************Hightchart directive*****************/
app.directive('hcChart', function () {
	return {
		restrict: 'E',
		template: '<div></div>',
		scope: {
			options: '='
		},
		link: function (scope, element) {

			var chart = Highcharts.chart(element[0], scope.options);

			scope.$watch('options', function (newVal) {
				if (newVal) {
					chart.update(scope.options);
				}
			}, true);
		}
	};
})

/*******************Vis.js directive*****************/
app.directive('visNetwork', function () {
	return {
		restrict: 'EA',
		transclude: false,
		scope: {
			data: '=',
			options: '=',
			events: '='
		},
		link: function (scope, element, attr) {
			let networkEvents = [
				'click',
				'doubleclick',
				'oncontext',
				'hold',
				'release',
				'selectNode',
				'selectEdge',
				'deselectNode',
				'deselectEdge',
				'dragStart',
				'dragging',
				'dragEnd',
				'hoverNode',
				'blurNode',
				'zoom',
				'showPopup',
				'hidePopup',
				'startStabilizing',
				'stabilizationProgress',
				'stabilizationIterationsDone',
				'stabilized',
				'resize',
				'initRedraw',
				'beforeDrawing',
				'afterDrawing',
				'animationFinished'

			];

			let network = null;

			scope.$watch('data', function () {
				// Sanity check
				if (scope.data == null) {
					return;
				}

				// If we've actually changed the data set, then recreate the graph
				// We can always update the data by adding more data to the existing data set
				if (network != null) {
					network.destroy();
				}

				// Create the graph2d object
				network = new vis.Network(element[0], scope.data, scope.options);

				network.on('click', function (properties) {
					if (properties.nodes.length > 0) {
						scope.$emit('clickNode', properties.nodes);
					} else
						scope.$emit('clickStage');
				});
				network.on("doubleClick", function (properties) {
					if (properties.nodes.length > 0) {
						scope.$emit('dbClickNode', properties.nodes);
					}
				});

				// Attach an event handler if defined
				angular.forEach(scope.events, function (callback, event) {
					if (networkEvents.indexOf(String(event)) >= 0) {
						network.on(event, callback);
					}
				});

				// onLoad callback
				if (scope.events != null && scope.events.onload != null &&
					angular.isFunction(scope.events.onload)) {
					scope.events.onload(graph);
				}
			});

			scope.$watchCollection('options', function (options) {
				if (network == null) {
					return;
				}
				network.setOptions(options);
			});
		}
	};
});