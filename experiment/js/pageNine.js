var PageNine = {
	hex: {
		"Red": "#F44336",
		"Orange": "#FF5723",
		"Pink": "#E91E63",
		"Purple": "#9C27B0",
		"Deep Purple": "#673AB7",
		"Indigo": "#3F51B5", 
		"Blue": "#2096F3",
		"Cyan": "#01BCD4",
		"Teal": "#009588",
		"Green": "#4CAF50"
	},
	valueToStringDict: {
		"0": "Red",
		"1": "Orange",
		"2": "Pink",
		"3": "Purple",
		"4": "Deep Purple",
		"5": "Indigo",
		"6": "Blue",
		"7": "Cyan",
		"8": "Teal",
		"9": "Green",
	},

	init: function() {
		var self = this;

		self.drawContent();
		self.drawButton();
	},
	drawContent: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 600)
			.attr("y", 20)
			.style("font-weight", "bold")
			.style("font-size", 25)
			.style("text-anchor", "middle")
			.text("Is pair a or pair b more distinguishing?");

		Database.svg.append("text")
			.attr("x", 190)
			.attr("y", 50)
			.style("font-size", 16)
			.text("Select the pair of groups which is more distinguishing.");
		Database.svg.append("text")
			.attr("x", 190)
			.attr("y", 70)
			.style("font-size", 16)
			.text("Try to imagine how the groups are like.");

		Database.svg.append("text")
			.attr("x", 620)
			.attr("y", 50)
			.style("font-size", 16)
			.style("font-weight", "bold")
			.text("Shortcuts");
		Database.svg.append("text")
			.attr("x", 620)
			.attr("y", 70)
			.style("font-size", 16)
			.text("a – select pair a");
		Database.svg.append("text")
			.attr("x", 750)
			.attr("y", 70)
			.style("font-size", 16)
			.text("b – select pair b");
		Database.svg.append("text")
			.attr("x", 620)
			.attr("y", 90)
			.style("font-size", 16)
			.text("enter or space – advance to next task");

		// left
		Database.svg.append("g")
			.attr("class", "pair-a")
			.style("cursor", "pointer")
			.on("mouseover", function() {
				d3.select(this).select(".background")
					.style("fill", "#eaeaea");
			})
			.on("mouseout", function() {
				d3.select(this).select(".background")
					.style("fill", "white");
			});
		self.drawLeftDescription();
		self.drawLeftBarChart();
		self.drawLeftOption();
		self.insertLeftRect();

		// right
		Database.svg.append("g")
			.attr("class", "pair-b")
			.style("cursor", "pointer")
			.on("mouseover", function() {
				d3.select(this).select(".background")
					.style("fill", "#eaeaea");
			})
			.on("mouseout", function() {
				d3.select(this).select(".background")
					.style("fill", "white");
			});
		self.drawRightDescription();
		self.drawRightBarChart();
		self.drawRightOption();
		self.insertRightRect();
	},
	drawLeftDescription: function() {
		var self = this;

		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 150)
			.style("font-size", 20)
			.text("Both group 1 and group 2 contain 100 marbles.");
		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 170)
			.style("font-size", 20)
			.text("Size of both groups are uniformly distributed.");

		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 230)
			.style("font-size", 20)
			.style("font-style", "italic")
			.text("Group 1 has a uniform distribution of color.");
		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 250)
			.style("font-size", 20)
			.style("font-style", "italic")
			.text("Group 2 only has deep purple marbles.");
	},
	drawLeftBarChart: function() {
		var self = this;
		var data = Database.studyCategoricalOneWideOverlap;
		var width = 300, height = 220;
		var xTranslate = 90, yTranslate = 270;

		// create bar chart data
		var barChartData = {
			"Red": { group1: 0, group2: 0 },
			"Orange": { group1: 0, group2: 0 },
			"Pink": { group1: 0, group2: 0 },
			"Purple": { group1: 0, group2: 0 },
			"Deep Purple": { group1: 0, group2: 0 },
			"Indigo": { group1: 0, group2: 0 },
			"Blue": { group1: 0, group2: 0 },
			"Cyan": { group1: 0, group2: 0 },
			"Teal": { group1: 0, group2: 0 },
			"Green": { group1: 0, group2: 0 }
		};

		for (var i = 0; i < data.length; i++) {
			var build = self.valueToStringDict[data[i].value];
			var group = data[i].group;
			barChartData[build][group]++;
		}

		barChartData = [
			{ name: "Red", group1: barChartData["Red"]["group1"], group2: barChartData["Red"]["group2"] },
			{ name: "Orange", group1: barChartData["Orange"]["group1"], group2: barChartData["Orange"]["group2"] },
			{ name: "Pink", group1: barChartData["Pink"]["group1"], group2: barChartData["Pink"]["group2"] },
			{ name: "Deep Purple", group1: barChartData["Deep Purple"]["group1"], group2: barChartData["Deep Purple"]["group2"] },
			{ name: "Indigo", group1: barChartData["Indigo"]["group1"], group2: barChartData["Indigo"]["group2"] },
			{ name: "Blue", group1: barChartData["Blue"]["group1"], group2: barChartData["Blue"]["group2"] },
			{ name: "Cyan", group1: barChartData["Cyan"]["group1"], group2: barChartData["Cyan"]["group2"] },
			{ name: "Teal", group1: barChartData["Teal"]["group1"], group2: barChartData["Teal"]["group2"] },
			{ name: "Purple", group1: barChartData["Purple"]["group1"], group2: barChartData["Purple"]["group2"] },
			{ name: "Green", group1: barChartData["Green"]["group1"], group2: barChartData["Green"]["group2"] }
		];

		// scale
		var xScale = d3.scaleBand()
			.domain(["Red", "Orange", "Pink", "Purple", "Deep Purple", "Indigo", "Blue", "Cyan", "Teal", "Green"])
			.rangeRound([0, width])
			.padding(0.2);
		var yScale = d3.scaleLinear()
			.domain([0, 150])
			.range([height, 0]);

		// axis
		var xAxis = d3.axisBottom(xScale);
		var yAxis = d3.axisLeft(yScale);

		// draw
		var barGroup = d3.select(".pair-a").selectAll(".bar")
			.data(barChartData)
			.enter()
			.append("g")
			.attr("class", "bar")
			.attr("transform", function(d, i) {
				return "translate(" + (xTranslate + xScale(d.name)) + "," + yTranslate + ")";
			});

		barGroup.each(function(d, i) {
			// draw group 1
			d3.select(this)
				.append("rect")
				.attr("x", 0)
				.attr("y", yScale(d.group1))
				.attr("width", xScale.bandwidth())
				.attr("height", height - yScale(d.group1))
				.style("stroke", "white")
				.style("fill", "Chocolate");

			// draw group 2
			var group1Height = height - yScale(d.group1);
			d3.select(this)
				.append("rect")
				.attr("x", 0)
				.attr("y", yScale(d.group2) - group1Height)
				.attr("width", xScale.bandwidth())
				.attr("height", height - yScale(d.group2))
				.style("stroke", "white")
				.style("fill", "Gold");
		});

		// draw axis
		d3.select(".pair-a").append("g")
			.attr("transform", "translate(" + xTranslate + "," + (yTranslate + height) + ")")
			.call(xAxis)
			.selectAll("text")
			    .attr("y", 0)
			    .attr("x", 9)
			    .attr("dy", ".35em")
			    .attr("transform", "rotate(90)")
			    .style("text-anchor", "start")
			    .each(function() {
			    	d3.select(this)
			    		.style("fill", self.hex[d3.select(this).text()]);
			    });
		d3.select(".pair-a").append("g")
			.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")")
			.call(yAxis);

		// draw label
		d3.select(".pair-a").append("text")
			.attr("transform", "translate(" + (120 + xTranslate) + "," + (yTranslate + height + 88) + ")")
			.text("Color");
		d3.select(".pair-a").append("text")
			.attr("transform", "translate(" + (xTranslate - 30) + "," + (yTranslate + height / 2 + 10) + ") rotate(-90)")
			.text("Count");

		// draw legend
		d3.select(".pair-a").append("text")
			.attr("transform", "translate(" + (width + xTranslate + 10) + "," + (yTranslate + 30) + ")")
			.style("fill", "Chocolate")
			.text("Group 1");
		d3.select(".pair-a").append("text")
			.attr("transform", "translate(" + (width + xTranslate + 10) + "," + (yTranslate + 50) + ")")
			.style("fill", "Gold")
			.text("Group 2");
	},
	drawLeftOption: function() {
		var self = this;

		d3.select(".pair-a").append("text")
			.attr("x", 220)
			.attr("y", 720)
			.style("font-size", 30)
			.style("text-anchor", "middle")
			.text("Pair a");
	},
	insertLeftRect: function() {
		var self = this;
		var bbox = d3.select(".pair-a").node().getBBox();

		d3.select(".pair-a").insert("rect", ":first-child")
			.attr("class", "background")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - 5)
			.attr("rx", 8)
			.attr("ry", 8)
			.attr("width", bbox.width + 10)
			.attr("height", bbox.height + 10)
			.attr("fill", "white");
	},
	drawRightDescription: function() {
		var self = this;

		d3.select(".pair-b").append("text")
			.attr("x", 700)
			.attr("y", 150)
			.style("font-size", 20)
			.text("Both group 1 and group 2 contain 100 marbles.");
		d3.select(".pair-b").append("text")
			.attr("x", 700)
			.attr("y", 170)
			.style("font-size", 20)
			.text("Both groups have a uniform distribution of color.");

		d3.select(".pair-b").append("text")
			.attr("x", 700)
			.attr("y", 230)
			.style("font-size", 20)
			.style("font-style", "italic")
			.text("Group 1's size ranges from 3 to 7 with a mean of 5.");
		d3.select(".pair-b").append("text")
			.attr("x", 700)
			.attr("y", 250)
			.style("font-size", 20)
			.style("font-style", "italic")
			.text("Group 2's size ranges from 3 to 7 with a mean of 5.");
	},
	drawRightBarChart: function() {
		var self = this;
		var data = Database.studyNumericalBothWideOverlap;
		var width = 300, height = 220;
		var xTranslate = 790, yTranslate = 270;

		// create binned data
		var binnedData = [];

		for (var i = 0; i < 10; i++)
			binnedData.push({ group1: 0, group2: 0 });

		for (var i = 0; i < data.length; i++) {
			var group = data[i].group;
			var binIndex = (data[i].value - 1);
			binIndex = Math.floor(binIndex);
			binIndex = (binIndex == 10) ? 9 : binIndex;

			// count
			binnedData[binIndex][group]++;
		}

		// scale
		var xScale = d3.scaleLinear()
			.domain([1, 10])
			.range([0, width]);
		var yScale = d3.scaleLinear()
			.domain([0, 150])
			.range([height, 0]);

		// axis
		var xAxis = d3.axisBottom(xScale)
			.ticks(10);
		var yAxis = d3.axisLeft(yScale);

		// draw
		var barGroup = d3.select(".pair-b").selectAll(".bar")
			.data(binnedData)
			.enter()
			.append("g")
			.attr("class", "bar")
			.attr("transform", function(d, i) {
				var leftEdgeValue = i + 1;

				return "translate(" + (xTranslate + xScale(leftEdgeValue)) + "," + yTranslate + ")";
			});

		barGroup.each(function(d, i) {
			// draw group 1
			d3.select(this)
				.append("rect")
				.attr("x", 0)
				.attr("y", yScale(d.group1))
				.attr("width", 300 / 9)
				.attr("height", height - yScale(d.group1))
				.style("stroke", "white")
				.style("fill", "Chocolate");

			// draw group 2
			var group1Height = height - yScale(d.group1);
			d3.select(this)
				.append("rect")
				.attr("x", 0)
				.attr("y", yScale(d.group2) - group1Height)
				.attr("width", 300 / 9)
				.attr("height", height - yScale(d.group2))
				.style("stroke", "white")
				.style("fill", "Gold");
		});

		// draw axis
		d3.select(".pair-b").append("g")
			.attr("transform", "translate(" + xTranslate + "," + (yTranslate + height) + ")")
			.call(xAxis);
		d3.select(".pair-b").append("g")
			.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")")
			.call(yAxis);

		// draw label
		d3.select(".pair-b").append("text")
			.attr("transform", "translate(" + (120 + xTranslate) + "," + (yTranslate + height + 38) + ")")
			.text("Size");
		d3.select(".pair-a").append("text")
			.attr("transform", "translate(" + (xTranslate - 30) + "," + (yTranslate + height / 2 + 10) + ") rotate(-90)")
			.text("Count");

		// draw legend
		d3.select(".pair-b").append("text")
			.attr("transform", "translate(" + (width + xTranslate + 10) + "," + (yTranslate + 30) + ")")
			.style("fill", "Chocolate")
			.text("Group 1");
		d3.select(".pair-b").append("text")
			.attr("transform", "translate(" + (width + xTranslate + 10) + "," + (yTranslate + 50) + ")")
			.style("fill", "Gold")
			.text("Group 2");
	},
	drawRightGroup1DotPlot: function() {
		var self = this;
		var width = 300;
		var xTranslate = 790, yTranslate = 560;
		var data = Database.studyNumericalBothWideOverlap;

		var xScale = d3.scaleLinear()
			.domain([1, 10])
			.range([0, width]);

		// draw axis
		var xAxis = d3.axisBottom(xScale)
			.ticks(10);

		d3.select(".pair-b").append("g")
			.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")")
			.call(xAxis);
		d3.select(".pair-b").append("text")
			.attr("transform", "translate(" + (50 + xTranslate) + "," + (yTranslate + 38) + ")")
			.text("Group 1's height distribution");

		// draw dot plot
		d3.select(".pair-b").selectAll(".dot1")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "dot1")
			.attr("r", function(d) {
				return (d.group == "group1") ? 7 : 0;
			})
			.attr("cx", function(d) {
				return xTranslate + xScale(d.value);
			})
			.attr("cy", yTranslate)
			.style("fill", "Chocolate")
			.style("stroke", "white");
	},
	drawRightGroup2DotPlot: function() {
		var self = this;
		var width = 300;
		var xTranslate = 790, yTranslate = 620;
		var data = Database.studyNumericalBothWideOverlap;

		var xScale = d3.scaleLinear()
			.domain([1, 10])
			.range([0, width]);

		// draw axis
		var xAxis = d3.axisBottom(xScale)
			.ticks(10);

		d3.select(".pair-b").append("g")
			.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")")
			.call(xAxis);
		d3.select(".pair-b").append("text")
			.attr("transform", "translate(" + (50 + xTranslate) + "," + (yTranslate + 38) + ")")
			.text("Group 2's height distribution");

		// draw dot plot
		d3.select(".pair-b").selectAll(".dot2")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "dot2")
			.attr("r", function(d) {
				return (d.group == "group2") ? 7 : 0;
			})
			.attr("cx", function(d) {
				return xTranslate + xScale(d.value);
			})
			.attr("cy", yTranslate)
			.style("fill", "Gold")
			.style("stroke", "white");
	},
	drawRightOption: function() {
		var self = this;

		d3.select(".pair-b").append("text")
			.attr("x", 940)
			.attr("y", 720)
			.style("font-size", 30)
			.style("text-anchor", "middle")
			.text("Pair b");
	},
	insertRightRect: function() {
		var self = this;
		var bbox = d3.select(".pair-b").node().getBBox();

		d3.select(".pair-b").insert("rect", ":first-child")
			.attr("class", "background")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - 5)
			.attr("rx", 8)
			.attr("ry", 8)
			.attr("width", bbox.width + 10)
			.attr("height", bbox.height + 10)
			.attr("fill", "white");
	},
	drawButton: function() {
		var self = this;

		var button = Database.svg.append("g")
			.style("cursor", "pointer")
			.on("click", function() {
				self.clear();
			});

		var buttonText = button.append("text")
			.attr("class", "button-text")
			.attr("x", 600)
			.attr("y", 760)
			.style("font-size", 25)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Next");

		var bbox = buttonText.node().getBBox();
		button.insert("rect", ".button-text")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - 2)
			.attr("width", bbox.width + 10)
			.attr("height", bbox.height + 4)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "#e8e8e8");
	},
	clear: function() {
		var self = this;

		Database.svg.selectAll("*").remove();
	}
}