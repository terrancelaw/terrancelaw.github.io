var FlowVis = {
	svgGroup: null,
	height: null, // height of the whole group

	// colours
	areaColour: "#e5e5e5",

	mostUnstableColour: "#a50026",
	leastUnstableColour: "#abd9e9",

    noEdgesColour: "white",
    completeGraphColour: "black",
    veryDenseGraphColour: "#3f007d",

	mergeColour: "#1f77b4",
	splitColour: "#ff9e4a",
	mergeNSplitColour: "#8b7c6e",
	normalColour: "#999999",

	clusterBorderColour: "#666666",

	// dimension for second layer
	gapBetweenNodes: 10,
	rectWidth: 70,
	clusterWidth: 40,

	// data for second layer
	nodes: [],
	links: [],
	clusterArray: [],

	create: function(svg, width, height, networkData, clusterArray, numberOfClustersAtEachTimeStep, name) {
		var self = this;

		self.createFirstLayer(svg, width, height, networkData, numberOfClustersAtEachTimeStep);
		self.createSecondLayer(svg, width, height, networkData, clusterArray, name);
	},
	createFirstLayer: function(svg, width, height, networkData, numberOfClustersAtEachTimeStep) {
		var self = this;

		self.svgGroup = svg.append("g")
			.attr("class", "flow-vis")
			.attr("cursor", "pointer");
		SelectionHandler.installSelectionBehaviour(self.svgGroup, insertSelection, constructMenu);

		self.createArea(self.svgGroup, width, height, networkData, numberOfClustersAtEachTimeStep);
		self.translateFlow(self.svgGroup, BarCharts.height);
		self.createBackground(self.svgGroup, self.height, width);

		function insertSelection(svgObject, selectionClass, x, y, width, height) {
			d3.select(svgObject)
				.append("rect")
				.attr("class", selectionClass)
				.attr("x", x)
				.attr("y", y)
				.attr("width", width)
				.attr("height", height)
				.style("fill", "gray")
				.style("stroke", "yellow")
				.style("fill-opacity", 0.05);
		}

		function constructMenu() {
			// current selection must exist when it is called (right click or mouse up), no need to check
			var currentSelectionX1 = parseInt(d3.select(".current-selection").attr("x"));
			var currentSelectionX2 = currentSelectionX1 + parseInt(d3.select(".current-selection").attr("width"));
			var totalNumberOfTimePeriods = Database.numberOfTimeSteps - 1;
			var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

			// get first and second time
			var firstTimeStep = Math.ceil(currentSelectionX1 / widthOfOneTimePeriod);
			var secondTimeStep = Math.floor(currentSelectionX2 / widthOfOneTimePeriod);

			var menu = [];
			var menuItems = ["Size", "Number of Clusters", "Stability", "Density"];
			var parameters = {};

			for (var i = 0; i < menuItems.length; i++) {
				var parameters = SelectionHandler.getParametersInCurrentSelection(menuItems[i]);
				
				menu.push({
					title: menuItems[i],
					isInterval: firstTimeStep != secondTimeStep,
					parameters: parameters,
					action: function(title, isInterval, parameters) {
						if (isInterval)
							IntervalEventHandler.createEventEdit(title, parameters);
						else
							TopologicalPointEventHandler.createEventEdit(title, parameters);

						// store the attribute so that upon selection, the widgets change
						var className = d3.select(d3.select(".current-selection").node().parentNode).attr("class");
						SelectionHandler.previousAttribute = title;
						SelectionHandler.previousSelectedSvg = className;
					}
				});
			}

			return menu;
		}
	},
	createArea: function(svg, width, height, networkData, numberOfClustersAtEachTimeStep) {
		var self = this;

		var maxSize = d3.max(networkData, function(d, i) {
			return d.size;
		});
		var xScale = d3.scale.linear()
			.domain([0, networkData.length - 1])
			.range([0, width]);
		var sizeScale = d3.scale.linear()
			.domain([0, maxSize])
			.range([0, height / 2]);

		// create area chart
		var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d, i) { return xScale(i); })
            .y0(function(d, i) {
            	var paddingForClusters = 0;

            	if (numberOfClustersAtEachTimeStep[i] > 0)
            		paddingForClusters = 2 * self.gapBetweenNodes + (numberOfClustersAtEachTimeStep[i] - 1) * self.gapBetweenNodes;

            	return (sizeScale(d.size) + paddingForClusters) / 2; 
            })
            .y1(function(d, i) {
            	var paddingForClusters = 0;

            	if (numberOfClustersAtEachTimeStep[i] > 0)
            		paddingForClusters = 2 * self.gapBetweenNodes + (numberOfClustersAtEachTimeStep[i] - 1) * self.gapBetweenNodes;

            	return (- sizeScale(d.size) - paddingForClusters) / 2;
            });

		var flow = svg.append("path")
			.datum(networkData)
			.attr("class", "area")
			.attr("d", area)
			.attr("fill", self.areaColour);
	},
	translateFlow: function(svg, barChartsHeight) {
		var self = this;
		self.height = svg.node().getBBox().height;

		// translate by bBoxHeight / 2 and height / 2 (for bar charts)
		svg.attr("transform", "translate(0, " + (self.height / 2 + barChartsHeight + 20)+ ")");
	},
	createBackground: function(svg, bbHeight, width) {
		svg.insert("rect", ":first-child")
			.attr("width", width)
			.attr("height", bbHeight)
			.attr("x", 0)
			.attr("y", -bbHeight / 2)
			.style("fill", "white")
			.style("stroke", "none")
			.style("opacity", 0);
	},
	createSecondLayer: function(svg, width, height, networkData, clusterArray, name) {
		var self = this;

		self.createNodeAndLinkArray(width, height, networkData, clusterArray);
		self.createEdges(self.svgGroup, self.links, networkData, name);
        self.createGradients(self.svgGroup, networkData, name);
		self.createClusters(self.svgGroup, self.nodes, self.clusterArray, networkData);
	},
	createNodeAndLinkArray: function(width, height, networkData, clusterArray) {
		var self = this;

		var totalNumberOfTimeStep = Database.networkDict[Database.emailList[0]].length;

		// create a dictionary to change id to index value
        // to ensure souce and target id is the same as index in node (for creating links)
		var id2Index = {};
        var count = 0;
		for (var i = 0; i < clusterArray.length; i++) {
            for (var j = 0; j < clusterArray[i].length; j++) {
                id2Index[clusterArray[i][j].id] = count;
                count++;
            }
		}

		// * create node array
		var nodes = [];
		var xScale = d3.scale.linear()
			.domain([0, totalNumberOfTimeStep - 1])
			.range([0, width]);

    	var maxSize = d3.max(networkData, function(d, i) { return d.size; });
    	var flowSizeScale = d3.scale.linear()
            .domain([0, maxSize])
            .range([0, height / 2]);

        var mostUnstableValue = d3.max(networkData, function(d) {
        	return d.incoming + d.outgoing;
        });
		var colourScale = d3.scale.linear()
            .domain([0, mostUnstableValue])
            .range([self.leastUnstableColour, self.mostUnstableColour]);

        var densityColourScale = d3.scale.linear()
            .domain([0, 1, Database.maxDensityOfAll])
            .range([self.noEdgesColour, self.completeGraphColour, self.veryDenseGraphColour]);

        for (var i = 0; i < clusterArray.length; i++) {
        	var paddingForClusters = 0;
    		var numberOfClusters = clusterArray[i].length;

		    if (numberOfClusters > 0)
		    	paddingForClusters = 2 * self.gapBetweenNodes + (numberOfClusters - 1) * self.gapBetweenNodes;

        	var widthOfFlow = flowSizeScale(networkData[i].size) + paddingForClusters;

        	// should have padding between, top and bottom
        	var widthOfFlowMinusGap = widthOfFlow - (clusterArray[i].length * self.gapBetweenNodes + self.gapBetweenNodes);

        	// sum of sizes of communities
        	var sumOfSizes = 0;
			for (var j = 0; j < clusterArray[i].length; j++)
				sumOfSizes += clusterArray[i][j].size;

			var sizeScale = d3.scale.linear()
				.domain([0, sumOfSizes])
				.range([0, widthOfFlowMinusGap]);

			// create node array for the current time step
			var y = -widthOfFlow / 2; // 0 is the bottom of stream, start the top of the stream
			for (var j = 0; j < clusterArray[i].length; j++) { // loop through all clusters at a time step
				var nodeHeight = sizeScale(clusterArray[i][j].size);
				var id = id2Index[clusterArray[i][j].id];
				var source = clusterArray[i][j].source.map(function(d) {
                    return id2Index[d];
                });
				var target = clusterArray[i][j].target.map(function(d) {
					return id2Index[d];
				});
				var x = xScale(i);
				y += self.gapBetweenNodes + nodeHeight / 2;

				node = {
					timeStep: i,
					stabilityColour: colourScale(networkData[i].incoming + networkData[i].outgoing),
                    densityColour: densityColourScale(networkData[i].density),
					height: nodeHeight,
					id: id,
					target: target,
                    source: source,
					x: x,
					y: y,
				};

				nodes.push(node);
				y += nodeHeight / 2;
			}
        }

		// * create link array
		var links = [];
		for (var i = 0; i < nodes.length; i++) {
			for (var j = 0; j < nodes[i].target.length; j++) {
				var link = {
					source: nodes[i],
					target: nodes[nodes[i].target[j]]
				};

				links.push(link);
			}
		}

		// preparing resources for rendering nodes and links
		self.nodes = nodes;
		self.links = links;
		self.clusterArray = clusterArray;
	},
	createClusters: function(svg, nodes, clusterArray, networkData) {
		var self = this;

		svg.selectAll(".cluster")
			.data(nodes)
			.enter()
			.append("rect")
			.attr("class", "cluster")
            .attr("width", self.clusterWidth)
            .attr("height", function(d) {
                return d.height;
            })
            .attr("x", function(d) { 
                return d.x - self.clusterWidth / 2; 
            })
            .attr("y", function(d) {
                return d.y - d.height / 2;
            })
            .style("fill", function(d) {
            	if (d3.select("#merge-split-button").classed("selected"))
                	return "white";

            	if (d3.select("#stable-button").classed("selected"))
            		return d.stabilityColour;

                if (d3.select("#density-button").classed("selected")) {
                    return d.densityColour;
                }
            })
            .style("stroke", self.clusterBorderColour)
            .style("stroke-width", 2);
	},
    createGradients: function(svg, networkData, name) {
        var self = this;

        // appending the gradients
        var mostUnstableValue = d3.max(networkData, function(d) {
            return d.incoming + d.outgoing;
        });
        var stabilityColourScale = d3.scale.linear()
            .domain([0, mostUnstableValue])
            .range([self.leastUnstableColour, self.mostUnstableColour]);

        var densityColourScale = d3.scale.linear()
            .domain([0, 1, Database.maxDensityOfAll])
            .range([self.noEdgesColour, self.completeGraphColour, self.veryDenseGraphColour]);

        for (var i = 0; i < networkData.length -  1; i++) {
            // append stability gradient
            var gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", name + "-stability-gradient-" + i + "-" + (i + 1))
                .attr("x1", "0%")
                .attr("x2", "100%")
                .attr("y1", "0%")
                .attr("y2", "0%");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", stabilityColourScale(networkData[i].incoming + networkData[i].outgoing));
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", stabilityColourScale(networkData[i + 1].incoming + networkData[i + 1].outgoing));

            // append density gradient
            gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", name + "-density-gradient-" + i + "-" + (i + 1))
                .attr("x1", "0%")
                .attr("x2", "100%")
                .attr("y1", "0%")
                .attr("y2", "0%");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", densityColourScale(networkData[i].density));
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", densityColourScale(networkData[i + 1].density));
        }
    },
	createEdges: function(svg, links, networkData, name) {
		var self = this;

		var areaArray = links.map(function(d) {
            var source1 = $.extend({}, d.source);
            source1.x = source1.x;

            var source2 = $.extend({}, d.source);
            source2.x = source2.x + self.rectWidth / 2;

            var target1 = $.extend({}, d.target);
            target1.x = target1.x - self.rectWidth / 2;

            var target2 = $.extend({}, d.target);
            target2.x = target2.x;

            return [source1, source2, target1, target2];
        });

        // pass an area array to it
        var area = d3.svg.area()
          .x(function(d) { return d.x; })
          .y0(function(d) { return d.y - d.height / 2; })
          .y1(function(d) { return d.y + d.height / 2; })
          .interpolate('basis');

    	svg.selectAll(".link")
        	.data(areaArray)
        	.enter()
        	.append("path")
        	.attr("class", "link")
        	.attr("d", area)
        	.attr("name", name) // for restoring color
            .style("fill", function(d) {
                var source = d[0];
                var target = d[2];

                if (d3.select("#merge-split-button").classed("selected")) {
                	if (source.target.length > 1 && target.source.length > 1) // split and merge
                    return self.mergeNSplitColour

	                if (source.target.length > 1) // split
	                    return self.splitColour

	                if (target.source.length > 1) // merge
	                    return self.mergeColour
	                  
	                return self.normalColour;
                }
                
                if (d3.select("#stable-button").classed("selected")) {
                	return "url(#" + name + "-stability-gradient-" + source.timeStep + "-" + target.timeStep + ")";
                }

                if (d3.select("#density-button").classed("selected")) {
                    return "url(#" + name + "-density-gradient-" + source.timeStep + "-" + target.timeStep + ")";
                }
            })
            .style("stroke", "none")
            .style("opacity", 0.5);
	}
}