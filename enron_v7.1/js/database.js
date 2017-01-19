var Database = {
	networkData: [],
	clusterData: [],
	attributeData: [],

	emailList: [],

	employeeDict: {}, // email to position
	networkDict: {}, // email to network array
	clusterDict: {},
	attributeDict: {},

	position2Index: {
		"CEO": 0,
		"President": 1,
		"Vice President": 2,
		"Director": 3,
		"Managing Director": 4,
		"Manager": 5,
		"In House Lawyer": 6,
		"Trader": 7,
		"Employee": 8
	},
	positionColours: ["#800026", "#e31a1c", "#fd8d3c", "#fed976", "#fed976", "#ffeda0", "#ffffcc", "#ffffcc", "#ffffcc"],

	maxSizeOfAll: 0,
	maxDensityOfAll: 0,

	numberOfTimeSteps: null,
	dateString2Index: {},
	dateStringArray: [], // for converting index to dateString

	events: [], // { name, startDate, endData, email }

	// for handling topological event adding
	rangeDict: {}, // key: Size, Number of Clusters, Density, Stability
	attribute2DataDict: {}, // key: Size, Number of Clusters, Density, Stability

	getData: function() {
		var self = this;

		d3.csv("csv/network.csv", networkType, function(network) {
		d3.csv("csv/cluster.csv", clusterType, function(cluster) {
		d3.csv("csv/attribute.csv", attributeType, function(attribute) {
		d3.csv("csv/employees.csv", function(employees) {
		d3.csv("csv/test.csv", function(test) {
			self.init(network, cluster, attribute, employees);
			
			self.processNetworkData();
			self.processClusterData();
			self.processAttributeData();

			self.createDate2IndexDict();
			self.createAttributeDict();

			Table.init();
			FlowFactory.init();
			TimeLine.init();
			EventView.init();
			LearningView.init();

			var test = d3.nest()
				.key(function(d) { return d.attribute })
				.key(function(d) { return d.email })
				.map(test);

			for (attribute in test) {
				for (email in test[attribute]) {
					var array = [];
					for (var i = 0; i < self.numberOfTimeSteps - 1; i++) {
						array.push([]);
						for (var j = i + 1; j < self.numberOfTimeSteps; j++) {
							array[i].push([]);
						}
					}
					
					for (var i = 0; i < test[attribute][email].length; i++) {
						array[+test[attribute][email][i].startTime][(+test[attribute][email][i].endTime) - (+test[attribute][email][i].startTime) - 1] = {
							slope: +test[attribute][email][i].slope,
							outlierPercent: +test[attribute][email][i].outlierPercent
						}
					}

					test[attribute][email] = array;
				}
			}
		});
		});
		});
		});
		});

		function networkType(d) {
			d.size = +d.size;
			d.incoming = +d.incoming;
			d.outgoing = +d.outgoing;
			d.density = +d.density;

			return d;
		}

		function clusterType(d) {
			d.size = +d.size;
			d.id = +d.id;

			// array size  = number of source or target
			if (d.source != "") {
				d.source = d.source.split("|");

				for (var i = 0; i < d.source.length; i++)
					d.source[i] = +d.source[i];
			}
			else
				d.source = [];

			if (d.target != "") {
				d.target = d.target.split("|");

				for (var i = 0; i < d.target.length; i++)
					d.target[i] = +d.target[i];
			}
			else
				d.target = [];

			return d;
		}

		function attributeType(d) {
			d.frequency = +d.frequency;

			return d;
		}
	},
	init: function(network, cluster, attribute, employees) {
		var self = this;

		self.networkData = network;
		self.clusterData = cluster;
		self.attributeData = attribute;

		// create a dictionary of employee to position
		for (var i = 0; i < employees.length; i++)
			self.employeeDict[employees[i].email] = employees[i].position;
	},
	processNetworkData: function() {
		var self = this;

		// create a network dictionary
		self.networkDict = d3.nest()
			.key(function(d) {
				return d.name;
			})
			.map(self.networkData);

		// create unique list of emails
		self.emailList = Object.keys(self.networkDict);

		// store the total number of time periods
		self.numberOfTimeSteps = self.networkDict[self.emailList[0]].length;

		// find max size and density of email exchanges of all employees
		for (var i = 0; i < self.networkData.length; i++) {
			if (self.networkData[i].size > self.maxSizeOfAll)
				self.maxSizeOfAll = self.networkData[i].size;

			if (self.networkData[i].density > self.maxDensityOfAll)
				self.maxDensityOfAll = self.networkData[i].density;
		}
	},
	processClusterData: function() {
		var self = this;

		// create cluster dictionary
		self.clusterDict = d3.nest()
			.key(function(d) {
				return d.email;
			})
			.map(self.clusterData);
	},
	processAttributeData: function() {
		var self = this;

		// * create attribute dictionary
		attributeDict = d3.nest()
			.key(function(d) {
				return d.name;
			})
			.map(self.attributeData);

		for (email in attributeDict) {
			var rawData = attributeDict[email];
			var dataByDate = [];
			var uniquePositions = [];
			var dataWithoutUnknown = [];

			
			for (var i = 0; i < rawData.length; i++) {
				// determine the number of layers
				if ($.inArray(rawData[i].position, uniquePositions) == -1 && rawData[i].position != "unknown")
					uniquePositions.push(rawData[i].position);

				// remove the items position of which is unknown
				if (rawData[i].position != "unknown")
					dataWithoutUnknown.push(rawData[i]);
			}

			var tempDataByDate = d3.nest()
				.key(function(d) {
					return d.date;
				})
				.map(dataWithoutUnknown);

			// create dataByDate which contains every month
			var totalNumberOfTimeStep = Database.networkDict[Database.emailList[0]].length;
			var firstTimeStep = Database.networkDict[Database.emailList[0]][0].date;
			var lastTimeStep = Database.networkDict[Database.emailList[0]][totalNumberOfTimeStep - 1].date;
			var parseDate = d3.time.format("%Y-%m").parse;
			var currentDate = parseDate(firstTimeStep);
			var lastDate = parseDate(lastTimeStep);

			while (currentDate <= lastDate) {
				// construct date string
				var year = currentDate.getYear() + 1900;
				var month = currentDate.getMonth() + 1;

				if (month < 10)
					month = "0" + month.toString();
				else
					month = month.toString();

				var currentDateString = year + "-" + month;

				if (currentDateString in tempDataByDate)
					dataByDate.push(tempDataByDate[currentDateString]);
				else
					dataByDate.push([]);

				currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
			}

			// sort by position and then by frequency
			for (var i = 0; i < dataByDate.length; i++) {
				dataByDate[i].sort(function(x, y) {
					return d3.ascending(Database.position2Index[x.position], Database.position2Index[y.position]);
				});
			}
			for (var i = 0; i < dataByDate.length; i++) {
				dataByDate[i].sort(function(x, y) {
					return d3.descending(x.frequency, y.frequency);
				});
			}

			attributeDict[email] = dataByDate;
		}

		self.attributeDict = attributeDict;
	},
	createDate2IndexDict: function() {
		var self = this;

		var firstTimeStep = Database.networkDict[Database.emailList[0]][0].date;
		var lastTimeStep = Database.networkDict[Database.emailList[0]][Database.numberOfTimeSteps - 1].date;
		var parseDate = d3.time.format("%Y-%m").parse;
		var currentDate = parseDate(firstTimeStep);
		var lastDate = parseDate(lastTimeStep);
		var dateIndex = 0;

		while (currentDate <= lastDate) {
			var year = currentDate.getYear() + 1900;
			var month = currentDate.getMonth() + 1;

			if (month < 10)
				month = "0" + month.toString();
			else
				month = month.toString();

			var currentDateString = year + "-" + month;

			self.dateString2Index[currentDateString] = dateIndex;
			self.dateStringArray.push(currentDateString);

			currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
			dateIndex++;
		}
	},
	createAttributeDict: function() {
		var self = this;

		// nest cluster dictionary again for finding the dictionaries
		var clusterArrayDict = {}; // input: email, output: { date: array of clusters, date: .... }
		for (email in self.clusterDict) {
			clusterArrayDict[email] = d3.nest()
				.key(function(d) {
					return d.date
				})
				.map(self.clusterDict[email]);
		}

		// * create range dictionary
		var min, max;

		// size
		min = d3.min(self.networkData, function(d) { return d.size; });
		max = d3.max(self.networkData, function(d) { return d.size; });
		self.rangeDict["Size"] = [min, max];
		
		// stability
		min = d3.min(self.networkData, function(d) { return d.incoming + d.outgoing; });
		max = d3.max(self.networkData, function(d) { return d.incoming + d.outgoing; });
		self.rangeDict["Stability"] = [min, max];

		// density
		min = d3.min(self.networkData, function(d) { return d.density; });
		max = d3.max(self.networkData, function(d) { return d.density; });
		self.rangeDict["Density"] = [min, max];

		// number of clusters
		min = 0; // min must be 0
		max = -999;
		for (email in clusterArrayDict) {
			for (date in clusterArrayDict[email]) {
				if (clusterArrayDict[email][date].length > max)
					max = clusterArrayDict[email][date].length;
			}
		}
		self.rangeDict["Number of Clusters"] = [min, max];

		// * create data store for each topological attribute
		self.attribute2DataDict["Size"] = {};
		self.attribute2DataDict["Density"] = {};
		self.attribute2DataDict["Stability"] = {};
		self.attribute2DataDict["Number of Clusters"] = {};

		// size, density and stability
		for (var email in self.networkDict) {
			var sizeArray = [], densityArray = [], stabilityArray = [];

			for (var t = 0; t < self.networkDict[email].length; t++) {
				sizeArray.push(self.networkDict[email][t].size);
				densityArray.push(self.networkDict[email][t].density);
				stabilityArray.push(self.networkDict[email][t].incoming + self.networkDict[email][t].outgoing);
			}

			self.attribute2DataDict["Size"][email] = sizeArray;
			self.attribute2DataDict["Density"][email] = densityArray;
			self.attribute2DataDict["Stability"][email] = stabilityArray;
		}

		// number of clusters
		for (var email in clusterArrayDict) {
			var clusterArray = [];

			// construct cluster array
			var firstTimeStep = Database.networkDict[Database.emailList[0]][0].date;
			var lastTimeStep = Database.networkDict[Database.emailList[0]][Database.numberOfTimeSteps - 1].date;
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

				var date = year + "-" + month;

				if (date in clusterArrayDict[email])
					clusterArray.push(clusterArrayDict[email][date].length);
				else
					clusterArray.push(0);

				currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
			}

			self.attribute2DataDict["Number of Clusters"][email] = clusterArray;
		}
	},
	appendEvent: function(eventName, startDate, endDate, email) {
		var self = this;

		var event = {
			name: eventName,
			startDate: startDate,
			endDate: endDate,
			email: email
		}

		self.events.push(event);
	}
}