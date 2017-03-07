var FlowFactory = {
	margin: { top: 10, left: 25, bottom: 10, right: 25 },

	// dimension of the canvas for drawing the flows
	canvasWidth: 3300,
	canvasHeight: 300,

	// dimensions of the whole flow view (including the timeline)
	svgWidth: null,
	svgHeight: null,

	svgGroup: null,

	nextY_zoom: 0,
	zoomFactor: 0,

	// for allowing users to adjust the vertical scale
	maxPossibleSize: 0,

	init: function() {
		var self = this;

		self.svgWidth = flowViewSvgWidth;
		self.svgHeight = flowSvgHeight + timelineSvgHeight;

		self.zoomFactor  = (self.canvasWidth - self.margin.left - self.margin.right) / (self.svgWidth - self.margin.left - self.margin.right);
		var inverseFactor = 1 / self.zoomFactor;
		var transformStr = "translate(" + self.margin.left + "," + self.margin.top + ")" +
							"scale(" + inverseFactor + ", " + inverseFactor + ")";
		self.svgGroup = d3.select("#chart")
			.append("g")
			.attr("id", "all-flows")
			.attr("transform", transformStr);

		self.initButtonBehavior();
		self.initDropDownMenu();
		self.createLegend();
	},
	initButtonBehavior: function() {
		var self = this;

		// create color encoding control
		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Link color:")
			.attr("x", 10)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("font-weight", "bold")
			.style("font-size", 12);

		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Merge and Split")
			.attr("id", "merge-split-button")
			.attr("class", "button selected")
			.attr("x", 80)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", onClickMergeSplitButton);

		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Stability")
			.attr("id", "stable-button")
			.attr("class", "button")
			.attr("x", 160)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", onClickStabilityButton);

		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Density")
			.attr("id", "density-button")
			.attr("class", "button")
			.attr("x", 210)
			.attr("y", 10)
			.style("text-anchor", "start")
			.style("alignment-baseline", "central")
			.style("cursor", "pointer")
			.on("click", onClickDensityButton);

		$("#remove")
			.click(function() {
				// clear all flows
				d3.selectAll(".flow").remove();

				// restore original size of svg
				d3.select("#chart").attr("height", flowSvgHeight - 10);
				self.nextY_zoom = 0;

				// remove the row highlights
				d3.selectAll(".row.selected")
					.classed("selected", false);
			});

		function onClickMergeSplitButton() {
			if (!d3.select(this).classed("selected")) {
				d3.select(this).classed("selected", true);
				d3.select("#stable-button").classed("selected", false);
				d3.select("#density-button").classed("selected", false);

				// recolour the links
				d3.selectAll(".link").style("fill", function(d) {
	                var source = d[0];
	                var target = d[2];

                	if (source.target.length > 1 && target.source.length > 1) // split and merge
                    	return FlowVis.mergeNSplitColour;

	                if (source.target.length > 1) // split
	                    return FlowVis.splitColour;

	                if (target.source.length > 1) // merge
	                    return FlowVis.mergeColour;
	                  
	                return FlowVis.normalColour;
				});

				// recolour the clusters
				d3.selectAll(".cluster").style("fill", "white");
			}
		}

		function onClickStabilityButton() {
			if (!d3.select(this).classed("selected")) {
				d3.select(this).classed("selected", true);
				d3.select("#merge-split-button").classed("selected", false);
				d3.select("#density-button").classed("selected", false);

				// recolour the links
				d3.selectAll(".link").style("fill", function(d) {
	                var source = d[0];
	                var target = d[2];
	                var name = d3.select(this).attr("name");

                	return "url(#" + name + "-stability-gradient-" + source.timeStep + "-" + target.timeStep + ")";
				});

				// recolour the clusters
				d3.selectAll(".cluster").style("fill", function(d) {
					return d.stabilityColour;
				});
			}
		}

		function onClickDensityButton() {
			if (!d3.select(this).classed("selected")) {
				d3.select(this).classed("selected", true);
				d3.select("#merge-split-button").classed("selected", false);
				d3.select("#stable-button").classed("selected", false);

				// recolour the links
				d3.selectAll(".link").style("fill", function(d) {
	                var source = d[0];
	                var target = d[2];
	                var name = d3.select(this).attr("name");

                	return "url(#" + name + "-density-gradient-" + source.timeStep + "-" + target.timeStep + ")";
				});

				// recolour the clusters
				d3.selectAll(".cluster").style("fill", function(d) {
					return d.densityColour;
				});
			}
		}
	},
	initDropDownMenu: function() {
		var self = this;

		var menuItems = Object.keys(Database.attribute2DataDict);
		menuItems.unshift("None");

		for (var i = 0; i < menuItems.length; i++) {
			$("#timeseries-menu select").append($('<option>', {
			    value: menuItems[i],
			    text: menuItems[i]
			}));
		}

		$("#timeseries-menu select").change(onChangeTimeSeriesMenu);

		// change the flows to time series
		function onChangeTimeSeriesMenu() {
			var attributeName = $(this).val();
			var emailListToBeRendered = [];

			// get the list of emails
			self.svgGroup.selectAll(".flow")
				.each(function() {
					emailListToBeRendered.push(d3.select(this).attr("email"));
				});

			// remove all flows
			self.svgGroup.selectAll(".flow").remove();
			self.nextY_zoom = 0;

			// restore flow
			if (attributeName == "None") {
				for (var i = 0; i < emailListToBeRendered.length; i++) {
					self.createFlow(emailListToBeRendered[i]);
				}
			}

			// create time series area chart
			else {
				for (var i = 0; i < emailListToBeRendered.length; i++) {
					var name = emailListToBeRendered[i];
					var className = name.split('.').join('-');

					var flow = self.svgGroup.append("g")
									.attr("class", "flow " + className)
									.attr("email", name);
					var flowWidth = self.canvasWidth - self.margin.left - self.margin.right;
					var flowHeight = self.canvasHeight - self.margin.top - self.margin.bottom;

					// draw
					TimeSeriesAreaCharts.create(flow, flowWidth, flowHeight / 2, Database.attribute2DataDict[attributeName][name]);
					self.createLabels(flow, flowWidth, TimeSeriesAreaCharts.height + 20, name);

					// translate to juxtapose the flow groups
					flowGroupBBHeight = flow.node().getBBox().height;
					flow.attr("transform", "translate(0," + self.nextY_zoom + ")");
					self.nextY_zoom += flowGroupBBHeight + 50; // 80 is the padding

					// change size of svg depending on the number of flow
					d3.select("#chart")
						.attr("height", (self.nextY_zoom + 50) / self.zoomFactor);
				}
			}
		}
	},
	createFlow: function(name) {
		var self = this;

		var className = name.split('.').join('-');

		var flow = self.svgGroup.append("g")
								.attr("class", "flow " + className)
								.attr("email", name);
		var flowWidth = self.canvasWidth - self.margin.left - self.margin.right;
		var flowHeight = self.canvasHeight - self.margin.top - self.margin.bottom;

		if ($("#timeseries-menu select").val() == "None") {
			// data preprocessing
			var clustersAtEachTimeStep = self.returnClustersAtEachTimeStep(Database.clusterDict[name]);
			var numberOfClustersAtEachTimeStep = self.returnNumberOfClustersAtEachTimeStep(clustersAtEachTimeStep);
			var clusterArray = self.reorderNodes(clustersAtEachTimeStep, Database.clusterDict[name]);

			// draw the three layers
			BarCharts.create(flow, flowWidth, flowHeight, Database.attributeDict[name]); // (max width of stream is half of flowWidth)
			FlowVis.create(flow, flowWidth, flowHeight, Database.networkDict[name], clusterArray, numberOfClustersAtEachTimeStep, name);
			self.createLabels(flow, flowWidth, BarCharts.height + FlowVis.height + 20 + 20, name); // extra 20 is padding between bar and flow
		}
		else {
			// get attribute name
			var attributeName = $("#timeseries-menu select").val();

			// draw area chart
			TimeSeriesAreaCharts.create(flow, flowWidth, flowHeight / 2, Database.attribute2DataDict[attributeName][name]);
			self.createLabels(flow, flowWidth, TimeSeriesAreaCharts.height + 20, name);
		}

		// translate to juxtapose the flow groups
		flowGroupBBHeight = flow.node().getBBox().height;
		flow.attr("transform", "translate(0," + self.nextY_zoom + ")");
		self.nextY_zoom += flowGroupBBHeight + 50; // 80 is the padding

		// change size of svg depending on the number of flow
		d3.select("#chart")
			.attr("height", (self.nextY_zoom + 50) / self.zoomFactor);
	},
	createLabels: function(svg, width, yTranslate, name) {
		// create dummy data for tick rendering
		var data = [];
		for (var i = 0; i < Database.numberOfTimeSteps; i++)
			data.push(i);

		// scale
		var xScale = d3.scale.linear()
			.domain(d3.extent(data))
			.range([0, width])

		// create tick marks
		var tickHeight = 10;

  		var tickGroup = svg.append("g")
			.attr("class", "tick-Group");
  		var tick = tickGroup.selectAll("g")
			.data(data)
			.enter()
			.append("g");

		tick.append("line")
			.attr("x1", function(d, i) {
				return xScale(i);
			})
			.attr("x2", function(d, i) {
				return xScale(i);
			})
			.attr("y1", yTranslate)
			.attr("y2", yTranslate + tickHeight)
			.attr("stroke", "black")
			.attr("stroke-width", "1px");

		// create name label
		svg.append("text")
  			.attr("class", "name-label")
			.text(name + " (" + Database.employeeDict[name] + ")")
			.attr("x", 0)
			.attr("y", yTranslate + 40)
			.style("text-anchor", "start")
			.style("font-size", 40);
	},
	removeFlow: function(name) {
		var self = this;

		className = name.split('.').join('-');

		// compute bounding box height of the flow and remove from nextY_zoom
		var bboxHeight = self.svgGroup.select(".flow." + className).node().getBBox().height;
		self.nextY_zoom -= bboxHeight + 20;

		// restore height of svg
		d3.select("#chart")
			.attr("height", (self.nextY_zoom + 50) / self.zoomFactor);

		// remove the corresponding flow and shift the ones below up
		var removedFlowTranslateY = d3.transform(self.svgGroup.select(".flow." + className).attr("transform"));
		removedFlowTranslateY = removedFlowTranslateY.translate[1];

		self.svgGroup.select(".flow." + className).remove();

		self.svgGroup.selectAll(".flow")
			.each(function() {
				var currentTranslateY = d3.transform(d3.select(this).attr("transform")).translate[1];

				if (currentTranslateY > removedFlowTranslateY) {
					currentTranslateY -= bboxHeight + 20;
					d3.select(this)
						.transition()
						.attr("transform", "translate(0, " + currentTranslateY + ")")
				}
			});
	},
	createLegend: function() {
		var self = this;
		var svg = d3.select("#flow-view .ui-menu-bar .control");

		svg.append("text").attr("x", 260).attr("y", 10).style("alignment-baseline", "central").text("Legend:").style("font-weight", "bold").style("font-size", 12);

		svg.append("circle").attr("class", "legend CEO").attr("cx", 320).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[0]).style("stroke", "black");
		svg.append("text").attr("class", "legend position-text CEO").attr("x", 330).attr("y", 10).style("alignment-baseline", "central").text("CEO")

		svg.append("circle").attr("class", "legend President").attr("cx", 370).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[1]).style("stroke", "black");
		svg.append("text").attr("class", "legend position-text President").attr("x", 380).attr("y", 10).style("alignment-baseline", "central").text("President");

		svg.append("circle").attr("class", "legend Vice-President").attr("cx", 440).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[2]).style("stroke", "black");
		svg.append("text").attr("class", "legend position-text Vice-President").attr("x", 450).attr("y", 10).style("alignment-baseline", "central").text("Vice President");

		svg.append("circle").attr("class", "legend Director Managing-Director").attr("cx", 530).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[3]).style("stroke", "black");
		svg.append("text").attr("class", "legend position-text Director").attr("x", 540).attr("y", 10).style("alignment-baseline", "central").text("Director");
		svg.append("text").attr("class", "legend").attr("x", 575).attr("y", 10).style("alignment-baseline", "central").text("/");
		svg.append("text").attr("class", "legend position-text Managing-Director").attr("x", 580).attr("y", 10).style("alignment-baseline", "central").text("Managing Director");

		svg.append("circle").attr("class", "legend Manager").attr("cx", 680).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[5]).style("stroke", "black");
		svg.append("text").attr("class", "legend position-text Manager").attr("x", 690).attr("y", 10).style("alignment-baseline", "central").text("Manager");

		svg.append("circle").attr("class", "legend In-House-Lawyer Trader Employee").attr("cx", 746).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[6]).style("stroke", "black");
		svg.append("text").attr("class", "legend position-text In-House-Lawyer").attr("x", 756).attr("y", 10).style("alignment-baseline", "central").text("In House Lawyer");
		svg.append("text").attr("class", "legend").attr("x", 831).attr("y", 10).style("alignment-baseline", "central").text("/");
		svg.append("text").attr("class", "legend position-text Trader").attr("x", 836).attr("y", 10).style("alignment-baseline", "central").text("Trader");
		svg.append("text").attr("class", "legend").attr("x", 865).attr("y", 10).style("alignment-baseline", "middle").text("/");
		svg.append("text").attr("class", "legend position-text Employee").attr("x", 871).attr("y", 10).style("alignment-baseline", "central").text("Employee");

		svg.selectAll("text.position-text")
			.style("cursor", "pointer")
			.on("mouseover", onMouseOverLegend)
			.on("mouseout", onMouseOutLegend);

		function onMouseOverLegend() {
			var className = d3.select(this).text().split(" ").join("-");

			// highlight text
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("circle")
				.style("opacity", 0.1);
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("text.legend")
				.style("opacity", 0.1);

			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("circle." + className)
				.style("opacity", 1);
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("text." + className)
				.style("opacity", 1);

			// highlight bar
			self.svgGroup.selectAll("rect.bar")
				.style("opacity", 0.1);
			self.svgGroup.selectAll("rect.bar." + className)
				.style("opacity", 1);
		}

		function onMouseOutLegend() {
			// remove hightlight
			self.svgGroup.selectAll("rect.bar")
				.style("opacity", 1);

			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("circle")
				.style("opacity", 1);
			d3.select("#flow-view .ui-menu-bar .control")
				.selectAll("text.legend")
				.style("opacity", 1);
		}
	},
	returnClustersAtEachTimeStep: function(rawClusterData) { // for creating the second layer
		var self = this;

		// reorder nodes in id order
		rawClusterData.sort(function(a, b){ return d3.ascending(a.id, b.id); });

		// convert id to index so that you can do rawClusterData[ID], id same as index
		self.convertID2Index(rawClusterData);

		// create an array of clusters at each time step
		var clustersAtEachTimeStep = d3.nest()
			.key(function(d) {
				return d.date;
			})
			.map(rawClusterData);

		// fill in the gaps in the dictionary
		var totalNumberOfTimeStep = Database.numberOfTimeSteps;
		var firstTimeStep = Database.networkDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.networkDict[Database.emailList[0]][totalNumberOfTimeStep - 1].date;
		var parseDate = d3.time.format("%Y-%m").parse;
		var currentDate = parseDate(firstTimeStep);
		var lastDate = parseDate(lastTimeStep);

		while (currentDate <= lastDate) {
			var year = currentDate.getYear() + 1900;
			var month = currentDate.getMonth() + 1;

			if (month < 10)
				month = "0" + month.toString();
			else
				month = month.toString();

			var currentDateString = year + "-" + month;

			if (!(currentDateString in clustersAtEachTimeStep))
				clustersAtEachTimeStep[currentDateString] = [];

			currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
		}

		return clustersAtEachTimeStep;
	},
	returnNumberOfClustersAtEachTimeStep: function(clustersAtEachTimeStep) { // for creating the first layer
		var numberOfClustersAtEachTimeStep = [];

		var totalNumberOfTimeStep = Database.numberOfTimeSteps;
		var firstTimeStep = Database.networkDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.networkDict[Database.emailList[0]][totalNumberOfTimeStep - 1].date;
		var parseDate = d3.time.format("%Y-%m").parse;
		var currentDate = parseDate(firstTimeStep);
		var lastDate = parseDate(lastTimeStep);

		while (currentDate <= lastDate) {
			var year = currentDate.getYear() + 1900;
			var month = currentDate.getMonth() + 1;

			if (month < 10)
				month = "0" + month.toString();
			else
				month = month.toString();

			var currentDateString = year + "-" + month;

			numberOfClustersAtEachTimeStep.push(clustersAtEachTimeStep[currentDateString].length);

			currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
		}

		return numberOfClustersAtEachTimeStep;
	},
	convertID2Index: function(rawClusterData) {
		// create an id to index dictionary
		var id2Index = {};
		for (var i = 0; i < rawClusterData.length; i++)
			id2Index[rawClusterData[i].id] = i;

		// convert id to index
		for (var i = 0; i < rawClusterData.length; i++) {
			rawClusterData[i].id = i;

			// change id in source and target array
			for (var j = 0; j < rawClusterData[i].source.length; j++)
				rawClusterData[i].source[j] = id2Index[rawClusterData[i].source[j]];
			for (var j = 0; j < rawClusterData[i].target.length; j++)
				rawClusterData[i].target[j] = id2Index[rawClusterData[i].target[j]];
		}
	},
	reorderNodes: function(clustersAtEachTimeStep, rawClusterData) { // reorder clusters to reduce edge crossing
		var reorderedClustersArray = [];
		var unorderedClustersArray = [];

		// put the object into an array for easier processing
		var numOfTimeSteps = Object.keys(clustersAtEachTimeStep).length;
		var firstTimeStep = Database.networkDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.networkDict[Database.emailList[0]][numOfTimeSteps - 1].date;

		var parseDate = d3.time.format("%Y-%m").parse;
		var lastDate = parseDate(lastTimeStep);
		var currentDate = parseDate(firstTimeStep);

		while (currentDate <= lastDate) {
			// construct currentDate string
			var year = currentDate.getYear() + 1900;
			var month = currentDate.getMonth() + 1;

			if (month < 10)
				month = "0" + month.toString();
			else
				month = month.toString();

			var currentDateString = year + "-" + month;

			unorderedClustersArray.push(clustersAtEachTimeStep[currentDateString]);

			currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
		}


		// not reordering clusters in the first time step
		reorderedClustersArray.push(unorderedClustersArray[0]);

		// reordering from the second timestep onwards
		for (var t = 1; t < numOfTimeSteps; t++) {
			reorderedClustersArray.push([])
            var clustersAdded = [];
            var targetsOfClustersAtT = [];

            // add the communities according to the ordering at the previous time
            var numOfClustersAtTM1 = reorderedClustersArray[t - 1].length;
            for (var i = 0; i < numOfClustersAtTM1; i++) {
            	var numberOfTargets = reorderedClustersArray[t - 1][i].target.length;

            	for (var j = 0; j < numberOfTargets; j++) {
            		var targetIndex = reorderedClustersArray[t - 1][i].target[j];
            		var targetsOfTarget = rawClusterData[targetIndex].target.toString();

            		if ($.inArray(targetIndex, clustersAdded) == -1) {
            			reorderedClustersArray[t].push(rawClusterData[targetIndex]);
            			clustersAdded.push(targetIndex);
            			targetsOfClustersAtT.push(targetsOfTarget);
            		}
            	}
            }

            // 1. add clusters without source to the front of reordered array
            // 2. if its target is the same as some clusters, put them together
            if (reorderedClustersArray[t].length != unorderedClustersArray[t].length) {
            	var numOfClustersAtT = unorderedClustersArray[t].length;

            	for (var i = 0; i < numOfClustersAtT; i++) {
            		var clusterID = unorderedClustersArray[t][i].id;
            		if ($.inArray(clusterID, clustersAdded) == -1) {
            			var targetsOfClusterToBeAdded = rawClusterData[clusterID].target.toString();
            			var foundIndex;

            			// check if there exists some clusters at T with the same target set
            			if (targetsOfClusterToBeAdded == "")
            				foundIndex = -1;
            			else
            				foundIndex = $.inArray(targetsOfClusterToBeAdded, targetsOfClustersAtT);

            			// insert the reordered array
            			if (foundIndex != -1) {
            				reorderedClustersArray[t].splice(foundIndex, 0, rawClusterData[clusterID]);
            				targetsOfClustersAtT.splice(foundIndex, 0, targetsOfClusterToBeAdded);
            			}
            			else {
            				reorderedClustersArray[t].unshift(rawClusterData[clusterID]);
            				targetsOfClustersAtT.unshift(targetsOfClusterToBeAdded);
            			}

            			clustersAdded.push(clusterID);
            		}
            	}
            }
		}

		return reorderedClustersArray;
	}
}