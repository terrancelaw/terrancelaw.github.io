var Database = {
	data: null,
	dataByID: {}, // for checking if a feature vector belong to a group

	idKey: "City",
	excludedFeatures: [ "City", "Country", "Continent", "Region" ], // dimensions
	includedFeatures: [], // measures

	featureVectors: {},
	minMaxValuesOfFeatures: {},
	
	getData: function() {
		var self = this;

		d3.csv("csv/cities.csv", type, function(data) {
			self.data = data;

			self.findIncludedFeatures();
			self.createNormalizedFeatureVector();
			self.createDataByID();

			ListView.init();
			OOCView.init();
			FeatureView.init();
			ChangeColumnMenu.init();
		});

		function type(d) {
			var count = 0;
			for (var key in d) {
				// if it is a number, convert it to number type
				if (!isNaN(d[key]))
					d[key] = +d[key];
			}

			return d;
		}
	},
	findIncludedFeatures: function() {
		var self = this;

		for (var key in self.data[0]) {
			if ($.inArray(key, self.excludedFeatures) == -1)
				self.includedFeatures.push(key);
		}
	},
	createNormalizedFeatureVector: function() {
		var self = this;

		// create normalized feature vector
		// order of features same as that in included features
		for (var i = 0; i < self.includedFeatures.length; i++) {
			var currentFeature = self.includedFeatures[i];
			var minValueOfCurrentFeature = d3.min(self.data, function(d) {
				return d[currentFeature];
			});
			var maxValueOfCurrentFeature = d3.max(self.data, function(d) {
				return d[currentFeature];
			});

			// store the min and max
			self.minMaxValuesOfFeatures[currentFeature] = {
				min: minValueOfCurrentFeature,
				max: maxValueOfCurrentFeature
			};

			// find the normalized value
			for (var j = 0; j < self.data.length; j++) {
				var currentObject = self.data[j];
				var currentObjectID = currentObject[self.idKey];
				var normalizedValue = (currentObject[currentFeature] - minValueOfCurrentFeature) / (maxValueOfCurrentFeature - minValueOfCurrentFeature);

				if (!(currentObjectID in self.featureVectors))
					self.featureVectors[currentObjectID] = [];

				self.featureVectors[currentObjectID].push(normalizedValue);
			}
		}
	},
	createDataByID: function() {
		var self = this;

		self.dataByID = d3.nest()
			.key(function(d) {
				return d[self.idKey];
			})
			.map(self.data);
			
		for (var id in self.dataByID)
			self.dataByID[id] = self.dataByID[id][0];
	}
}