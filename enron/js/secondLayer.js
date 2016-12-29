var SecondLayer = {
	nodes: [],
	links: [],
	transitionGlyphs: [],

	clusterArray: [],

	rectWidth: 50,
	transitionRectWidth: 20,

	mostUnstableColour: "#a50026",
	leastUnstableColour: "#abd9e9",

	mergeColour: "#1f77b4",
	splitColour: "#ff9e4a",
	mergeNSplitColour: "#8b7c6e",
	normalColour: "#999999",

	clusterBorderNFillColour: "#666666",

	gapBetweenNodes: 1,

	svgGroup: null,

	create: function(svg, width, height, sizeData, clusterData, name) {
		var self = this;

		self.svgGroup = svg.select(".size-cluster");

		self.preprocessing(width, height, sizeData, clusterData);
		self.createEdges(self.svgGroup, self.links, sizeData, name);
		self.createTransitionGlyphs(self.svgGroup, self.transitionGlyphs, sizeData, name);
		self.createClusters(self.svgGroup, self.nodes, self.clusterArray);

		return self.computeBoundingBox(svg);
	},
	preprocessing: function(width, height, sizeData, clusterData) {
		var self = this;

		// * reorder nodes in id order
		clusterData.sort(function(a, b){ return d3.ascending(a.id, b.id); });

		// * convert id to index so that you can do clusterData[ID], id same as index
		self.convertID2Index(clusterData);

		// * reorder clusters to reduce edge crossing

		// create an array of clusters at each time step
		var clustersAtEachTimeStep = d3.nest()
										.key(function(d) {
											return d.date;
										})
										.map(clusterData);

		// fill in the gaps in the dictionary
		var totalNumberOfTimeStep = Database.sizeDict[Database.emailList[0]].length;
		var firstTimeStep = Database.sizeDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.sizeDict[Database.emailList[0]][totalNumberOfTimeStep - 1].date;
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

		// ordering nodes at each time step
		var clusterArray = self.reorderNodes(clustersAtEachTimeStep, clusterData);

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

		// * create node array and transition array
		var nodes = [];
		var transitionGlyphs = [];
		var xScale = d3.scale.linear()
    							.domain([0, totalNumberOfTimeStep - 1])
    							.range([0, width]);

    	var maxSize = d3.max(sizeData, function(d, i) { return d.size; });
    	var flowSizeScale = d3.scale.linear()
                                      .domain([0, maxSize])
                                      .range([0, height / 2]);

        for (var i = 0; i < clusterArray.length; i++) {
        	var widthOfFlow = flowSizeScale(sizeData[i].size);

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
			var y = -widthOfFlow; // 0 is the bottom of stream, start the top of the stream
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

			// create transition glyph coordinate (for stability and density)
			if (i != clusterArray.length - 1) {
				if (clusterArray[i].length != 0) {
					var leftTopY = -widthOfFlow + self.gapBetweenNodes;
					var leftBottomY = y;
					var rightTopY = null;
					var rightBottomY = null;
					var leftX = xScale(i);
					var rightX = xScale(i + 1);

					var transitionArray = [];
					transitionArray.push({
						x: xScale(i),
						topY: -widthOfFlow + self.gapBetweenNodes,
						bottomY: y
					});
					transitionArray.push({
						x: xScale(i + 1),
						topY: null,
						bottomY: null
					});

					transitionGlyphs.push(transitionArray);
				}
				else { // = 0, no clusters
					var transitionArray = [];
					transitionArray.push({
						x: xScale(i),
						topY: 0,
						bottomY: 0
					});
					transitionArray.push({
						x: xScale(i + 1),
						topY: null,
						bottomY: null
					});

					transitionGlyphs.push(transitionArray);
				}
			}

			// need to modify last rightTopY and rightBottomY for i == clusterArray.length - 1
			if (i != 0) {
				if (clusterArray[i].length != 0) {
					transitionGlyphs[i - 1][1].topY = -widthOfFlow + self.gapBetweenNodes;
					transitionGlyphs[i - 1][1].bottomY = y;
				}
				else {
					transitionGlyphs[i - 1][1].topY = 0;
					transitionGlyphs[i - 1][1].bottomY = 0;
				}
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
		self.transitionGlyphs = transitionGlyphs;
		self.clusterArray = clusterArray;
	},
	convertID2Index: function(clusterData) {
		// create an id to index dictionary
		var id2Index = {};
		for (var i = 0; i < clusterData.length; i++)
			id2Index[clusterData[i].id] = i;

		// convert id to index
		for (var i = 0; i < clusterData.length; i++) {
			clusterData[i].id = i;

			// change id in source and target array
			for (var j = 0; j < clusterData[i].source.length; j++)
				clusterData[i].source[j] = id2Index[clusterData[i].source[j]];
			for (var j = 0; j < clusterData[i].target.length; j++)
				clusterData[i].target[j] = id2Index[clusterData[i].target[j]];
		}
	},
	reorderNodes: function(clustersAtEachTimeStep, clusterData) {
		var reorderedClustersArray = [];
		var unorderedClustersArray = [];

		// put the object into an array for easier processing
		var numOfTimeSteps = Object.keys(clustersAtEachTimeStep).length;
		var firstTimeStep = Database.sizeDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.sizeDict[Database.emailList[0]][numOfTimeSteps - 1].date;

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
            		var targetsOfTarget = clusterData[targetIndex].target.toString();

            		if ($.inArray(targetIndex, clustersAdded) == -1) {
            			reorderedClustersArray[t].push(clusterData[targetIndex]);
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
            			var targetsOfClusterToBeAdded = clusterData[clusterID].target.toString();
            			var foundIndex;

            			// check if there exists some clusters at T with the same target set
            			if (targetsOfClusterToBeAdded == "")
            				foundIndex = -1;
            			else
            				foundIndex = $.inArray(targetsOfClusterToBeAdded, targetsOfClustersAtT);

            			// insert the reordered array
            			if (foundIndex != -1) {
            				reorderedClustersArray[t].splice(foundIndex, 0, clusterData[clusterID]);
            				targetsOfClustersAtT.splice(foundIndex, 0, targetsOfClusterToBeAdded);
            			}
            			else {
            				reorderedClustersArray[t].unshift(clusterData[clusterID]);
            				targetsOfClustersAtT.unshift(targetsOfClusterToBeAdded);
            			}

            			clustersAdded.push(clusterID);
            		}
            	}
            }
		}

		return reorderedClustersArray;
	},
	createClusters: function(svg, nodes, clusterArray) {
		var self = this;

		svg.selectAll(".cluster")
			.data(nodes)
			.enter()
			.append("circle")
			.attr("class", "cluster")
            .attr("r", function(d) {
                return d.height / 2;
            })
            .attr("cx", function(d) { 
                return d.x; 
            })
            .attr("cy", function(d) {
                return d.y;
            })
            .style("fill", function(d, i) {
                var lastIndex = clusterArray.length - 1;
                var disappear = d.target.length == 0 && i < nodes.length - clusterArray[lastIndex].length;
                var incoming = d.source.length == 0 && i >= clusterArray[0].length;

                if (incoming && disappear) { // draw an inner circle
                	var cx = parseFloat(d3.select(this).attr("cx"));
                	var cy = parseFloat(d3.select(this).attr("cy"));
                	var r = parseInt(d3.select(this).attr("r")) * 0.5;
                	svg.append("circle")
                		.attr("cx", cx)
                		.attr("cy", cy)
                		.attr("r", r)
                		.style("fill", self.clusterBorderNFillColour);
                }
                else if (disappear) {
                    return self.clusterBorderNFillColour;
                }

                return "white";
            })
            .style("stroke", function(d, i) {
                var incoming = d.source.length == 0 && i >= clusterArray[0].length;

                if (incoming)
                    return self.clusterBorderNFillColour;

                return "none";
            })
            .style("stroke-width", 2);
	},
	createEdges: function(svg, links, sizeData, name) {
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

        var display = "none";
        if (d3.select("#merge-split-button").classed("selected"))
        	display = null;

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

                if (source.target.length > 1 && target.source.length > 1) // split and merge
                    return self.mergeNSplitColour

                if (source.target.length > 1) // split
                    return self.splitColour

                if (target.source.length > 1) // merge
                    return self.mergeColour
                  
                return self.normalColour;
            })
            .style("stroke", "none")
            .style("opacity", 0.5)
            .style("display", display);
	},
	createTransitionGlyphs: function(svg, transitionGlyphs, sizeData, name) {
		var self = this;

		var areaArray = transitionGlyphs.map(function(d) {
			var left1 = d[0];
			var left2 = $.extend({}, d[0]);
			left2.x += self.transitionRectWidth;
			
			var right1 = d[1];
			var right2 = $.extend({}, d[1]);
			right2.x -= self.transitionRectWidth;

            return [left1, left2, right2, right1];
        });

        var area = d3.svg.area()
                          .x(function(d) { return d.x; })
                          .y0(function(d) { return d.bottomY; })
                          .y1(function(d) { return d.topY; })
                          .interpolate("basis");

        // appending the gradients
        var mostUnstableValue = d3.max(sizeData, function(d) {
        	return d.incoming + d.outgoing;
        });
		var colourScale = d3.scale.linear()
                                    .domain([0, mostUnstableValue])
                                    .range([self.leastUnstableColour, self.mostUnstableColour]);

        for (var i = 0; i < sizeData.length -  1; i++) {
            var gradient = svg.append("defs")
            					.append("linearGradient")
                                .attr("id", name + "-gradient-" + i + "-" + (i + 1))
                                .attr("x1", "0%")
                                .attr("x2", "100%")
                                .attr("y1", "0%")
                                .attr("y2", "0%");

            gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", colourScale(sizeData[i].incoming + sizeData[i].outgoing));
            gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", colourScale(sizeData[i + 1].incoming + sizeData[i + 1].outgoing))
        }

        var display = null;
        if (d3.select("#merge-split-button").classed("selected"))
        	display = "none";

        svg.selectAll(".transition")
        	.data(areaArray)
        	.enter()
        	.append("path")
        	.attr("class", "transition")
        	.attr("d", area)
        	.style("fill", function(d, i) {
        		return "url(#" + name + "-gradient-" + i + "-" + (i + 1) + ")";
            })
        	.style("stroke", "none")
        	.style("display", display);
	},
	computeBoundingBox: function(svg) {
  		var self = this;

  		return svg.node().getBBox().height;
  	}
}