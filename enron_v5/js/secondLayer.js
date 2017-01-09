var SecondLayer = {
	nodes: [],
	links: [],

	clusterArray: [],

	rectWidth: 70,
	clusterWidth: 40,

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

	gapBetweenNodes: 10,

	svgGroup: null,

	create: function(svg, width, height, networkData, clusterArray, name) {
		var self = this;

		self.svgGroup = svg.select(".network-cluster");

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
		    	paddingForClusters = 2 * SecondLayer.gapBetweenNodes + (numberOfClusters - 1) * SecondLayer.gapBetweenNodes;

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