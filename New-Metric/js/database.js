var Database = {
	data: null,
	groupAData: [],
	groupBData: [],

	allAttributes: [],
	attributeAllValues: {},
	attributeRange: {},
	barChartData: [],

	getData: function() {
		var self = this;

		d3.csv("csv/cities.csv", type, function(data) {
			self.data = data;

			self.svg = d3.select("svg");
			
			self.getAllNumericalAttributes();
			self.getAllValuesOfEachAttribute();

			self.seperateData();
			self.processData();
			self.plotData();
		});

		function type(d) {
			for (var key in d)
				if (!isNaN(d[key])) // if it is a number, convert it
					d[key] = +d[key];

			return d;
		}
	},
	getAllNumericalAttributes: function() {
		var self = this;

		for (var attribute in self.data[0]) {
			if(!isNaN(self.data[0][attribute]))
				self.allAttributes.push(attribute);
		}
	},
	getAllValuesOfEachAttribute: function() {
		var self = this;
		var allValues = [];

		for (var i = 0; i < self.allAttributes.length; i++) {
			var currentAttribute = self.allAttributes[i];

			for (var j = 0; j < self.data.length; j++) {
				var currentValue = self.data[j][currentAttribute];

				if (allValues.indexOf(currentValue) == -1)
					allValues.push(currentValue)
			}

			self.attributeAllValues[currentAttribute] = allValues;
		}
	},
	seperateData: function() {
		var self = this;

		for (var i = 0; i < self.data.length; i++) {
			var currentCity = self.data[i];

			// A = China
			if (currentCity["Country"] == "China")
				self.groupAData.push(currentCity);

			// B = USA
			if (currentCity["Country"] == "USA")
				self.groupBData.push(currentCity);
		}
	},
	processData: function() {
		var self = this;

		// get extent
		for (var i = 0; i < self.allAttributes.length; i++) {
			var currentAttribute = self.allAttributes[i];

			self.attributeRange[currentAttribute] = d3.extent(self.data, function(d) {
				return d[currentAttribute];
			})
		}

		// get bar chart data
		for (var i = 0; i < self.allAttributes.length; i++) {
			var currentAttribute = self.allAttributes[i];

			// group A
			var countA = {};

			for (var j = 0; j < self.groupAData.length; j++) {
				var currentCity = self.groupAData[j];
				var currentCityValue = currentCity[currentAttribute];

				if (!(currentCityValue in countA))
					countA[currentCityValue] = 1;
				else
					countA[currentCityValue]++;
			}

			// group B
			countB = {};

			for (var j = 0; j < self.groupBData.length; j++) {
				var currentCity = self.groupBData[j];
				var currentCityValue = currentCity[currentAttribute];

				if (!(currentCityValue in countB))
					countB[currentCityValue] = 1;
				else
					countB[currentCityValue]++;
			}

			// find probability
			var countArrayA = [];
			var countArrayB = [];

			for (var value in countA) {
				countArrayA.push({
					value: value,
					probability: countA[value] / self.groupAData.length
				});
			}

			for (var value in countB) {
				countArrayB.push({
					value: value,
					probability: countB[value] / self.groupBData.length
				});
			}

			// find all values
			var allValues = [];

			for (var j = 0; j < countArrayA.length; j++) {
				var currentValue = countArrayA[j].value;

				if (allValues.indexOf(currentValue) == -1) // push if not found
					allValues.push(currentValue);
			}

			for (var j = 0; j < countArrayB.length; j++) {
				var currentValue = countArrayB[j].value;
				
				if (allValues.indexOf(currentValue) == -1) // push if not found
					allValues.push(currentValue);
			}

			var lower, upper;
			var metric = self.computeMetric(allValues, countArrayA, countArrayB);
			var distance = self.computeDistance(currentAttribute, countArrayA, countArrayB);
			[lower, upper] = self.runMonteCarlo(currentAttribute, self.groupAData.length, self.groupBData.length);

			if (metric > upper)
				sORD = "s";
			else if (metric < lower)
				sORD = "d";
			else
				sORD = "";

			// store
			var barChartObject = {
				attributeName: currentAttribute,
				groupA: countArrayA,
				groupB: countArrayB,
				metric: metric,
				distance: distance,
				sORD: sORD
			};
			self.barChartData.push(barChartObject);
		}

		// sort bar chart data based on the metric
		self.barChartData.sort(function(x, y) {
			return d3.descending(x.distance, y.distance);
		});

		for (var i = 0; i < self.barChartData.length; i++)
			self.barChartData[i].index = i;

		self.barChartData.sort(function(x, y) {
			if (x.metric == y.metric)
				return d3.ascending(x.index, y.index);

			return d3.descending(x.metric, y.metric);
		});
	},
	computeMetric: function(allValues, probA, probB) {
		var self = this;

		// create object of probability distribution (value: prob)
		var probObjectA = {};
		for (var i = 0; i < probA.length; i++) {
			var currentValue = probA[i].value;
			var currentProb = probA[i].probability;

			probObjectA[currentValue] = currentProb;
		}

		var probObjectB = {};
		for (var i = 0; i < probB.length; i++) {
			var currentValue = probB[i].value;
			var currentProb = probB[i].probability;

			probObjectB[currentValue] = currentProb;
		}

		// compute metric
		var metric = 0;
		for (var i = 0; i < allValues.length; i++) {
			var currentValue = allValues[i];
			var probFromA = (currentValue in probObjectA) ? probObjectA[currentValue] : 0;
			var probFromB = (currentValue in probObjectB) ? probObjectB[currentValue] : 0;

			metric += Math.abs(probFromA - probFromB);
		}

		return metric;
	},
	computeDistance: function(currentAttribute, probA, probB) {
		var self = this;

		if (self.attributeRange[currentAttribute][1] - self.attributeRange[currentAttribute][0] == 1)
			return 1;

		var expectedValueA = 0;
		for (var i = 0; i < probA.length; i++) {
			var currentValue = (probA[i].value - self.attributeRange[currentAttribute][0]) / self.attributeRange[currentAttribute][1];
			var currentProb = probA[i].probability;

			expectedValueA += currentValue * currentProb;
		}

		var expectedValueB = 0;
		for (var i = 0; i < probB.length; i++) {
			var currentValue = (probB[i].value - self.attributeRange[currentAttribute][0]) / self.attributeRange[currentAttribute][1];
			var currentProb = probB[i].probability;

			expectedValueB += currentValue * currentProb;
		}

		return Math.abs(expectedValueB - expectedValueA);
	},
	runMonteCarlo: function(attributeName, groupALength, groupBLength) {
		var self = this;
		var allValues = self.attributeAllValues[attributeName];
		var statistics = [];

		for (var j = 0; j < 100; j++) {
			// random item generator
			var groupAValues = [];
			for (var i = 0; i < groupALength; i++) {
				var randomItem = allValues[Math.floor(Math.random() * allValues.length)];
				groupAValues.push(randomItem);
			}
			
			var groupBValues = [];
			for (var i = 0; i < groupBLength; i++) {
				var randomItem = allValues[Math.floor(Math.random() * allValues.length)];
				groupBValues.push(randomItem);
			}

			// count
			countA = {};
			for (var i = 0; i < groupALength; i++) {
				var currentValue = groupAValues[i];

				if (!(currentValue in countA))
					countA[currentValue] = 1;
				else
					countA[currentValue]++;
			}

			countB = {};
			for (var i = 0; i < groupBLength; i++) {
				var currentValue = groupBValues[i];

				if (!(currentValue in countB))
					countB[currentValue] = 1;
				else
					countB[currentValue]++;
			}

			// find probability
			var countArrayA = [];
			var countArrayB = [];

			for (var value in countA) {
				countArrayA.push({
					value: value,
					probability: countA[value] / self.groupAData.length
				});
			}

			for (var value in countB) {
				countArrayB.push({
					value: value,
					probability: countB[value] / self.groupBData.length
				});
			}

			var metric = self.computeMetric(allValues, countArrayA, countArrayB);
			statistics.push(metric);
		}

		// sort in ascending
		statistics.sort(function(a, b){return a-b});

		return [statistics[2], statistics[97]];
	},
	plotData: function() {
		var self = this;

		var barCharts = self.svg.selectAll("g")
			.data(self.barChartData)
			.enter()
			.append("g")
			.attr("transform", function(d, i) {
				return "translate(50, " + (50 + i * 150) + ")";
			});

		barCharts.each(function(d) {
			var xScale = d3.scaleLinear()
				.domain(self.attributeRange[d.attributeName])
				.range([10, 200]);
			var yScale = d3.scaleLinear()
				.domain([1, 0])
				.range([0, 100]);

			// draw axis
			var xAxis = d3.select(this).append("g")
      			.attr("class", "axis x")
      			.attr("transform", "translate(0, 100)")
      			.call(d3.axisBottom(xScale).ticks(3));
      		var text = xAxis.append("text")
      			.attr("class", "legend")
      			.attr("x", 100)
      			.attr("y", 30)
      			.style("text-anchor", "middle")
      			.style("fill", function(d) {
      				if (d.sORD != "")
      					return "white";

      				return "black";
      			})
      			.text(d.attributeName);

      		var bbox = text.node().getBBox();
      		xAxis.insert("rect", ".legend")
      			.attr("rx", 3)
      			.attr("ry", 3)
      			.attr("x", bbox.x - 3)
      			.attr("y", bbox.y - 2)
      			.attr("width", bbox.width + 6)
      			.attr("height", bbox.height + 4)
      			.style("fill", function(d) {
      				if (d.sORD == "s")
      					return "green";
      				if (d.sORD == "d")
      					return "purple";

      				return "white";
      			})

      		d3.select(this).append("g")
      			.attr("class", "axis y")
      			.call(d3.axisLeft(yScale).ticks(5));

      		// draw bars (group A)
      		d3.select(this).selectAll(".groupA-rect")
      			.data(d.groupA)
      			.enter()
      			.append("rect")
      			.attr("class", "groupA-rect")
      			.attr("x", function(d) {
      				return xScale(d.value) - 10;
      			})
      			.attr("y", function(d) {
      				return yScale(d.probability);
      			})
      			.attr("width", 10)
      			.attr("height", function(d) {
      				return 100 - yScale(d.probability);
      			})
      			.style("fill", "red");

      		// draw bars (group B)
      		d3.select(this).selectAll(".groupB-rect")
      			.data(d.groupB)
      			.enter()
      			.append("rect")
      			.attr("class", "groupB-rect")
      			.attr("x", function(d) {
      				return xScale(d.value);
      			})
      			.attr("y", function(d) {
      				return yScale(d.probability);
      			})
      			.attr("width", 10)
      			.attr("height", function(d) {
      				return 100 - yScale(d.probability);
      			})
      			.style("fill", "steelBlue");
		});

		// adjust height of svg
		self.svg
			.attr("height", self.allAttributes.length * 150 + 100);
	}
}