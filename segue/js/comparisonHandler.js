var ComparisonHandler = {
	featureVectors: {},
	scatterplotCoord: [],

	computeFeatureVectors: function() {
		var self = this;

		// initialization
		self.featureVectors = {};
		var allEvents = Object.keys(EventView.event2Index);
		var eventsByNameAndEventName = d3.nest()
			.key(function(d) { return d.name; })
			.key(function(d) { return d.eventName; })
			.map(Database.events);

		for (var i = 0; i < Database.nameList.length; i++) {
			var currentName = Database.nameList[i];

			// initialize the vector
			var vector = [];
			for (var j = 0; j < allEvents.length; j++)
				vector.push(0);

			// construct the feature vector
			for (var j = 0; j < allEvents.length; j++) {
				var currentEvent = allEvents[j];

				if (currentName in eventsByNameAndEventName && currentEvent in eventsByNameAndEventName[currentName])
					vector[j] = eventsByNameAndEventName[currentName][currentEvent].length;
			}

			// store the feature vector
			self.featureVectors[currentName] = vector;
		}
	},
	computeOriginalScatterplotCoord: function() {
		var self = this;
		var labels = [];
		var distances = [];

		// create a list of labels
		for (var i = 0; i < Database.nameList.length; i++)
			labels.push(Database.nameList[i]);

		// create distances based on attributes
		for (var i = 0; i < labels.length; i++) {
			var currentLabel = labels[i];
			var currentDistances = [];

			for (var j = 0; j < labels.length; j++) {
				var theOtherLabel = labels[j];

				// compute and store distance
				var distance = 1.5;
				if (currentLabel == theOtherLabel)
					distance = 0;
				else if (Database.employeeDict[currentLabel] == Database.employeeDict[theOtherLabel])
					distance = Math.random() + 0.3;

				currentDistances.push(distance);
			}

			distances.push(currentDistances);
		}

		// compute position using tsne
		var tsne = new tsnejs.tSNE();
		tsne.initDataDist(distances);
		for(var k = 0; k < 500; k++)
	  		tsne.step();
	  	var tSNEResult = tsne.getSolution();

	  	// transform and store result
	  	self.scatterplotCoord = [];
	  	for (var i = 0; i < tSNEResult.length; i++) {
	  		var currentX = tSNEResult[i][0];
	  		var currentY = tSNEResult[i][1];
	  		var currentLabel = labels[i];
	  		var currentObject = {
	  			x: currentX,
	  			y: currentY,
	  			label: currentLabel
	  		};

	  		self.scatterplotCoord.push(currentObject);
	  	}
	},
	computeScatterplotCoord: function() {
		var self = this;
		var labels = [];
		var distances = [];

		// create a list of labels
		for (var label in self.featureVectors)
			labels.push(label);

		// create distances based on the label order
		for (var i = 0; i < labels.length; i++) {
			var currentLabel = labels[i];
			var currentDistances = [];

			for (var j = 0; j < labels.length; j++) {
				var theOtherLabel = labels[j];

				var currentFeatureVector = self.featureVectors[currentLabel];
				var theOtherFeatureVector =  self.featureVectors[theOtherLabel];
				var distance = self.computeVectorDistance(currentFeatureVector, theOtherFeatureVector);

				currentDistances.push(distance);
			}

			distances.push(currentDistances);
		}

		self.scatterplotCoord = mds.classic(distances, labels);
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