var ComparisonHandler = {
	listsOfSimilarGraphs: {},
	featureVectors: {},

	updateListOfSimialarGraphs: function() {
		var self = this;

		self.computeFeatureVectors();
		self.computeListOfSimilarGraphs();
		Table.updateDynamicGraphSimilarity();
	},
	computeFeatureVectors: function() {
		var self = this;

		// initialization
		self.featureVectors = {};
		var allEvents = Object.keys(EventView.event2Index);
		var eventsByEmailAndEvent = d3.nest()
			.key(function(d) { return d.email; })
			.key(function(d) { return d.name; })
			.map(Database.events);

		for (var i = 0; i < Database.emailList.length; i++) {
			var currentEmail = Database.emailList[i];

			// initialize the vector
			var vector = [];
			for (var j = 0; j < allEvents.length; j++)
				vector.push(0);

			// construct the feature vector
			for (var j = 0; j < allEvents.length; j++) {
				var currentEvent = allEvents[j];

				if (currentEmail in eventsByEmailAndEvent && currentEvent in eventsByEmailAndEvent[currentEmail])
					vector[j] = eventsByEmailAndEvent[currentEmail][currentEvent].length;
			}

			// store the feature vector
			self.featureVectors[currentEmail] = vector;
		}
	},
	computeListOfSimilarGraphs: function() {
		var self = this;

		// initialization (all emails, not only those in feature vector array should be appended)
		self.listsOfSimilarGraphs = {};
		for (var i = 0; i < Database.emailList.length; i++)
			self.listsOfSimilarGraphs[Database.emailList[i]] = [];

		// exit if there are no events
		var allEvents = Object.keys(EventView.event2Index);
		if (allEvents.length == 0)
			return;

		// find an array of distance
		for (var currentEmail in self.featureVectors) {
			for (var otherEmail in self.featureVectors) {
				if (currentEmail != otherEmail) {
					var distance = self.computeVectorDistance(self.featureVectors[currentEmail], self.featureVectors[otherEmail]);

					self.listsOfSimilarGraphs[currentEmail].push({
						email: otherEmail,
						distance: distance
					});
				}
			}
		}
	},
	computeVectorDistance: function(vector1, vector2) {
		var distance = 0;

		for (var i = 0; i < vector1.length; i++) {
			var diff = vector1[i] - vector2[i];
			var square = diff * diff;

			distance += square;
		}

		return distance;
	}
}