const LAKBSlopeHandler = {
	generateVisSpecMetadata: function(visSpec) {
		const self = LAKBSlopeHandler;
		let xAttribute = visSpec.x.attributeName;
		let yAttribute = visSpec.y.attributeName;
		let nominalAttribute = visSpec.color.attributeName;
		let requiredInfo = {};
		let visSpecMetadata = null;

		requiredInfo.xAttribute = xAttribute;
		requiredInfo.yAttribute = yAttribute;
		requiredInfo.nominalAttribute = nominalAttribute;
		visSpecMetadata = self.computeQualityScoreAndThreshold(requiredInfo);
		visSpecMetadata.shortDescriptionHTML = self.generateShortDescriptionHTML(requiredInfo);
		visSpecMetadata.renderThumbnail = self.renderThumbnail;

		return visSpecMetadata;
	},
	renderThumbnail: function(svgEl, thumbnailData) {
		const self = LAKBSlopeHandler;
		let nominalAttribute = thumbnailData.nominalAttribute;
		let xAttribute = thumbnailData.xAttribute;
		let yAttribute = thumbnailData.yAttribute;
		let regressionParamForEachCategory = thumbnailData.regressionParamForEachCategory;

		let chartHeight = 50, chartWidth = 60;
		let endPointsOnEachTrendLine = self.generateEndPointsOnEachTrendLine(regressionParamForEachCategory, xAttribute, yAttribute);

		let xScale = d3.scaleLinear()
            .domain([ xAttribute.min, xAttribute.max ])
            .range([ 0, chartWidth ]);
        let yScale = d3.scaleLinear()
            .domain([ yAttribute.min, yAttribute.max ])
            .range([ chartHeight, 0 ]);

		d3.select(svgEl)
        	.style('width', chartWidth)
        	.style('height', chartHeight);

        for (let currentCategory in endPointsOnEachTrendLine) {
        	let firstEndPoints = endPointsOnEachTrendLine[currentCategory][0];
        	let secondEndPoints = endPointsOnEachTrendLine[currentCategory][1];
        	let strokeColour = Database.categoryToColourDictForEachNominalAttr[nominalAttribute][currentCategory];

        	d3.select(svgEl)
        		.append('line')
        		.attr('x1', xScale(firstEndPoints.x))
        		.attr('y1', yScale(firstEndPoints.y))
        		.attr('x2', xScale(secondEndPoints.x))
        		.attr('y2', yScale(secondEndPoints.y))
        		.style('stroke', strokeColour)
        		.style('stroke-width', 3)
        		.style('stroke-linecap', 'round')
        		.style('opacity', 0.5)
        		.style('fill', 'none');
        }
	},

	// generateVisSpecMetadata
	
	computeQualityScoreAndThreshold: function(requiredInfo) {
		let self = LAKBSlopeHandler;
		let xAttribute = requiredInfo.xAttribute;
		let yAttribute = requiredInfo.yAttribute;
		let nominalAttribute = requiredInfo.nominalAttribute;

		let xAttributeMin = LookAheadDatabase.minMaxForEachAttribute[xAttribute].min;
		let yAttributeMin = LookAheadDatabase.minMaxForEachAttribute[yAttribute].min;
		let xAttributeMax = LookAheadDatabase.minMaxForEachAttribute[xAttribute].max;
		let yAttributeMax = LookAheadDatabase.minMaxForEachAttribute[yAttribute].max;
		let filteredDataByCategories = LookAheadDatabase.attributeToDataByCategory[nominalAttribute];
		let pointsForEachCategory = self.generatePointsForEachCategory(filteredDataByCategories, xAttribute, yAttribute);
		let regressionParamForEachCategory = self.computeRegressionParamForEachCategory(pointsForEachCategory);
		let anomalousCategoryName = self.getAnomalousCategoryName(regressionParamForEachCategory, xAttributeMax, yAttributeMax);
		let qualityScore = null, threshold = null;

		if (anomalousCategoryName !== null)
			[ qualityScore, threshold ] = [ 0.5, 0 ];
		if (anomalousCategoryName === null)
			[ qualityScore, threshold ] = [ 0, 1 ];

		// store data
		requiredInfo.anomalousCategoryName = anomalousCategoryName;

		return {
			thumbnailData: {
				nominalAttribute: nominalAttribute,
				xAttribute: { min: xAttributeMin, max: xAttributeMax },
				yAttribute: { min: yAttributeMin, max: yAttributeMax },
				regressionParamForEachCategory: regressionParamForEachCategory
			},
			qualityScore: qualityScore,
			threshold: threshold
		};
	},
	generateShortDescriptionHTML: function(requiredInfo) {
		let xAttribute = requiredInfo.xAttribute;
		let yAttribute = requiredInfo.yAttribute;
		let nominalAttribute = requiredInfo.nominalAttribute;
		let anomalousCategoryName = requiredInfo.anomalousCategoryName;
		let anomalousCategoryColour = Database.categoryToColourDictForEachNominalAttr[nominalAttribute][anomalousCategoryName];
		let shortDescriptionHTML = null, finalAnomalousCategoryString = anomalousCategoryName;

		if (anomalousCategoryName !== null)
			if (anomalousCategoryName.toLowerCase() == 'yes' || anomalousCategoryName.toLowerCase() == 'no')
				finalAnomalousCategoryString = nominalAttribute + '=' + anomalousCategoryName;

		shortDescriptionHTML = 'Slope of <span style="font-family:Arial;color:' + anomalousCategoryColour + '">' + finalAnomalousCategoryString + '</span> ' + 
							   'looks anomalous in the <span style="font-family:Arial;color:#707070">' + xAttribute + '</span> vs. ' +
							   '<span style="font-family:Arial;color:#707070">' + yAttribute + '</span> plot';

		return shortDescriptionHTML;
	},

	// renderThumbnail

	generateEndPointsOnEachTrendLine: function(regressionParamForEachCategory, xAttribute, yAttribute) {
		let endPointsOnEachTrendLine = {};

		for (let currentCategory in regressionParamForEachCategory) {
			let currentSlope = regressionParamForEachCategory[currentCategory].slope;
			let currentYIntercept = regressionParamForEachCategory[currentCategory].yIntercept;
			let currentEndPoints = [];

			let point1 = { x: xAttribute.min, y: currentSlope * xAttribute.min + currentYIntercept };
			let point2 = { x: xAttribute.max, y: currentSlope * xAttribute.max + currentYIntercept };
			let point3 = { x: (yAttribute.min - currentYIntercept) / currentSlope, y: yAttribute.min };
			let point4 = { x: (yAttribute.max - currentYIntercept) / currentSlope, y: yAttribute.max };
			let possibleEndPoints = [ point1, point2, point3, point4 ];

			for (let j = 0; j < possibleEndPoints.length; j++)
				if (possibleEndPoints[j].x >= xAttribute.min && possibleEndPoints[j].x <= xAttribute.max && 
					possibleEndPoints[j].y >= yAttribute.min && possibleEndPoints[j].y <= yAttribute.max)
					currentEndPoints.push(possibleEndPoints[j]);

			endPointsOnEachTrendLine[currentCategory] = currentEndPoints; // should have only two points
		}

		return endPointsOnEachTrendLine;
	},

	// helpers

	generatePointsForEachCategory: function(dataByCategories, xAttribute, yAttribute) {
		let pointsForEachCategory = {};

		for (let currentCategory in dataByCategories) {
			let pointsForCurrentCategory = [];

			for (let i = 0; i < dataByCategories[currentCategory].length; i++) {
				let currentRow = dataByCategories[currentCategory][i];
				let currentXValue = currentRow[xAttribute];
				let currentYValue = currentRow[yAttribute];
				let isAtLeastOneAxisValueMissing = (currentXValue === null || currentYValue === null);

				if (!isAtLeastOneAxisValueMissing)
					pointsForCurrentCategory.push([ +currentXValue, +currentYValue ]);
			}

			pointsForEachCategory[currentCategory] = pointsForCurrentCategory;
		}

		return pointsForEachCategory;
	},
	computeRegressionParamForEachCategory: function(pointsForEachCategory) {
		let regressionParamForEachCategory = {};

		for (let currentCategory in pointsForEachCategory) {
			let pointsForCurrentCategory = pointsForEachCategory[currentCategory];
			let parameters = null, slope = null, yIntercept = null;

			// save only if there are more than two points
			if (pointsForCurrentCategory.length >= 2) {
				parameters = Regression.linear(pointsForCurrentCategory);
				slope = parameters.equation[0];
				yIntercept = parameters.equation[1];
				regressionParamForEachCategory[currentCategory] = {
					slope: slope,
					yIntercept: yIntercept
				};
			}
		}

		return regressionParamForEachCategory;
	},
	computeAxisAttributeMinMax: function(pointsForEachCategory, axis) {
		let min = Infinity, max = -Infinity;
		let index = (axis == 'x') ? 0 : 1;

		for (let currentCategory in pointsForEachCategory)
			for (let i = 0; i < pointsForEachCategory[currentCategory].length; i++) {
				let currentValue = pointsForEachCategory[currentCategory][i][index];
				if (currentValue < min) min = currentValue;
				if (currentValue > max) max = currentValue;
			}

		return [ min, max ];
	},
	getAnomalousCategoryName: function(regressionParamForEachCategory, xAttributeMax, yAttributeMax) {
		let categoryList = Object.keys(regressionParamForEachCategory);
		let numberOfCategories = categoryList.length;
		let allAnomalousCategories = [];
		let anomalousCategoriesWithLargestAbsSlope = null;
		let largestAngleDiffOfAnomalousCategories = -Infinity;

		if (numberOfCategories == 1)
			return null;
		if (xAttributeMax >= yAttributeMax && xAttributeMax / yAttributeMax > 10)
			return null;
		if (yAttributeMax >= xAttributeMax && yAttributeMax / xAttributeMax > 10)
			return null;

		for (let currentCategory in regressionParamForEachCategory) {
			let slopeForCurrentCategory = regressionParamForEachCategory[currentCategory].slope;
			let largeAngleDifference = true;
			let alwaysGreaterThanOthers = true;
			let alwaysLessThanOthers = true;

			for (let otherCategory in regressionParamForEachCategory)
				if (currentCategory != otherCategory) {
					let slopeForOtherCategory = regressionParamForEachCategory[otherCategory].slope;
					let tan = Math.abs((slopeForCurrentCategory - slopeForOtherCategory) / (1 + slopeForCurrentCategory * slopeForOtherCategory));
					let angleDifferenceInRad = Math.atan(tan);
					let angleDifference = angleDifferenceInRad / Math.PI * 180;

					if (slopeForCurrentCategory >= slopeForOtherCategory) alwaysLessThanOthers = false;
					if (slopeForCurrentCategory <= slopeForOtherCategory) alwaysGreaterThanOthers = false;
					if (angleDifference < 25.5) largeAngleDifference = false;
					if (!largeAngleDifference || !(alwaysLessThanOthers || alwaysGreaterThanOthers)) break;
				}

			if (largeAngleDifference && (alwaysLessThanOthers || alwaysGreaterThanOthers))
				allAnomalousCategories.push(currentCategory);
		}

		if (allAnomalousCategories.length == 1)
			return allAnomalousCategories[0];

		if (allAnomalousCategories.length != 1)
			return null;
	}
}