var ComparisonHandler = {
	startFeatureSelection: function() {
		var self = this;

		var functionSign = OOCView.svg.select(".function-sign text").text();
		var findDistinguishingFeatures = functionSign == "≠";

		// there can only be one everything else
		var groupConditionsForEverythingElse = [];
		var everythingElseShelfName = null;
		for (var i = 0; i < OOCView.shelfList.length; i++) {
			var shelfName = OOCView.shelfList[i];
			var everythingElseOnShelf = OOCView.groupsOnShelves[shelfName].length == 1 && OOCView.groupsOnShelves[shelfName][0].groupName == "Everything Else";

			if (everythingElseOnShelf) {
				everythingElseShelfName = shelfName;

				// create everything else conditions
				for (var j = 0; j < OOCView.shelfList.length; j++) {
					if (OOCView.shelfList[j] != everythingElseShelfName) {
						var notEverythingElseShelfName = OOCView.shelfList[j];
						for (var k = 0; k < OOCView.groupsOnShelves[notEverythingElseShelfName].length; k++)
							groupConditionsForEverythingElse.push({
								groupKey: OOCView.groupsOnShelves[notEverythingElseShelfName][k].groupKey,
								groupName: "!" + OOCView.groupsOnShelves[notEverythingElseShelfName][k].groupName
							});	
					}
				}

				break;
			}
		}

		// create group conditions
		var groupConditions = $.extend(true, {}, OOCView.groupsOnShelves);
		if (everythingElseShelfName)
			groupConditions[everythingElseShelfName] = groupConditionsForEverythingElse;

		// generate report
		var arrangeListInDescendingOrder, report;
		if (findDistinguishingFeatures)
			report = self.startFindingDistinguishingFeatures(groupConditions["top"], groupConditions["bottom"]);
		else
			report = self.startFindingSimilarFeatures(groupConditions["top"], groupConditions["bottom"]);

		return report;
	},
	startFindingDistinguishingFeatures: function(group1Conditions, group2Conditions) { // group1: groups on the top shelf, group2: groups on the bottom shelf
		var self = this;

		var group1FeatureVectors = self.findFeatureVectorsBelongsToGroup(group1Conditions);
		var group2FeatureVectors = self.findFeatureVectorsBelongsToGroup(group2Conditions);
		var fullLengthOfFeatureVector = Database.includedFeatures.length;

		var currentFeatureSubsetIndices = [];
		var bestFeatureSubsetIndices = [];
		var bestFeatureSubsetPerformance = -1;
		var bestFeatureSubsetAccuracy = -1;

		var featuresWithNoVariations = [];

		while (currentFeatureSubsetIndices.length + featuresWithNoVariations.length != fullLengthOfFeatureVector) {
			// evaluate each feature one by one to select one
			var bestFeaturePerformance = -1;
			var bestFeatureToAdd = null;

			for (var i = 0; i < fullLengthOfFeatureVector; i++) {
				if ($.inArray(i, currentFeatureSubsetIndices) == -1 && $.inArray(i, featuresWithNoVariations) == -1) { // not already added and has variations
					var testingFeatureSubsetIndices = currentFeatureSubsetIndices.concat(i);
					var group1FeatureSubsetSet = self.createFeatureSubsetSet(group1FeatureVectors, testingFeatureSubsetIndices);
					var group2FeatureSubsetSet = self.createFeatureSubsetSet(group2FeatureVectors, testingFeatureSubsetIndices);

					// compute centroid
					var group1Centroid = self.computeCentroid(group1FeatureSubsetSet);
					var group2Centroid = self.computeCentroid(group2FeatureSubsetSet);

					// compute between class distance
					var betweenClassDistance = self.computeBetweenClassDistance(group1Centroid, group2Centroid);

					// compute within class distance
					var group1WithinClassDistance = self.computeWithinClassDistance(group1FeatureSubsetSet, group1Centroid);
					var group2WithinClassDistance = self.computeWithinClassDistance(group2FeatureSubsetSet, group2Centroid);

					// remove features with no variations (within class and between class distance = 0)
					if (currentFeatureSubsetIndices.length == 0 && betweenClassDistance == 0 && group1WithinClassDistance == 0 && group2WithinClassDistance == 0) {
						featuresWithNoVariations.push(i);
						continue; // no need to continue because it should not be selected
					}

					// compute performance metric
					var currentFeaturePerformance = self.computeCurrentFeaturePerformance(group1WithinClassDistance, group2WithinClassDistance, betweenClassDistance);

					// find the feature with max performance
					if (currentFeaturePerformance > bestFeaturePerformance) {
						bestFeaturePerformance = currentFeaturePerformance;
						bestFeatureToAdd = i;
					}
				}
			}

			// if two group are exactly the same (no variations in all attributes), break to construct empty report
			if (featuresWithNoVariations.length == fullLengthOfFeatureVector) {
				bestFeatureSubsetAccuracy = 0;
				break;
			}

			// add the best feature
			currentFeatureSubsetIndices.push(bestFeatureToAdd);

			// compute the performance of the current feature subset
			var penalty = Math.exp(-currentFeatureSubsetIndices.length);
			var currentFeatureSubsetAccuracy = self.computeFeatureSubsetAccuracy(currentFeatureSubsetIndices, group1FeatureVectors, group2FeatureVectors);
			var currentFeatureSubsetPerformance = currentFeatureSubsetAccuracy - penalty;
			
			if (currentFeatureSubsetPerformance > bestFeatureSubsetPerformance) {
				bestFeatureSubsetPerformance = currentFeatureSubsetPerformance;
				bestFeatureSubsetAccuracy = currentFeatureSubsetAccuracy;
				bestFeatureSubsetIndices = $.extend(true, [], currentFeatureSubsetIndices);
			}
		}

		// construct report
		return self.constructReport(bestFeatureSubsetIndices, bestFeatureSubsetAccuracy, group1FeatureVectors, group2FeatureVectors, true);
	},
	startFindingSimilarFeatures: function(group1Conditions, group2Conditions) {
		var self = this;

		var group1FeatureVectors = self.findFeatureVectorsBelongsToGroup(group1Conditions);
		var group2FeatureVectors = self.findFeatureVectorsBelongsToGroup(group2Conditions);
		var fullLengthOfFeatureVector = Database.includedFeatures.length;

		var currentFeatureSubsetIndices = [];
		var worstFeatureSubsetIndices = []; // worst in term of distinguishing power
		var worstFeatureSubsetPerformance = Infinity;
		var worstFeatureSubsetAccuracy = Infinity;

		while (currentFeatureSubsetIndices.length != fullLengthOfFeatureVector) {
			// evaluate each feature one by one to select one
			var worstFeaturePerformance = { betweenClassDistance: Infinity, withinClass1Distance: Infinity };
			var worstFeatureToAdd = null;

			for (var i = 0; i < fullLengthOfFeatureVector; i++) {
				if ($.inArray(i, currentFeatureSubsetIndices) == -1) {
					var testingFeatureSubsetIndices = currentFeatureSubsetIndices.concat(i);
					var group1FeatureSubsetSet = self.createFeatureSubsetSet(group1FeatureVectors, testingFeatureSubsetIndices);
					var group2FeatureSubsetSet = self.createFeatureSubsetSet(group2FeatureVectors, testingFeatureSubsetIndices);

					// compute centroid
					var group1Centroid = self.computeCentroid(group1FeatureSubsetSet);
					var group2Centroid = self.computeCentroid(group2FeatureSubsetSet);

					// compute between class distance
					var betweenClassDistance = self.computeBetweenClassDistance(group1Centroid, group2Centroid);

					// compute within class distance
					var group1WithinClassDistance = self.computeWithinClassDistance(group1FeatureSubsetSet, group1Centroid);
					var group2WithinClassDistance = self.computeWithinClassDistance(group2FeatureSubsetSet, group2Centroid);
					var withinClassDistance = group1WithinClassDistance + group2WithinClassDistance;

					// a discrete metric which favours betweenClassDistance
					if (betweenClassDistance < worstFeaturePerformance.betweenClassDistance) {
						worstFeaturePerformance.betweenClassDistance = betweenClassDistance;
						worstFeaturePerformance.withinClassDistance = withinClassDistance;
						worstFeatureToAdd = i;
					}
					else if (betweenClassDistance == worstFeaturePerformance.betweenClassDistance && withinClassDistance < worstFeaturePerformance.withinClassDistance) {
						worstFeaturePerformance.betweenClassDistance = betweenClassDistance;
						worstFeaturePerformance.withinClassDistance = withinClassDistance;
						worstFeatureToAdd = i;
					}
				}
			}

			// add the worst feature
			currentFeatureSubsetIndices.push(worstFeatureToAdd);

			// compute the performance of the current feature subset
			var penalty = Math.exp(-currentFeatureSubsetIndices.length) * 2;
			var currentFeatureSubsetAccuracy = self.computeFeatureSubsetAccuracy(currentFeatureSubsetIndices, group1FeatureVectors, group2FeatureVectors);
			var currentFeatureSubsetPerformance = currentFeatureSubsetAccuracy + penalty;
			
			if (currentFeatureSubsetPerformance < worstFeatureSubsetPerformance) { // the lower the better
				worstFeatureSubsetPerformance = currentFeatureSubsetPerformance;
				worstFeatureSubsetAccuracy = currentFeatureSubsetAccuracy;
				worstFeatureSubsetIndices = $.extend(true, [], currentFeatureSubsetIndices);
			}
		}

		// construct report
		return self.constructReport(worstFeatureSubsetIndices, worstFeatureSubsetAccuracy, group1FeatureVectors, group2FeatureVectors, false);
	},
	findFeatureVectorsBelongsToGroup: function(groupConditions) {
		var groupFeatureVectors = [];
		var findEverythingElse = groupConditions[0].groupName.charAt(0) == "!";

		for (var id in Database.featureVectors) {
			var satisfyAllConditions;

			if (!findEverythingElse) {
				satisfyAllConditions = false;

				for (var i = 0; i < groupConditions.length; i++) {
					var groupKeyInCondition = groupConditions[i].groupKey;
					var groupNameInCondition = groupConditions[i].groupName;
					var currentObjectGroupName = Database.dataByID[id][groupKeyInCondition];

					if (currentObjectGroupName == groupNameInCondition) {
						satisfyAllConditions = true;
						break;
					}
				}
			}

			if (findEverythingElse) {
				satisfyAllConditions = true;

				for (var i = 0; i < groupConditions.length; i++) {
					var groupKeyInCondition = groupConditions[i].groupKey;
					var groupNameInCondition = groupConditions[i].groupName.substring(1);
					var currentObjectGroupName = Database.dataByID[id][groupKeyInCondition];

					if (currentObjectGroupName == groupNameInCondition) {
						satisfyAllConditions = false;
						break;
					}
				}
			}

			if (satisfyAllConditions) {
				var currentObjectFeatureVector = Database.featureVectors[id];
				groupFeatureVectors.push(currentObjectFeatureVector);
			}
		}

		return groupFeatureVectors;
	},
	createFeatureSubsetSet: function(featureVectors, featureSubsetIndices) {
		var newFeatureVectorSet = [];

		for (var i = 0; i < featureVectors.length; i++) {
			var newFeatureVector = [];
			var lengthOfFeatureVector = featureVectors[i].length;

			for (var j = 0; j < lengthOfFeatureVector; j++) {
				if ($.inArray(j, featureSubsetIndices) != -1) // if it is inside
					newFeatureVector.push(featureVectors[i][j]);
			}

			newFeatureVectorSet.push(newFeatureVector);
		}

		return newFeatureVectorSet;
	},
	computeCentroid: function(featureVectors) {
		var lengthOfFeatureVector = featureVectors[0].length;
		var numbeOfPoints = featureVectors.length;
		var centroid = [];

		for (var i = 0; i < lengthOfFeatureVector; i++) {
			// compute average for each feature
			var sum = 0;
			for (var j = 0; j < numbeOfPoints; j++)
				sum += featureVectors[j][i];

			var average = sum / numbeOfPoints;
			centroid.push(average);
		}

		return centroid;
	},
	computeBetweenClassDistance: function(centroid1, centroid2) {
		var self = this;

		return self.computeSquaredDistance(centroid1, centroid2);
	},
	computeWithinClassDistance: function(featureVectors, centroid) {
		var self = this;

		var withinClassDistanceSquared = 0;

		for (var i = 0; i < featureVectors.length; i++)
			withinClassDistanceSquared += self.computeSquaredDistance(featureVectors[i], centroid);

		return withinClassDistanceSquared;
	},
	computeCurrentFeaturePerformance: function(withinClass1Distance, withinClass2Distance, betweenClassDistance) {
		return betweenClassDistance / (withinClass1Distance + withinClass2Distance);
	},
	computeFeatureSubsetAccuracy: function(featureSubsetIndices, group1FeatureVectors, group2FeatureVectors) { // compute classification accuracy
		var self = this;

		var group1FeatureSubsetSet = self.createFeatureSubsetSet(group1FeatureVectors, featureSubsetIndices);
		var group2FeatureSubsetSet = self.createFeatureSubsetSet(group2FeatureVectors, featureSubsetIndices);

		var group1Centroid = self.computeCentroid(group1FeatureSubsetSet);
		var group2Centroid = self.computeCentroid(group2FeatureSubsetSet);

		// classify each point using distance from centroid
		var numberOfWrongClassification = 0;
		var totalNumberOfObject = group1FeatureVectors.length + group2FeatureVectors.length;
		var lengthOfFeatureVector = featureSubsetIndices.length;

		for (var i = 0; i < group1FeatureSubsetSet.length; i++) {
			var distanceBetweenPointAndCentroid1 = self.computeSquaredDistance(group1FeatureSubsetSet[i], group1Centroid);
			var distanceBetweenPointAndCentroid2 = self.computeSquaredDistance(group1FeatureSubsetSet[i], group2Centroid);

			// should be closer to centroid 1, if opposite -> wrong
			// equal is also wrong classification (if means are the same, not able to classify the point)
			if (distanceBetweenPointAndCentroid2 <= distanceBetweenPointAndCentroid1)
				numberOfWrongClassification++;
		}

		for (var i = 0; i < group2FeatureSubsetSet.length; i++) {
			var distanceBetweenPointAndCentroid1 = self.computeSquaredDistance(group2FeatureSubsetSet[i], group1Centroid);
			var distanceBetweenPointAndCentroid2 = self.computeSquaredDistance(group2FeatureSubsetSet[i], group2Centroid);

			// should be closer to centroid 2, if opposite -> wrong
			if (distanceBetweenPointAndCentroid1 <= distanceBetweenPointAndCentroid2)
				numberOfWrongClassification++;
		}

		return 1 - (numberOfWrongClassification / totalNumberOfObject);
	},
	computeSquaredDistance: function(point1, point2) {
		var lengthOfFeatureVector = point1.length;
		var sumOfSquareDiff = 0;

		for (var i = 0; i < lengthOfFeatureVector; i++) {
			var point1Value = point1[i];
			var point2Value = point2[i];
			var featureValueDiff = point1Value - point2Value;

			sumOfSquareDiff += featureValueDiff * featureValueDiff;
		}

		return sumOfSquareDiff;
	},
	// result is in the form: { overallAccuracyOfFeatureSubset, result: [ featureName, accuracy ] }
	constructReport: function(bestFeatureSubsetIndices, bestFeatureSubsetPerformance, group1FeatureVectors, group2FeatureVectors, arrangeListInDescendingOrder) {
		var self = this;

		var report = {};
		report.overallAccuracyOfFeatureSubset = bestFeatureSubsetPerformance;
		report.arrangeListInDescendingOrder = arrangeListInDescendingOrder;
		report.result = [];

		for (var i = 0; i < bestFeatureSubsetIndices.length; i++) {
			var currentFeatureIndex = bestFeatureSubsetIndices[i];
			var currentFeatureName = Database.includedFeatures[currentFeatureIndex];
			var accuracy = self.computeFeatureSubsetAccuracy([currentFeatureIndex], group1FeatureVectors, group2FeatureVectors);
			var group1Average = self.computeGroupAverageOfFeature(currentFeatureIndex, group1FeatureVectors);
			var group2Average = self.computeGroupAverageOfFeature(currentFeatureIndex, group2FeatureVectors);

			report.result.push({
				featureName: currentFeatureName,
				groupAverage: {
					top: group1Average.toFixed(2),
					bottom: group2Average.toFixed(2)
				},
				accuracy: accuracy.toFixed(2)
			});
		}

		return report;
	},
	computeGroupAverageOfFeature: function(featureIndex, groupFeatureVectors) {
		// compute the sum
		var sum = 0;
		for (var i = 0; i < groupFeatureVectors.length; i++)
			sum += groupFeatureVectors[i][featureIndex];

		// compute the unnormalized average
		var average = sum / groupFeatureVectors.length;

		var featureName = Database.includedFeatures[featureIndex];
		var minValueOfFeature = Database.minMaxValuesOfFeatures[featureName].min;
		var maxValueOfFeature = Database.minMaxValuesOfFeatures[featureName].max;

		var unnormalizedAverage = average * (maxValueOfFeature - minValueOfFeature) + minValueOfFeature;

		return unnormalizedAverage;
	}
};