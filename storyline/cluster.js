Cluster = {
	margin: {top: 150, right: 100, bottom: 20, left: 20},
	width: null,
	height: null,

	svg: null,

	nodes: [],
	links: [],

	sizeData:[], // only include the data from 2015-01 onwards
	communityData: [],
  reorderedCommunities: [],

  rectWidth: 50,

	init: function() {
		var self = this;

		self.width = 1800 - self.margin.left - self.margin.right;
  	self.height = 600 - self.margin.top - self.margin.bottom;

  	self.svg = d3.select("#chart");

  	var clusterGroup = self.svg.append("g")
									.attr("class", "cluster-group")
									.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

		d3.csv("grouponCommunities.csv", communityType, function(data) {
			d3.csv("size.csv", sizeType, function(size) {
				// get size data (width of stream)
				var startIndex = size.map(function(d) { return d.date; }).indexOf("2015-01");
				self.sizeData = size.slice(startIndex, size.length);

				// process community data and change id of communities
				self.communityData = data.sort(function(a, b){ return d3.ascending(a.id, b.id); })
				self.convertID2Index(); // so that you can do communityData[ID], id same as index

        // ordering nodes at each time step
        var communityAtEachTimeStep = d3.nest()
              	  											.key(function(d) {
              	  												return d.date;
              	  											})
              	  											.entries(self.communityData);
        self.reorderNodes(communityAtEachTimeStep);

  			var xScale = d3.scale.linear()
        		  								.domain([0, self.sizeData.length - 1])
        		  								.range([0, self.width]);

        var maxSize = d3.max(self.sizeData, function(d) { return d.size });
        var flowSizeScale = d3.scale.linear()
                              .domain([0, maxSize])
                              .range([0, self.height / 3]);

	  		// create a dictionary to change id to index value
        // to ensure souce and target id is the same as index in node (for creating links)
				var id2Index = {};
        var count = 0;
				for (var i = 0; i < self.reorderedCommunities.length; i++) {
          for (var j = 0; j < self.reorderedCommunities[i].length; j++) {
            id2Index[self.reorderedCommunities[i][j].id] = count;
            count++;
          }
				}
				
				// create node array
        // x and y is the middle of rectangle
				for (var i = 0; i < self.reorderedCommunities.length; i++) {
					var gapBetweenNodes = 5;
					var widthOfFlow = flowSizeScale(self.sizeData[i].size);
					var widthOfFlowMinusGap = widthOfFlow;
					var sumOfSizes = 0; // sum of sizes of communities
					for (var j = 0; j < self.reorderedCommunities[i].length; j++) {
						sumOfSizes += self.reorderedCommunities[i][j].size;
					}

					// should have padding between, top and bottom
					widthOfFlowMinusGap -= self.reorderedCommunities[i].length * gapBetweenNodes + gapBetweenNodes;

					var sizeScale = d3.scale.linear()
          												.domain([0, sumOfSizes])
          												.range([0, widthOfFlowMinusGap]);

					// 0 is the middle of stream, need to offset it. we assume 0 is the top.
					var y = -widthOfFlow / 2;
					for (var j = 0; j < self.reorderedCommunities[i].length; j++) {
						var height = sizeScale(self.reorderedCommunities[i][j].size);
						var id = id2Index[self.reorderedCommunities[i][j].id];
						var target = self.reorderedCommunities[i][j].target.map(function(d) {
							return id2Index[d];
						});
            var source = self.reorderedCommunities[i][j].source.map(function(d) {
              return id2Index[d];
            });

						var x = xScale(i);
						y = y + gapBetweenNodes + height / 2; // top padding

						node = {
							height: height,
							id: id,
							target: target,
              source: source,
							x: x,
							y: y,
						}

						self.nodes.push(node);
						y += height / 2;
					}
				}

				// create link array
				for (var i = 0; i < self.nodes.length; i++) {
					for (var j = 0; j < self.nodes[i].target.length; j++) {
						var link = {
							source: self.nodes[i],
							target: self.nodes[self.nodes[i].target[j]]
						};

						self.links.push(link)
					}
				}

        var areaArray = self.links.map(function(d) {
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

        // pass an array of source and target to it
        var area = d3.svg.area()
                          .x(function(d) { return d.x; })
                          .y0(function(d) { return d.y - d.height / 2; })
                          .y1(function(d) { return d.y + d.height / 2; })
                          .interpolate('basis');

        clusterGroup.selectAll(".link")
                    .data(areaArray)
                    .enter()
                    .append("path")
                    .attr("class", "link")
                    .attr("d", area)
                    .style("fill", function(d) {
                      var source = d[0];
                      var target = d[2];

                      if (source.target.length > 1 && target.source.length > 1) // split and merge
                        return "#8b7c6e"

                      if (source.target.length > 1) // split
                        return "#ff9e4a"

                      if (target.source.length > 1) // merge
                        return "#1f77b4"
                      
                      return "#999999";
                    })
                    .style("stroke", "none")
                    .style("opacity", 0.5);

        clusterGroup.selectAll(".community")
                    .data(self.nodes)
                    .enter()
                    .append("circle")
                    .attr("class", "community")
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
                      var lastIndex = self.reorderedCommunities.length - 1;
                      var disappear = d.target.length == 0 && i < self.nodes.length - self.reorderedCommunities[lastIndex].length;

                      if (disappear)
                        return "#666666";

                      return "white";
                    })
                    .style("stroke", function(d, i) {
                      var lastIndex = self.reorderedCommunities.length - 1;
                      var incoming = d.source.length == 0 && i >= self.reorderedCommunities[0].length;;

                      if (incoming)
                        return "#666666";

                      return "none";
                    })
                    .style("stroke-width", 3);
      });
		});

		function communityType(d) {
			d.id = +d.id;
			
      // handling targets
      d.target = d.target.split("|");
      if (d.target != "") {
        d.target = d.target.map(function(t) { // map is not mutable
          return +t;
        });
      }
      else {
        d.target = [];
      }

      // handling sources
      d.source = d.source.split("|");
      if (d.source != "") {
        d.source = d.source.map(function(t) { // map is not mutable
          return +t;
        });
      }
      else {
        d.source = [];
      }
			
			d.size = +d.size;

			return d;
		}

		function sizeType(d) {
			d.size = +d.size;
			d.incoming = +d.incoming;
			d.outgoing = +d.outgoing;

			return d;
		}
	},
  reorderNodes: function(communityAtEachTimeStep) {
    var self = this;
    var numOfTimeSteps = communityAtEachTimeStep.length;

    self.reorderedCommunities.push(communityAtEachTimeStep[0].values);

    for (var t = 1; t < numOfTimeSteps; t++) {
      self.reorderedCommunities.push([])
      var communitiesAdded = [];
      var targetsOfCommunities = [];

      // add the communities according to the ordering at the previous time
      var numOfCommunitiesAtT = self.reorderedCommunities[t - 1].length;
      for (var j = 0; j < numOfCommunitiesAtT; j++) {

        var numOfTargets = self.reorderedCommunities[t - 1][j].target.length;
        for (var k = 0; k < numOfTargets; k++) {
          var targetIndex = self.reorderedCommunities[t - 1][j].target[k];
          var goTo = self.communityData[targetIndex].target.toString();

          if ($.inArray(targetIndex, communitiesAdded) == -1) {
            self.reorderedCommunities[t].push(self.communityData[targetIndex]);
            communitiesAdded.push(targetIndex);

            targetsOfCommunities.push(goTo)
          }
        }
      }

      // add new communities (no source) to front (incoming)
      if (self.reorderedCommunities[t].length != communityAtEachTimeStep[t].values.length) {
        var numOfCommunitiesAtT = communityAtEachTimeStep[t].values.length;
        for (var i = 0; i < numOfCommunitiesAtT; i++) {
          var communityID = communityAtEachTimeStep[t].values[i].id;
          if ($.inArray(communityID, communitiesAdded) == -1) {
            // find nodes with common target and add to the front of them
            // if no such node, add to the front of the stack
            var currentCommunityTarget = communityAtEachTimeStep[t].values[i].target.toString();
            var foundIndex;

            // if both don't have target, it is not something in common!
            if (currentCommunityTarget == "")
              foundIndex = -1;
            else
              foundIndex = $.inArray(currentCommunityTarget, targetsOfCommunities);

            if (foundIndex != -1) { // found, insert to front
              self.reorderedCommunities[t].splice(foundIndex, 0, self.communityData[communityID])
              targetsOfCommunities.splice(foundIndex, 0, currentCommunityTarget);
            }
            else {
              self.reorderedCommunities[t].unshift(self.communityData[communityID]);
              targetsOfCommunities.unshift(currentCommunityTarget);
            }
          
            communitiesAdded.push(communityID);
          }
        }
      }

    }
  },
  convertID2Index: function() {
    var self = this;

    var id2Index = {};
    for (var i = 0; i < self.communityData.length; i++) {
      id2Index[self.communityData[i].id] = i;
    }

    for (var i = 0; i < self.communityData.length; i++) {
      self.communityData[i].id = i;

      for (var j = 0; j < self.communityData[i].target.length; j++) {
        self.communityData[i].target[j] = id2Index[self.communityData[i].target[j]];
      }

      for (var j = 0; j < self.communityData[i].source.length; j++) {
        if (typeof id2Index[self.communityData[i].source[j]] == 'undefined')
          console.log(self.communityData[i].source[j])
        self.communityData[i].source[j] = id2Index[self.communityData[i].source[j]];
      }
    }
  }
};