var Database = {
	sizeData: [],
	clusterData: [],
	typeData: [],

	emailList: [],

	employeeDict: {}, // email to position
	sizeDict: {}, // email to size array
	clusterDict: {},
	typeDict: {},

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

	getData: function() {
		var self = this;

		d3.csv("csv/size.csv", sizeType, function(size) {
		d3.csv("csv/cluster.csv", clusterType, function(cluster) {
		d3.csv("csv/type.csv", typeType, function(type) {
		d3.csv("csv/employees.csv", function(employees) {
			self.sizeData = size;
			self.clusterData = cluster;
			self.typeData = type;

			// create a dictionary of employee to position
			for (var i = 0; i < employees.length; i++)
				self.employeeDict[employees[i].email] = employees[i].position;

			// create a size dictionary
			self.sizeDict = d3.nest()
								.key(function(d) {
									return d.name;
								})
								.map(self.sizeData);

			// create cluster dictionary
			self.clusterDict = d3.nest()
									.key(function(d) {
										return d.email;
									})
									.map(self.clusterData);

			// create unique list of emails
			self.emailList = Object.keys(self.sizeDict);

			// find max size of email exchanges of all employees
			for (var i = 0; i < self.sizeData.length; i++) {
				if (self.sizeData[i].size > self.maxSizeOfAll)
					self.maxSizeOfAll = self.sizeData[i].size;
			}

			// create type dictionary
			self.typeDict = d3.nest()
								.key(function(d) {
									return d.name;
								})
								.map(self.typeData);
								
			Table.init();
			FlowFactory.init();
			TimeLine.init();
		});
		});
		});
		});

		function sizeType(d) {
			d.size = +d.size;
			d.incoming = +d.incoming;
			d.outgoing = +d.outgoing;

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

		function typeType(d) {
			d.frequency = +d.frequency;

			return d;
		}
	}
}