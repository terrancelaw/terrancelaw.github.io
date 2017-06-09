var DataTransformationHandler = {
	groupNames: [],

	partitionQuantitativeFeature: function(quantitativeFeatureName, numberOfGroups, partition) {
		var self = this;

		// * add new feature to database (excludedFeature, dataByID and data)
		var newFeatureName = self.createUniqueFeatureName(quantitativeFeatureName);
		var minValueOfFeature = Database.minMaxValuesOfFeatures[quantitativeFeatureName].min;
		var maxValueOfFeature = Database.minMaxValuesOfFeatures[quantitativeFeatureName].max;
		var newPartition;

		// create partition if not provide
		if (!partition) {
			newPartition = self.returnBoundariesOfIntervals(minValueOfFeature, maxValueOfFeature, numberOfGroups);
			newPartition.pop();
		}
		else {
			newPartition = partition;
		}

		// store the new feature to excludedFeature
		Database.excludedFeatures.push(newFeatureName);

		for (var i = 0; i < Database.data.length; i++) {
			var oldValue = Database.data[i][quantitativeFeatureName];
			var newValue = self.transformQuantitative2Categorical(oldValue, newPartition);

			// store the new value to data
			Database.data[i][newFeatureName] = newValue; 

			// store the new value to dataByID
			var id = Database.data[i][Database.idKey];
			Database.dataByID[id][newFeatureName] = newValue;
		}

		return newFeatureName;
	},
	transformQuantitative2Categorical: function(value, partition) {
		var self = this;
		var groupIndex;

		var i = 0;
		for (i ; i < partition.length; i++) {
			if (value < partition[i]) {
				groupIndex = i - 1;
				break;
			}
		}

		if (i == partition.length) // belongs to the last group
			groupIndex = partition.length - 1; // partition.length = group number

		return self.groupNames[groupIndex];
	},
	createUniqueFeatureName: function(featureName) {
		var self = this;
		var allFeatures = Object.keys(Database.data[0]);

		// find current max id
		var currentMaxID = 0;
		for (var i = 0; i < allFeatures.length; i++) {
			if (allFeatures[i].indexOf(featureName) != -1) {
				var idOfMatchedFeature = parseInt(allFeatures[i].split("#")[1]);
				if (idOfMatchedFeature > currentMaxID)
					currentMaxID = idOfMatchedFeature;
			}
		}

		var newID = currentMaxID + 1;
		return featureName + "#" + newID;
	},
	returnFeatureNameWithoutID: function(originalFeatureName) {
		var indexOfSharp = originalFeatureName.indexOf("#");
		var featureNameWithoutID = originalFeatureName.substring(0, indexOfSharp);

		if (indexOfSharp == -1)
			return originalFeatureName;
		else
			return featureNameWithoutID;
	},
	createShortString: function(string, length) {
		return (string.length > length) ? string.substring(0, length) + "..." : string;
	},
	removeDerivedFeatureFromDatabase: function(featureName) {
		var self = this;
		var columnFeatureIsDerived = featureName.indexOf("#") != -1;

		// * remove feature from database (excludedFeature, dataByID and data)
		if (columnFeatureIsDerived) {
			// excludedFeature
			var index = Database.excludedFeatures.indexOf(featureName);
			Database.excludedFeatures.splice(index, 1);

			// data
			for (var i = 0; i < Database.data.length; i++)
				delete Database.data[i][featureName];

			// dataByID
			for (var id in Database.dataByID)
				delete Database.dataByID[id][featureName];
		}
	},
	returnBoundariesOfIntervals: function(minValue, maxValue, numberOfGroups) {
		var interval = (maxValue - minValue) / numberOfGroups;
		var boundariesOfIntervals = [];

		for (var i = 0; i <= numberOfGroups; i++)
			boundariesOfIntervals.push((minValue + interval * i).toFixed(1).replace(/[.,]0$/, ""));

		return boundariesOfIntervals;
	},
	setGroupNames: function(newGroupNames) {
		var self = this;

		self.groupNames = newGroupNames;
	},
	isCategoricalFeature: function(featureName) {
		var firstValueOfFeature = Database.data[0][featureName];

		return isNaN(firstValueOfFeature);
	}
}