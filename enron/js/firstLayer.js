var FirstLayer = {
	colour: "#e5e5e5",

	// resources for creating labels
	name: null,
	xScale: null,
	flowRadius: null,

	svgGroup: null,

	create: function(svg, width, height, data) {
		var self = this;

		self.svgGroup = svg.append("g")
							.attr("class", "size-cluster")
							.attr("transform", "translate(0, " + height / 2 + ")")
							.attr("cursor", "pointer")
							.on("mousemove", function() {
								var totalNumberOfTimePeriods = Database.sizeDict[Database.emailList[0]].length - 1;
								var widthOfOneTimePeriod = (FlowFactory.canvasWidth - FlowFactory.margin.left - FlowFactory.margin.right) / totalNumberOfTimePeriods;

								var mouseX = d3.mouse(this)[0];
								var convertedMouseX = mouseX + widthOfOneTimePeriod / 2;
								var numberOfTimePeriods = convertedMouseX / widthOfOneTimePeriod;

								var leftX = (Math.floor(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;
								var rightX = (Math.ceil(numberOfTimePeriods) - 0.5) * widthOfOneTimePeriod;

								d3.selectAll(".selectionBox").remove();

								d3.select(this)
									.append("rect")
									.attr("class", "selectionBox")
									.attr("x", leftX)
									.attr("y", -height / 2)
									.attr("width", rightX - leftX)
									.attr("height", height / 2 + self.flowRadius)
									.style("fill", "none")
									.style("stroke", "black")
									.style("stroke-width", 2);

								// change timeline text
								d3.select("#timeline")
									.selectAll("text")
									.style("font-size", null)
									.attr("transform", null);

								var textElementIndex = Math.floor(numberOfTimePeriods);

								var targetText = d3.select("#timeline")
													.selectAll("text")[0][textElementIndex];

								d3.select(targetText)
									.style("font-size", 15)
									.attr("transform", "translate(0, 5)");
							})
							.on("mouseleave", function() {
								d3.selectAll(".selectionBox").remove();

								d3.select("#timeline")
									.selectAll("text")
									.style("font-size", null)
									.attr("transform", null);
							});

		self.createLayer(self.svgGroup, width, height, data);
		self.createLabels(self.svgGroup, self.xScale, self.flowRadius + 10, self.name, data);
	},
	createLayer: function(svg, width, height, data) {
		var self = this;

		var maxSize = d3.max(data, function(d) {
			return d.size;
		});
		var maxFlow = d3.max(data, function(d) {
			if (d.incoming > d.outgoing)
				return d.incoming;
			else
				return d.outgoing;
		});

		var xScale = d3.scale.linear()
								.domain([0, data.length - 1])
								.range([0, width]);
		var sizeScale = d3.scale.linear()
								.domain([0, maxSize])
								.range([0, height / 2]);

		// create incoming arc
		var radius = width / ((data.length - 1) * 3);
		var flowMaxWidth = (width / (data.length - 1) - radius * 2) / 2;

		var flowWidthScale = d3.scale.linear()
										.domain([0, maxFlow])
										.range([0, flowMaxWidth]);
		var arc = d3.svg.arc()
		                .startAngle(300 * (Math.PI / 180))
		                .endAngle(360 * (Math.PI / 180))
		                .innerRadius(radius);

		svg.selectAll(".incoming")
			.data(data)
			.enter()
			.append("path")
			.attr("class", "incoming")
			.attr("d", function(d, i) {
				// render only after index = 1
				if (i == 0)
					arc.outerRadius(radius);
				else
					arc.outerRadius(radius + flowWidthScale(d.incoming));

				return arc();
			})
			.attr("fill", self.colour)
			.attr("transform", function(d, i) {
				var xTranslate, yTranslate;

		        if (i == 0) { // not rendered
		        	xTranslate = 0;
		        	yTranslate = 0;
		        }
		        else { // move index = 1 to between 0 and 1
		        	xTranslate = xScale(i - 1) + (xScale(i) - xScale(i - 1)) / 2;
		            yTranslate = radius;
		        }

		        return "translate(" + xTranslate + " ," +  yTranslate + ")"
			});

		// create outgoing arc
		arc.startAngle(0) //converting from degs to radians
		    .endAngle(60 * (Math.PI / 180))
		    .innerRadius(radius);

		svg.selectAll(".outgoing")
			.data(data)
			.enter()
			.append("path")
			.attr("class", "outgoing")
			.attr("d", function(d, i) {
				// render only after index = 1
				if (i == 0)
					arc.outerRadius(radius);
				else
					arc.outerRadius(radius + flowWidthScale(d.outgoing));

				return arc();
			})
			.attr("fill", self.colour)
			.attr("transform", function(d, i) {
				var xTranslate, yTranslate;

		        if (i == 0) { // not rendered
		        	xTranslate = 0;
		        	yTranslate = 0;
		        }
		        else { // move index = 1 to between 0 and 1
		        	xTranslate = xScale(i - 1) + (xScale(i) - xScale(i - 1)) / 2;
		            yTranslate = radius;
		        }

		        return "translate(" + xTranslate + " ," +  yTranslate + ")"
			});

		// create a rect to cover the top of the arcs
		svg.append("rect")
			.attr("width", width)
			.attr("height", height / 2)
			.attr("x", 0)
			.attr("y", -height / 2)
			.style("fill", "white");

		// create area chart
		var area = d3.svg.area()
							.interpolate("monotone")
							.x(function(d, i) { return xScale(i); })
		                    .y0(function(d) { return 0; }) // set the baseline to the zero
		                    .y1(function(d) { return -sizeScale(d.size); });

		svg.append("path")
			.datum(data)
			.attr("class", "area")
			.attr("d", area)
			.attr("fill", self.colour);

		// prepare resources for creating labels
		self.name = data[0].name;
		self.name = self.name.substring(0, self.name.indexOf("@"));
		self.xScale = xScale;
		self.flowRadius = radius;
	},
	createLabels: function(svg, xScale, yTranslate, name, data) {
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
		tick.append("text")
			.attr("class", "date-label")
			.attr("x", function(d, i) {
				return xScale(i);
			})
			.attr("y", yTranslate + 20)
			.attr("text-anchor", "middle")
			.text(function(d) {
				return d.date;
			});

		// create name label
		var email = name + "@enron.com"

		svg.append("text")
  			.attr("class", "name-label")
			.text(name + " (" + Database.employeeDict[email] + ")")
			.attr("x", 0)
			.attr("y", yTranslate + 40)
			.style("text-anchor", "start")
			.style("font-size", 20);

		// if flow is small, increase font size of label and remove the dates
		if (FlowFactory.isSmall) {
			d3.selectAll(".name-label")
				.style("font-size", 40);

			d3.selectAll(".date-label")
				.style("display", "none");
		}
	}
}