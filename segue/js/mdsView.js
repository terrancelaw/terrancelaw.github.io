var MDSView = {
	margin: { top: 60, left: 70, bottom: 50, right: 30 },
	textMargin: { top: 30, left: 10 },

	width: null,
	height: null,

	labelSVG: null,
	nodeLayer: null,
	linkLayer: null,

	init: function() {
		var self = this;

		self.width = mdsViewWidth - self.margin.left - self.margin.right;
		self.height = mdsViewHeight - self.margin.top - self.margin.bottom;

		d3.select("#scatterplot").append("text")
			.attr("x", 0)
			.attr("y", -15)
			.attr("transform", "translate(" + self.textMargin.left + ", " + self.textMargin.top + ")")
			.style("font-weight", "bold")
			.text("Network View");

		self.initButton();
		self.initLabel();
		self.initNodeAndLinkLayers();
		self.restore(); // create attribute clusters using tSNE
	},
	initNodeAndLinkLayers: function() {
		var self = this;

		self.linkLayer = d3.select("#scatterplot").append("g")
			.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
		self.nodeLayer = d3.select("#scatterplot").append("g")
			.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
	},
	initButton: function() {
		var self = this;

		var jitterButton = d3.select("#scatterplot")
			.append("g")
			.style("cursor", "pointer")
			.on("click", clickJitterBtn);
		jitterButton.append("text")
			.attr("class", "jitter-btn")
			.attr("x", -self.textMargin.left)
			.attr("y", -15)
			.attr("transform", "translate(" + mdsViewWidth + ", " + self.textMargin.top + ")")
			.style("text-anchor", "end")
			.text("Jitter");
		var bbox = jitterButton.select("text").node().getBBox();
		jitterButton.insert("rect", ".jitter-btn")
			.attr("x", bbox.x - 2)
			.attr("y", bbox.y - 1)
			.attr("width", bbox.width + 4)
			.attr("height", bbox.height + 2)
			.attr("transform", "translate(" + mdsViewWidth + ", " + self.textMargin.top + ")")
			.attr("rx", 3)
			.attr("ry", 3)
			.attr("fill", "#e5e5e5");

		function clickJitterBtn() {
			var xScale = d3.scale.linear()
				.domain(d3.extent(ComparisonHandler.scatterplotCoord, function(d) { return d.x; }))
				.range([0, self.width]);
			var yScale = d3.scale.linear()
				.domain(d3.extent(ComparisonHandler.scatterplotCoord, function(d) { return d.y; }))
				.range([0, self.height]);

			self.nodeLayer.selectAll("circle")
				.transition()
				.attr("cx", function(d, i) {
					var randomX = xScale(d.x) + Math.floor(Math.random() * 20) - 10;
					return randomX;
				})
				.attr("cy", function(d) {
					var randomY = yScale(d.y) + Math.floor(Math.random() * 20) - 10;
					return randomY;
				})
		}
	},
	initLabel: function() {
		var self = this;

		self.labelSVG = d3.select("#scatterplot").append("g")
			.attr("transform", "translate(10, 35)");

		var yScale = d3.scale.linear()
			.domain([0, Database.dateStringArray.length - 1])
			.range([0, mdsViewHeight - 50]);

		// create
		var labels = self.labelSVG.selectAll("text")
			.data(Database.dateStringArray)
			.enter()
			.append("text")
			.attr("transform", function(d, i) {
				return "translate(0, " + yScale(i) + ")";
			})
			.style("cursor", "pointer")
			.style("alignment-baseline", "middle")
			.text(function(d) {
				return d;
			})
			.on("mouseover", mouseoverDateLabel)
			.on("mouseout", mouseoutDateLabel);

		function mouseoverDateLabel() {
			var date = d3.select(this).text();
			self.updateLinks(date);
		}

		function mouseoutDateLabel() {
			self.linkLayer.selectAll(".link").remove();
		}
	},
	restore: function() {
		var self = this;

		ComparisonHandler.computeOriginalScatterplotCoord();
		self.updateNodes();
	},
	update: function() {
		var self = this;

		if (Database.events.length == 0) {
			self.restore();
		}
		else {
			ComparisonHandler.computeFeatureVectors();
			ComparisonHandler.computeScatterplotCoord();
			self.updateNodes();
		}
	},
	updateNodes: function() {
		var self = this;

		var xScale = d3.scale.linear()
			.domain(d3.extent(ComparisonHandler.scatterplotCoord, function(d) { return d.x; }))
			.range([0, self.width]);
		var yScale = d3.scale.linear()
			.domain(d3.extent(ComparisonHandler.scatterplotCoord, function(d) { return d.y; }))
			.range([0, self.height]);

		// join
		var circle = self.nodeLayer.selectAll("circle")
			.data(ComparisonHandler.scatterplotCoord);

		// enter
		var circleEnter = circle.enter()
			.append("circle")
			.attr("r", 5)
			.style("stroke", "#d1d1d1")
			.style("opacity", 0.7)
			.style("cursor", "pointer")
			.on("click", clickCircle)
			.on("mouseover", mouseoverCircle)
			.on("mouseout", mouseoutCircle);

		// update
		self.nodeLayer.selectAll("circle")
			.style("fill", function(d) {
				var position = Database.employeeDict[d.label];
				var positionIndex = Database.position2Index[position];
				var positionColour = Database.positionColours[positionIndex];
				return positionColour;
			})
			.transition()
			.attr("cx", function(d) {
				return xScale(d.x);
			})
			.attr("cy", function(d) {
				return yScale(d.y);
			});
			
		// exit
		circle.exit().remove();

		function clickCircle(d) {
			var className = ".row." + d.label.split(".").join("-");
			// append selected to row
			if (!Table.svgGroup.select(className).classed("selected")) {
				Table.svgGroup.select(className).classed("selected", true);
				EgoNetworkView.createFlow(d.label);
			}
			else {
				Table.svgGroup.select(className).classed("selected", false);
				EgoNetworkView.removeFlow(d.label);
			}
		}
		function mouseoverCircle(d) {
			// * draw text

			// get the x y position of the hovered circle
			var circleX = parseInt(d3.select(this).attr("cx"));
			var circleY = parseInt(d3.select(this).attr("cy"));

			var newPixelGroupLeftRightPadding = 15;
			var pixelGroupWidth = Table.columnWidth[3] - Table.pixelGroupLeftRightPadding * 2 + newPixelGroupLeftRightPadding * 2;
				
			// * draw pixel display
			var pixelHeight = (Table.maxPixelGroupsHeight - (EventView.maxNumberOfEvents - 1)) / EventView.maxNumberOfEvents; // 6 = gap numbers x gap pixels
			var pixelWidth = 4;
			var paddingBetweenPixel = (Table.columnWidth[3] - Table.pixelGroupLeftRightPadding - Table.pixelGroupLeftRightPadding - pixelWidth * Database.numberOfTimeSteps) / (Database.numberOfTimeSteps - 1)
			var pixelXAndWidthScale = d3.scale.linear()
				.domain([0, Database.numberOfTimeSteps - 1])
				.range([0, pixelGroupWidth - newPixelGroupLeftRightPadding - newPixelGroupLeftRightPadding]);

			if (circleX + pixelGroupWidth > self.width)
				circleX = circleX - pixelGroupWidth - 20;

			// retrieve the events of that person
			var nameOfSelectedPerson = d.label;
			var eventsOfSelectedPerson = [];
			for (var i = 0; i < Database.events.length; i++) {
				if (Database.events[i].name == nameOfSelectedPerson)
					eventsOfSelectedPerson.push(Database.events[i])
			}

			// construct event group array
			var eventsByEventName = d3.nest()
				.key(function(event) {
					return event.eventName;
				})
				.map(eventsOfSelectedPerson);

			var eventGroupArray = [];
			for (var eventName in eventsByEventName)
				eventGroupArray.push(eventsByEventName[eventName]);

			// append the pixel display group
			var currentEventPixelGroup = self.nodeLayer
				.append("g")
				.attr("id", "current-pixel-group")
				.attr("transform", "translate(" + (circleX + 10) + ", " + (circleY - 30) + ")");

			// append text label
			currentEventPixelGroup.append("text")
				.attr("x", 2)
				.attr("y", -5)
				.text(d.label + ": " + Database.employeeDict[d.label]);

			// append the bottom rectangle
			currentEventPixelGroup.append("rect")
				.attr("width", pixelGroupWidth)
				.attr("height", Table.rowHeight)
				.attr("rx", 3)
				.attr("ry", 3)
				.style("fill", "white")
				.style("stroke", "black");

			// append the pixels on top
			var currentPixelGroup = currentEventPixelGroup.selectAll("g")
				.data(eventGroupArray)
				.enter()
				.append("g")
				.attr("transform", function(d, i) {
					var yTranslate = Table.maxPixelGroupsHeight - (i + 1) * (pixelHeight + 1);
					return "translate(" + newPixelGroupLeftRightPadding + ", " + yTranslate + ")";
				});

			currentPixelGroup.selectAll("rect")
				.data(function(d) {
					return d;
				})
				.enter()
				.append("rect")
				.attr("width", function(d) {
					var startTimeIndex = Database.dateString2Index[d.startDate];

					if (d.endDate) {
						var endTimeIndex = Database.dateString2Index[d.endDate];
						return pixelXAndWidthScale(endTimeIndex - startTimeIndex) - paddingBetweenPixel;
					}
					else {
						return pixelWidth;
					}
				})
				.attr("height", pixelHeight)
				.attr("x", function(d) {
					return pixelXAndWidthScale(Database.dateString2Index[d.startDate]) + paddingBetweenPixel / 2;
				})
				.attr("y", 0.5) // 0.5 is the top padding
				.style("fill", function(d) {
					var eventIndex = EventView.event2Index[d.eventName];

					return EventView.colours(eventIndex);
				});
		}

		function mouseoutCircle(d) {
			// remove text and pixel display
			d3.select("#current-pixel-group").remove();

			// remove link
			self.linkLayer.selectAll(".link").remove();
		}
	},
	updateLinks: function(date) {
		var self = this;

		// compute coordinate of labels
		var xScale = d3.scale.linear()
			.domain(d3.extent(ComparisonHandler.scatterplotCoord, function(d) { return d.x; }))
			.range([0, self.width]);
		var yScale = d3.scale.linear()
			.domain(d3.extent(ComparisonHandler.scatterplotCoord, function(d) { return d.y; }))
			.range([0, self.height]);

		var labelCoord = {};
		for (var i = 0; i < ComparisonHandler.scatterplotCoord.length; i++) {
			var currentNode = ComparisonHandler.scatterplotCoord[i];
			labelCoord[currentNode.label] = {
				x: xScale(currentNode.x),
				y: yScale(currentNode.y)
			}
		}

		// count link frequency
		var links = {};
		for (var i = 0; i < Database.dateToLinkDict[date].length; i++) {
			var source = Database.dateToLinkDict[date][i].source;
			var target = Database.dateToLinkDict[date][i].target;

			var first = (source < target) ? source : target;
			var second = (source < target) ? target : source;
			var linkString = first + "-" + second;

			if (linkString in links)
				links[linkString]++;
			else
				links[linkString] = 1;
		}

		// generate link data
		var linkData = [];
		var circleData = [];
		for (linkID in links) {
			var sourceLabel = linkID.split("-")[0];
			var targetLabel = linkID.split("-")[1];

			if (sourceLabel != targetLabel) {
				var linkObject = {
					source: { x: labelCoord[sourceLabel].x, y: labelCoord[sourceLabel].y },
					target: { x: labelCoord[targetLabel].x, y: labelCoord[targetLabel].y }
				}
				var pathData = linkArc(linkObject);
				var weight = links[linkID];

				linkData.push({
					path: pathData,
					weight: weight
				});
			}

			// draw circle for nodes which connect to themselves
			else {
				var weight = links[linkID];

				circleData.push({
					x: labelCoord[sourceLabel].x,
					y: labelCoord[sourceLabel].y,
					weight: weight
				});
			}
		}

		// draw link
		var widthScale = d3.scale.linear()
			.domain([1, Database.maxLinkCountToANode])
			.range([1, 4]);

		var linkSVG = self.linkLayer.selectAll("path.link")
			.data(linkData);

		linkSVG.enter()
			.append("path")
			.attr("class", "link")
			.style("fill", "none")
			.style("stroke", "#d1d1d1");

		self.linkLayer.selectAll(".link")
			.attr("d", function(d) {
				return d.path;
			})
			.style("stroke-width", function(d) {
				return widthScale(d.weight);
			})
			.style("opacity", 0.7);

		linkSVG.exit().remove();

		// draw circle
		var linkSVG = self.linkLayer.selectAll("circle.link")
			.data(circleData);

		linkSVG.enter()
			.append("circle")
			.attr("class", "link")
			.attr("r", 8)
			.style("fill", "none")
			.style("stroke", "#d1d1d1");

		self.linkLayer.selectAll("circle.link")
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			})
			.style("stroke-width", function(d) {
				return widthScale(d.weight);
			});

		function linkArc(d) {
		  var dx = d.target.x - d.source.x,
		      dy = d.target.y - d.source.y,
		      dr = Math.sqrt(dx * dx + dy * dy);
		  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		}
	}
}