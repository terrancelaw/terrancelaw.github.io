var PageFour = {

	valueToStringDict: {
		"0": "Skinny",
		"1": "Medium Build",
		"2": "Obese"
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
			.text("Both group 1 and group 2 contain 100 people.");
		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 170)
			.style("font-size", 20)
			.text("Height of both groups are uniformly distributed.");

		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 230)
			.style("font-size", 20)
			.style("font-style", "italic")
			.text("Group 1 contains skinny people only.");
		d3.select(".pair-a").append("text")
			.attr("x", 0)
			.attr("y", 250)
			.style("font-style", "italic")
			.style("font-size", 20)
			.text("Group 2 contains obese people only.");
	},
	drawLeftBarChart: function() {
		var self = this;
		var data = Database.trainingCategoricalWideNoOverlap;
		var width = 300, height = 220;
		var xTranslate = 90, yTranslate = 270;

		// create bar chart data
		var barChartData = {
			"Skinny": { group1: 0, group2: 0 },
			"Medium Build": { group1: 0, group2: 0 },
			"Obese": { group1: 0, group2: 0 }
		};

		for (var i = 0; i < data.length; i++) {
			var build = self.valueToStringDict[data[i].value];
			var group = data[i].id;
			barChartData[build][group]++;
		}

		barChartData = [
			{ name: "Skinny", group1: barChartData["Skinny"]["group1"], group2: barChartData["Skinny"]["group2"] },
			{ name: "Medium Build", group1: barChartData["Medium Build"]["group1"], group2: barChartData["Medium Build"]["group2"] },
			{ name: "Obese", group1: barChartData["Obese"]["group1"], group2: barChartData["Obese"]["group2"] }
		];

		// scale
		var xScale = d3.scaleBand()
			.domain(["Skinny", "Medium Build", "Obese"])
			.rangeRound([0, width])
			.padding(0.2);
		var yScale = d3.scaleLinear()
			.domain([0, 200])
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
			.call(xAxis);
		d3.select(".pair-a").append("g")
			.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")")
			.call(yAxis);

		// draw label
		d3.select(".pair-a").append("text")
			.attr("transform", "translate(" + (120 + xTranslate) + "," + (yTranslate + height + 38) + ")")
			.text("Weight");
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
			.text("Both group 1 and group 2 contain 100 people.");
		d3.select(".pair-b").append("text")
			.attr("x", 700)
			.attr("y", 170)
			.style("font-size", 20)
			.text("Height of both groups are uniformly distributed.");

		d3.select(".pair-b").append("text")
			.attr("x", 700)
			.attr("y", 230)
			.style("font-size", 20)
			.style("font-style", "italic")
			.text("Both Groups contain people with medium build only.");
	},
	drawRightBarChart: function() {
		var self = this;
		var data = Database.trainingCategoricalWideOverlap;
		var width = 300, height = 220;
		var xTranslate = 790, yTranslate = 270;

		// create bar chart data
		var barChartData = {
			"Skinny": { group1: 0, group2: 0 },
			"Medium Build": { group1: 0, group2: 0 },
			"Obese": { group1: 0, group2: 0 }
		};

		for (var i = 0; i < data.length; i++) {
			var build = self.valueToStringDict[data[i].value];
			var group = data[i].id;
			barChartData[build][group]++;
		}

		barChartData = [
			{ name: "Skinny", group1: barChartData["Skinny"]["group1"], group2: barChartData["Skinny"]["group2"] },
			{ name: "Medium Build", group1: barChartData["Medium Build"]["group1"], group2: barChartData["Medium Build"]["group2"] },
			{ name: "Obese", group1: barChartData["Obese"]["group1"], group2: barChartData["Obese"]["group2"] }
		];

		// scale
		var xScale = d3.scaleBand()
			.domain(["Skinny", "Medium Build", "Obese"])
			.rangeRound([0, width])
			.padding(0.2);
		var yScale = d3.scaleLinear()
			.domain([0, 200])
			.range([height, 0]);

		// axis
		var xAxis = d3.axisBottom(xScale);
		var yAxis = d3.axisLeft(yScale);

		// draw
		var barGroup = d3.select(".pair-b").selectAll(".bar")
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
		d3.select(".pair-b").append("g")
			.attr("transform", "translate(" + xTranslate + "," + (yTranslate + height) + ")")
			.call(xAxis);
		d3.select(".pair-b").append("g")
			.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")")
			.call(yAxis);

		// draw label
		d3.select(".pair-b").append("text")
			.attr("transform", "translate(" + (120 + xTranslate) + "," + (yTranslate + height + 38) + ")")
			.text("Weight");
		d3.select(".pair-b").append("text")
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
	drawRightOption: function() {
		var self = this;

		d3.select(".pair-b").append("text")
			.attr("x", 930)
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
		PageFive.init();
	}
}