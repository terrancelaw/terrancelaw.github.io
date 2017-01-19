var FlowFactory = {
	margin: { top: 10, left: 30, bottom: 10, right: 30 },

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
			.style("alignment-baseline", "central");

		d3.select("#flow-view .ui-menu-bar .control")
			.append("text")
			.text("Merge and Split")
			.attr("id", "merge-split-button")
			.attr("class", "button selected")
			.attr("x", 70)
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
			.attr("x", 155)
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
			.attr("x", 205)
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
				d3.select("#chart").attr("height", self.svgHeight);
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
                    	return SecondLayer.mergeNSplitColour;

	                if (source.target.length > 1) // split
	                    return SecondLayer.splitColour;

	                if (target.source.length > 1) // merge
	                    return SecondLayer.mergeColour;
	                  
	                return SecondLayer.normalColour;
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
	createFlow: function(name) {
		var self = this;

		var className = name.substring(0, name.indexOf("@"));
		className = className.split('.').join('-');

		var flow = self.svgGroup.append("g")
								.attr("class", "flow " + className)
								.attr("email", name);
		var flowWidth = self.canvasWidth - self.margin.left - self.margin.right;
		var flowHeight = self.canvasHeight - self.margin.top - self.margin.bottom;

		// data preprocessing
		var clustersAtEachTimeStep = self.returnClustersAtEachTimeStep(Database.clusterDict[name]);
		var numberOfClustersAtEachTimeStep = self.returnNumberOfClustersAtEachTimeStep(clustersAtEachTimeStep);
		var clusterArray = self.reorderNodes(clustersAtEachTimeStep, Database.clusterDict[name]);

		// draw the three layers
		BarCharts.create(flow, flowWidth, flowHeight, Database.attributeDict[name]); // (max width of stream is half of flowWidth)
		FirstLayer.create(flow, flowWidth, flowHeight, Database.networkDict[name], numberOfClustersAtEachTimeStep);
		SecondLayer.create(flow, flowWidth, flowHeight, Database.networkDict[name], clusterArray, name.substring(0, name.indexOf("@")));

		// translate to juxtapose the flow groups
		flowGroupBBHeight = flow.node().getBBox().height;
		flow.attr("transform", "translate(0," + self.nextY_zoom + ")");
		self.nextY_zoom += flowGroupBBHeight + 50; // 50 is the padding

		// change size of svg depending on the number of flow
		d3.select("#chart")
			.attr("height", (self.nextY_zoom + 50) / self.zoomFactor);
	},
	removeFlow: function(name) {
		var self = this;

		var className = name.substring(0, name.indexOf("@"));
		className = className.split('.').join('-');

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
		var svg = d3.select("#flow-view .ui-menu-bar .control");

		svg.append("text").attr("x", 270).attr("y", 10).style("alignment-baseline", "middle").text("Legend:");

		svg.append("circle").attr("class", "legend CEO").attr("cx", 320).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[0]).style("stroke", "black");
		svg.append("text").attr("class", "legend CEO").attr("x", 330).attr("y", 10).style("alignment-baseline", "middle").text("CEO")

		svg.append("circle").attr("class", "legend President").attr("cx", 370).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[1]).style("stroke", "black");
		svg.append("text").attr("class", "legend President").attr("x", 380).attr("y", 10).style("alignment-baseline", "middle").text("President");

		svg.append("circle").attr("class", "legend Vice-President").attr("cx", 440).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[2]).style("stroke", "black");
		svg.append("text").attr("class", "legend Vice-President").attr("x", 450).attr("y", 10).style("alignment-baseline", "middle").text("Vice President");

		svg.append("circle").attr("class", "legend Director Managing-Director").attr("cx", 530).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[3]).style("stroke", "black");
		svg.append("text").attr("class", "legend Director").attr("x", 540).attr("y", 10).style("alignment-baseline", "middle").text("Director");
		svg.append("text").attr("class", "legend").attr("x", 575).attr("y", 10).style("alignment-baseline", "middle").text("/");
		svg.append("text").attr("class", "legend Managing-Director").attr("x", 580).attr("y", 10).style("alignment-baseline", "middle").text("Managing Director");

		svg.append("circle").attr("class", "legend Manager").attr("cx", 680).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[5]).style("stroke", "black");
		svg.append("text").attr("class", "legend Manager").attr("x", 690).attr("y", 10).style("alignment-baseline", "middle").text("Manager");

		svg.append("circle").attr("class", "legend In-House-Lawyer Trader Employee").attr("cx", 750).attr("cy", 10).attr("r", 5).style("fill", Database.positionColours[6]).style("stroke", "black");
		svg.append("text").attr("class", "legend In-House-Lawyer").attr("x", 760).attr("y", 10).style("alignment-baseline", "middle").text("In House Lawyer");
		svg.append("text").attr("class", "legend").attr("x", 835).attr("y", 10).style("alignment-baseline", "middle").text("/");
		svg.append("text").attr("class", "legend Trader").attr("x", 840).attr("y", 10).style("alignment-baseline", "middle").text("Trader");
		svg.append("text").attr("class", "legend").attr("x", 869).attr("y", 10).style("alignment-baseline", "middle").text("/");
		svg.append("text").attr("class", "legend Employee").attr("x", 875).attr("y", 10).style("alignment-baseline", "middle").text("Employee");
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