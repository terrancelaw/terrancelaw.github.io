const LAKBDistributionHandler = {
	generateVisSpecMetadata: function(visSpec) {
		const self = LAKBDistributionHandler;
		let distributionAttribute = 'x' in visSpec ? visSpec.x.attributeName : visSpec.y.attributeName;
		let nominalAttribute = visSpec.color.attributeName;
		let filterList = visSpec.filter;
		let requiredInfo = self.getTwoRequiredCategories(nominalAttribute, filterList);
		let visSpecMetadata = null;

		requiredInfo.distributionAttribute = distributionAttribute;
		requiredInfo.nominalAttribute = nominalAttribute;
		visSpecMetadata = self.computeQualityScoreAndThreshold(requiredInfo); // init
		visSpecMetadata.shortDescriptionHTML = self.generateShortDescriptionHTML(requiredInfo);
		visSpecMetadata.renderThumbnail = self.renderThumbnail;

		return visSpecMetadata;
	},
	renderThumbnail: function(svgEl, thumbnailData) {
		let nominalAttribute = thumbnailData.nominalAttribute;
		let firstCategory = thumbnailData.firstCategory;
		let secondCategory = thumbnailData.secondCategory;
		let probabilityDistributionPair = thumbnailData.probabilityDistributionPair;

		let chartHeight = 50, chartWidth = 60;
		let numberOfBins = probabilityDistributionPair.first.length;
		let maxProbability = d3.max(probabilityDistributionPair.first.concat(probabilityDistributionPair.second));
		let firstCategoryfillColour = Database.categoryToColourDictForEachNominalAttr[nominalAttribute][firstCategory];
		let secondCategoryfillColour = Database.categoryToColourDictForEachNominalAttr[nominalAttribute][secondCategory];

		let xScale = d3.scaleLinear()
            .domain([ 0, numberOfBins - 1 ])
            .range([ 0, chartWidth ]);
        let yScale = d3.scaleLinear()
            .domain([ 0, maxProbability ])
            .range([ chartHeight, chartHeight * 0.5 ]);
        let area = d3.area()
            .x(function(d, i) { return xScale(i); })
            .y0(function(d) { return yScale(d); })
            .y1(chartHeight)
            .curve(d3.curveMonotoneX);

        d3.select(svgEl)
        	.style('width', chartWidth)
        	.style('height', chartHeight);
       	d3.select(svgEl).append('path')
            .datum(probabilityDistributionPair.first)
            .attr('d', function(d) { return area(d); })
            .style('fill-opacity', 0.3)
            .style('stroke', 'none')
            .style('fill', firstCategoryfillColour);
       	d3.select(svgEl).append('path')
            .datum(probabilityDistributionPair.second)
            .attr('d', function(d) { return area(d); })
            .style('fill-opacity', 0.3)
            .style('stroke', 'none')
            .style('fill', secondCategoryfillColour);
	},

	// generateVisSpecMetadata

	computeQualityScoreAndThreshold: function(requiredInfo) {
		const self = LAKBDistributionHandler;
		let distributionAttribute = requiredInfo.distributionAttribute;
		let nominalAttribute = requiredInfo.nominalAttribute;
		let firstCategory = requiredInfo.firstCategory;
		let secondCategory = requiredInfo.secondCategory;

		let filteredDataByCategory = LookAheadDatabase.attributeToDataByCategory[nominalAttribute];
		let filteredFirstGroupObjects = filteredDataByCategory[firstCategory];
		let filteredSecondGroupObjects = filteredDataByCategory[secondCategory];

		let numberOfBins = self.computeNumberOfBins(filteredFirstGroupObjects, filteredSecondGroupObjects);
		let metadataForDistributionAttr = self.computeMetadata(filteredFirstGroupObjects, filteredSecondGroupObjects, distributionAttribute, numberOfBins);
		let binCountForDistributionAttr = self.computeBinCount(filteredFirstGroupObjects, filteredSecondGroupObjects, distributionAttribute, metadataForDistributionAttr, numberOfBins);
		let probDistPairForDistributionAttr = self.computeProbDistPair(binCountForDistributionAttr, metadataForDistributionAttr, numberOfBins);
		let meanInfoForDistributionAttr = self.computeMeanInfo(filteredFirstGroupObjects, filteredSecondGroupObjects, distributionAttribute, metadataForDistributionAttr, probDistPairForDistributionAttr);
		let bhCoefficientForDistributionAttr = self.computeBhCoefficient(probDistPairForDistributionAttr);
		let classProbabilities = self.computeClassProbabilities(filteredFirstGroupObjects, filteredSecondGroupObjects, probDistPairForDistributionAttr, meanInfoForDistributionAttr, bhCoefficientForDistributionAttr);
		let qualityScore = self.getQualityScore(classProbabilities);
		let threshold = self.getThreshold(classProbabilities);

		// store data
		requiredInfo.firstCategoryMean = meanInfoForDistributionAttr.firstGroupMean;
		requiredInfo.secondCategoryMean = meanInfoForDistributionAttr.secondGroupMean;

		return {
			thumbnailData: {
				nominalAttribute: nominalAttribute,
				firstCategory: firstCategory,
				secondCategory: secondCategory,
				probabilityDistributionPair: probDistPairForDistributionAttr,
			},
			qualityScore: qualityScore,
			threshold: threshold
		};
	},
	generateShortDescriptionHTML: function(requiredInfo) {
		let distributionAttribute = requiredInfo.distributionAttribute;
		let nominalAttribute = requiredInfo.nominalAttribute;
		let firstCategory = requiredInfo.firstCategory;
		let secondCategory = requiredInfo.secondCategory;
		let firstCategoryMean = requiredInfo.firstCategoryMean;
		let secondCategoryMean = requiredInfo.secondCategoryMean;
		let firstCategoryfillColour = Database.categoryToColourDictForEachNominalAttr[nominalAttribute][firstCategory];
		let secondCategoryfillColour = Database.categoryToColourDictForEachNominalAttr[nominalAttribute][secondCategory];
		let shortDescriptionHTML = null, finalFirstCategoryName = firstCategory, finalSecondCategoryName = secondCategory;

		if (firstCategory.toLowerCase() == 'yes' || firstCategory.toLowerCase() == 'no')
			finalFirstCategoryName = nominalAttribute + '=' + firstCategory;

		if (secondCategory.toLowerCase() == 'yes' || secondCategory.toLowerCase() == 'no')
			finalSecondCategoryName = nominalAttribute + '=' + secondCategory;

		if (firstCategoryMean > secondCategoryMean)
			shortDescriptionHTML = '<span style="font-family:Arial;color:' + firstCategoryfillColour + '">' + finalFirstCategoryName + '</span> ' +
								   'seems to have higher <span style="font-family:Arial;color:#707070">' + distributionAttribute + '</span> than ' +
								   '<span style="font-family:Arial;color:' + secondCategoryfillColour + '">' + finalSecondCategoryName + '</span>';

		if (firstCategoryMean < secondCategoryMean)
			shortDescriptionHTML = '<span style="font-family:Arial;color:' + secondCategoryfillColour + '">' + finalSecondCategoryName + '</span> ' +
								   'seems to have higher <span style="font-family:Arial;color:#707070">' + distributionAttribute + '</span> than ' +
								   '<span style="font-family:Arial;color:' + firstCategoryfillColour + '">' + finalFirstCategoryName + '</span> ';

		if (firstCategoryMean == secondCategoryMean)
			shortDescriptionHTML = '<span style="font-family:Arial;color:' + firstCategoryfillColour + '">' + finalFirstCategoryName + '</span> and ' +
								   '<span style="font-family:Arial;color:' + secondCategoryfillColour + '">' + finalSecondCategoryName + '</span> ' +
								   'seems to have different distribution in ' + 
								   '<span style="font-family:Arial;color:#707070">' + distributionAttribute + '</span>';
		

		return shortDescriptionHTML;
	},

	// helpers

	getTwoRequiredCategories: function(nominalAttribute, filterList) {
		let firstCategory = null;
		let secondCategory = null;

		for (let i = 0; i < filterList.length; i++) {
			let currentFilter = filterList[i];
			let currentAttributeName = currentFilter.attributeName;
			let currentAttributeType = currentFilter.type;
			let currentSelectedCategories = currentFilter.attributeValues;
			let requiredFilterFound = (currentAttributeName == nominalAttribute &&
									   currentAttributeType == 'nominal' &&
									   currentSelectedCategories.length == 2);

			if (requiredFilterFound)
				[ firstCategory, secondCategory ] = currentSelectedCategories;
		}

		return {
			firstCategory: firstCategory,
			secondCategory: secondCategory,
		};
	},
	computeNumberOfBins: function(firstGroupObjects, secondGroupObjects) {
		let numberOfBins = Math.ceil(Math.sqrt((firstGroupObjects.length + secondGroupObjects.length) / 2));

		if (numberOfBins > 20)
			numberOfBins = 20;

		return numberOfBins;
	},
	computeMetadata: function(firstGroupObjects, secondGroupObjects, distributionAttribute, numberOfBins) {
		let minValue = Infinity, maxValue = -Infinity;

		for (let i = 0; i < firstGroupObjects.length; i++) {
			let currentObject = firstGroupObjects[i];
			let currentValue = +currentObject[distributionAttribute];
			let currentValueIsMissing = (currentObject[distributionAttribute] === null);

			if (!currentValueIsMissing && currentValue < minValue)
				minValue = currentValue;
			if (!currentValueIsMissing && currentValue > maxValue)
				maxValue = currentValue;
		}

		for (let i = 0; i < secondGroupObjects.length; i++) {
			let currentObject = secondGroupObjects[i];
			let currentValue = +currentObject[distributionAttribute];
			let currentValueIsMissing = (currentObject[distributionAttribute] === null);

			if (!currentValueIsMissing && currentValue < minValue)
				minValue = currentValue;
			if (!currentValueIsMissing && currentValue > maxValue)
				maxValue = currentValue;
		}

		return {
			minValue: minValue, maxValue: maxValue,
			binSize: (maxValue - minValue) / numberOfBins
		}
	},
	computeBinCount: function(firstGroupObjects, secondGroupObjects, distributionAttribute, metadataForDistributionAttr, numberOfBins) {
		let binCountForDistributionAttr = { first: {}, second: {} };
		let minValue = metadataForDistributionAttr.minValue;
		let maxValue = metadataForDistributionAttr.maxValue;
		let binSize = metadataForDistributionAttr.binSize;

		for (let i = 0; i < numberOfBins; i++) {
			binCountForDistributionAttr.first[i] = 0;
			binCountForDistributionAttr.second[i] = 0;
		}

		for (let i = 0; i < firstGroupObjects.length; i++) {
			let currentObject = firstGroupObjects[i];
			let currentValue = +currentObject[distributionAttribute];
			let currentBinIndex = Math.floor((currentValue - minValue) / binSize);
			let currentValueIsMissing = (currentObject[distributionAttribute] === null);

			if (currentBinIndex >= numberOfBins)
				currentBinIndex = numberOfBins - 1;
			if (!currentValueIsMissing)
				binCountForDistributionAttr.first[currentBinIndex]++;
		}

		for (let i = 0; i < secondGroupObjects.length; i++) {
			let currentObject = secondGroupObjects[i];
			let currentValue = +currentObject[distributionAttribute];
			let currentBinIndex = Math.floor((currentValue - minValue) / binSize);
			let currentValueIsMissing = (currentObject[distributionAttribute] === null);

			if (currentBinIndex >= numberOfBins)
				currentBinIndex = numberOfBins - 1;
			if (!currentValueIsMissing)
				binCountForDistributionAttr.second[currentBinIndex]++;
		}

		return binCountForDistributionAttr;
	},
	computeProbDistPair: function(binCountForDistributionAttr, metadataForDistributionAttr, numberOfBins) {
		let probDistPairForDistributionAttr = { first: [], second: [] };
		let binIndexList = [];
		let firstGroupCountExcludingMissing = 0;
		let secondGroupCountExcludingMissing = 0;

		// init binIndexList
		for (let i = 0; i < numberOfBins; i++)
			binIndexList.push(i);

		// init firstGroupCountExcludingMissing and secondGroupCountExcludingMissing
		for (let binIndex in binCountForDistributionAttr.first)
			firstGroupCountExcludingMissing += binCountForDistributionAttr.first[binIndex];
		for (let binIndex in binCountForDistributionAttr.second)
			secondGroupCountExcludingMissing += binCountForDistributionAttr.second[binIndex];

		// convert to probDistPairForDistributionAttr
		for (let i = 0; i < binIndexList.length; i++) {
			let currentBinIndex = binIndexList[i];
			let allFirstGroupCounts = binCountForDistributionAttr.first;
			let allSecondGroupCounts = binCountForDistributionAttr.second;
			let firstGroupCountForCurrentBin = binCountForDistributionAttr.first[currentBinIndex];
			let secondGroupCountForCurrentBin = binCountForDistributionAttr.second[currentBinIndex];

			// store probability for first group
			if (currentBinIndex in allFirstGroupCounts)
				probDistPairForDistributionAttr.first.push(firstGroupCountForCurrentBin / firstGroupCountExcludingMissing);
			else
				probDistPairForDistributionAttr.first.push(0);

			// store probability for second group
			if (currentBinIndex in allSecondGroupCounts)
				probDistPairForDistributionAttr.second.push(secondGroupCountForCurrentBin / secondGroupCountExcludingMissing);
			else
				probDistPairForDistributionAttr.second.push(0);
		}

		return probDistPairForDistributionAttr;
	},
	computeMeanInfo: function(firstGroupObjects, secondGroupObjects, distributionAttribute, metadataForDistributionAttr, probDistPairForDistributionAttr) {
		let currentProbDistPair = probDistPairForDistributionAttr;
		let bothGroupsHaveOneObject = (firstGroupObjects.length == 1 && secondGroupObjects.length == 1);
		let minValue = bothGroupsHaveOneObject ? Database.rangeAndDecimalForEachQuantAttr[distributionAttribute].range.min : metadataForDistributionAttr.minValue;
		let maxValue = bothGroupsHaveOneObject ? Database.rangeAndDecimalForEachQuantAttr[distributionAttribute].range.max : metadataForDistributionAttr.maxValue;

		let firstGroupSum = 0;
		let firstGroupNormalizedSum = 0;
		let firstGroupCountExcludingMissing = 0;

		let secondGroupSum = 0;
		let secondGroupNormalizedSum = 0;
		let secondGroupCountExcludingMissing = 0;

		// compute firstGroupSum, firstGroupNormalizedSum and firstGroupCountExcludingMissing
		for (let i = 0; i < firstGroupObjects.length; i++) {
			let currentObject = firstGroupObjects[i];
			let currentValue = +currentObject[distributionAttribute];
			let currentValueIsMissing = (currentObject[distributionAttribute] === null);

			if (!currentValueIsMissing) {
				firstGroupSum += currentValue;
				firstGroupNormalizedSum += (maxValue == minValue) ? 0 : (currentValue - minValue) / (maxValue - minValue);
				firstGroupCountExcludingMissing++;
			}
		}

		// compute secondGroupSum, secondGroupNormalizedSum and secondGroupCountExcludingMissing
		for (let i = 0; i < secondGroupObjects.length; i++) {
			let currentObject = secondGroupObjects[i];
			let currentValue = +currentObject[distributionAttribute];
			let currentValueIsMissing = (currentObject[distributionAttribute] === null);

			if (!currentValueIsMissing) {
				secondGroupSum += currentValue;
				secondGroupNormalizedSum += (maxValue == minValue) ? 0 : (currentValue - minValue) / (maxValue - minValue);
				secondGroupCountExcludingMissing++;
			}
		}

		return {
			firstGroupMean: firstGroupSum / firstGroupCountExcludingMissing,
			secondGroupMean: secondGroupSum / secondGroupCountExcludingMissing,
			normalizedMeanDiff: Math.abs(firstGroupNormalizedSum / firstGroupCountExcludingMissing - secondGroupNormalizedSum / secondGroupCountExcludingMissing)
		};
	},
	computeBhCoefficient: function(probDistPairForDistributionAttr) {
		let bhCoefficient = 0;
		let allEqual = true;

		for (let i = 0; i < probDistPairForDistributionAttr.first.length; i++) {
			let firstGroupProbability = probDistPairForDistributionAttr.first[i];
			let secondGroupProbability = probDistPairForDistributionAttr.second[i];

			bhCoefficient += Math.sqrt(firstGroupProbability * secondGroupProbability);

			// hacky workaround for precision bug
			if (firstGroupProbability != secondGroupProbability)
				allEqual = false;
		}

		return (allEqual ? 1 : bhCoefficient);
	},
	computeClassProbabilities: function(firstGroupObjects, secondGroupObjects, probDistPairForDistributionAttr, meanInfoForDistributionAttr, bhCoefficientForDistributionAttr) {
		let bhCoefficient = bhCoefficientForDistributionAttr;
		let meanDifference = meanInfoForDistributionAttr.normalizedMeanDiff;
		let atLeastOneGroupHasOneObject = firstGroupObjects.length == 1 || secondGroupObjects.length == 1;
		let classDProbability = null, classNProbability = null, classSProbability = null;

		// at least only group has one object (compute using meanDiffOnly model)
		if (atLeastOneGroupHasOneObject) {
			let classDWeightedSum = meanDifference * 45.6985 - 5.4464;
			let classDExp = Math.exp(classDWeightedSum);
			let classNWeightedSum = meanDifference * 23.9107 - 1.9907;
			let classNExp = Math.exp(classNWeightedSum);

			classDProbability = classDExp / (1 + classDExp + classNExp);
			classNProbability = classNExp / (1 + classDExp + classNExp);
			classSProbability = 1 - classDProbability - classNProbability;
		}

		// both are groups (compute using bhAndMeanDiff model)
		if (!atLeastOneGroupHasOneObject) {
			let classDWeightedSum = bhCoefficient * -50.6583 + meanDifference * 36.204 + 40.0443;
			let classDExp = Math.exp(classDWeightedSum);
			let classNWeightedSum = bhCoefficient * -30.0439 + meanDifference * 17.9018 + 26.2568;
			let classNExp = Math.exp(classNWeightedSum);

			classDProbability = classDExp / (1 + classDExp + classNExp);
			classNProbability = classNExp / (1 + classDExp + classNExp);
			classSProbability = 1 - classDProbability - classNProbability;
		}

		return {
			classD: classDProbability,
			classN: classNProbability,
			classS: classSProbability
		};
	},
	getQualityScore: function(classProbabilities) {
		return classProbabilities.classD;
	},
	getThreshold: function(classProbabilities) {
		let maxProbability = -Infinity;

		for (let className in classProbabilities)
			if (classProbabilities[className] > maxProbability)
				maxProbability = classProbabilities[className];

		return maxProbability;
	}
}