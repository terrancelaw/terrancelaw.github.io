const LAKBTrendHandler = {
	isCurrentSpecIncreasingTrend: null,
	isCurrentSpecDecreasingTrend: null,

	generateVisSpecMetadata: function(visSpec) {
		const self = LAKBTrendHandler;
		let temporalAttribute = (visSpec.x.type == 'temporal') ? visSpec.x.attributeName : visSpec.y.attributeName;
		let quantitativeAttribute = (visSpec.x.type == 'quantitative') ? visSpec.x.attributeName : visSpec.y.attributeName;
		let timeUnit = (visSpec.x.type == 'temporal') ? visSpec.x.timeUnit : visSpec.y.timeUnit;
		let requiredInfo = {};
		let visSpecMetadata = null;

		requiredInfo.temporalAttribute = temporalAttribute;
		requiredInfo.quantitativeAttribute = quantitativeAttribute;
		requiredInfo.timeUnit = timeUnit;
		visSpecMetadata = self.computeQualityScoreAndThreshold(requiredInfo);
		visSpecMetadata.shortDescriptionHTML = self.generateShortDescriptionHTML(requiredInfo);
		visSpecMetadata.renderThumbnail = self.renderThumbnail;

		return visSpecMetadata;
	},
	renderThumbnail: function(svgEl, thumbnailData) {
		let timeSeriesArray = thumbnailData.timeSeriesArray;

		let chartHeight = 50, chartWidth = 60;
		let numberOfTimePoints = timeSeriesArray.length;
		let minValue = d3.min(timeSeriesArray);
		let maxValue = d3.max(timeSeriesArray);

		let xScale = d3.scaleLinear()
            .domain([ 0, numberOfTimePoints - 1 ])
            .range([ 0, chartWidth ]);
        let yScale = d3.scaleLinear()
            .domain([ minValue, maxValue ])
            .range([ chartHeight * 0.8, chartHeight * 0.2 ]);
        var line = d3.line()
   			.x(function(d, i) { return xScale(i); })
   			.y(function(d) { return yScale(d); })
   			.curve(d3.curveMonotoneX);

		d3.select(svgEl)
        	.style('width', chartWidth)
        	.style('height', chartHeight);
       	d3.select(svgEl)
       		.append('path')
       		.datum(timeSeriesArray)
        	.attr('d', line)
        	.style('stroke', 'steelblue')
        	.style('stroke-width', 2)
        	.style('opacity', 0.6)
        	.style('fill', 'none');
	},

	// generateVisSpecMetadata

	computeQualityScoreAndThreshold: function(requiredInfo) {
		const self = LAKBTrendHandler;
		let temporalAttribute = requiredInfo.temporalAttribute;
		let quantitativeAttribute = requiredInfo.quantitativeAttribute;
		let timeUnit = requiredInfo.timeUnit;
		let timeVariableName = temporalAttribute + ' (' + timeUnit + ')';

		let filteredDataByTimePoint = LookAheadDatabase.attributeToDataByCategory[timeVariableName];
		let timeSeriesArray = self.generateTimeSeriesArray(filteredDataByTimePoint, quantitativeAttribute);
		let isCurrentSpecIncreasingTrend = self.checkIsIncreasingTrend(timeSeriesArray);
		let isCurrentSpecDecreasingTrend = self.checkIsDecreasingTrend(timeSeriesArray);
		let isDifferenceLargeEnough = self.checkIsDifferenceLargeEnough(timeSeriesArray);
		let qualityScore = null, threshold = null;

		if ((isCurrentSpecIncreasingTrend && isDifferenceLargeEnough) || 
			(isCurrentSpecDecreasingTrend && isDifferenceLargeEnough))
			[ qualityScore, threshold ] = [ 1, 0 ];
		if (!(isCurrentSpecIncreasingTrend && isDifferenceLargeEnough) && 
			!(isCurrentSpecDecreasingTrend && isDifferenceLargeEnough))
			[ qualityScore, threshold ] = [ 0, 1 ];
		
		// store data
		requiredInfo.isCurrentSpecIncreasingTrend = isCurrentSpecIncreasingTrend;
		requiredInfo.isCurrentSpecDecreasingTrend = isCurrentSpecDecreasingTrend;

		return {
			thumbnailData: {
				timeSeriesArray: timeSeriesArray,
			},
			qualityScore: qualityScore,
			threshold: threshold
		};
	},
	generateShortDescriptionHTML: function(requiredInfo) {
		let quantitativeAttribute = requiredInfo.quantitativeAttribute;
		let isCurrentSpecIncreasingTrend = requiredInfo.isCurrentSpecIncreasingTrend;
		let isCurrentSpecDecreasingTrend = requiredInfo.isCurrentSpecDecreasingTrend;
		let shortDescriptionHTML = null;

		if (isCurrentSpecIncreasingTrend)
			shortDescriptionHTML = 'Trend of <span style="font-family:Arial;color:#707070">' + quantitativeAttribute + '</span> seems to be increasing';
		if (isCurrentSpecDecreasingTrend)
			shortDescriptionHTML = 'Trend of <span style="font-family:Arial;color:#707070">' + quantitativeAttribute + '</span> seems to be decreasing';

		return shortDescriptionHTML;
	},

	// helpers

	generateTimeSeriesArray: function(filteredDataByTimePoint, quantitativeAttribute) {
		let orderedTimePointArray = [];
		let timeSeriesArray = [];
		let meanValuesByTimePoints = {};

		// compute means
		for (let currentTimePoint in filteredDataByTimePoint) {
			let dataForCurrentTimePoint = filteredDataByTimePoint[currentTimePoint];
			let totalNumberOfNonMissingValues = 0;
			meanValuesByTimePoints[currentTimePoint] = 0;

			for (let i = 0; i < dataForCurrentTimePoint.length; i++) {
				let currentRow = dataForCurrentTimePoint[i];
				let currentRowValue = currentRow[quantitativeAttribute]
				let isCurrentValueMissing = (currentRowValue === null);

				if (!isCurrentValueMissing) {
					totalNumberOfNonMissingValues++;
					meanValuesByTimePoints[currentTimePoint] += +currentRowValue;
				}
			}

			meanValuesByTimePoints[currentTimePoint] = meanValuesByTimePoints[currentTimePoint] / totalNumberOfNonMissingValues;
			orderedTimePointArray.push(+currentTimePoint); // no missing time points (see optimizer)
		}

		// generate time series
		orderedTimePointArray.sort();

		for (let i = 0; i < orderedTimePointArray.length; i++) {
			let currentTimePoint = orderedTimePointArray[i];
			let currentMeanValue = meanValuesByTimePoints[currentTimePoint];
			timeSeriesArray.push(currentMeanValue);
		}

		return timeSeriesArray;
	},
	checkIsIncreasingTrend: function(timeSeriesArray) {
		let numberOfTimePointsMinusOne = timeSeriesArray.length - 1;
		let numberOfPointsGreaterThanFirst = 0;
		let numberOfPointsLessThanLast = 0;
		let firstPointValue = timeSeriesArray[0];
		let lastPointValue = timeSeriesArray[timeSeriesArray.length - 1];
		let isIncreasing = false;

		for (let i = 0; i < timeSeriesArray.length; i++) {
			let currentValue = timeSeriesArray[i];

			if (currentValue > firstPointValue)
				numberOfPointsGreaterThanFirst++;
			if (currentValue < lastPointValue)
				numberOfPointsLessThanLast++;
		}

		if ((numberOfPointsLessThanLast / numberOfTimePointsMinusOne > 0.7) &&
			(numberOfPointsGreaterThanFirst / numberOfTimePointsMinusOne > 0.7) && 
			(lastPointValue > firstPointValue))
			isIncreasing = true;

		return isIncreasing;
	},
	checkIsDecreasingTrend: function(timeSeriesArray) {
		let numberOfTimePointsMinusOne = timeSeriesArray.length - 1;
		let numberOfPointsLessThanFirst = 0;
		let numberOfPointsGreaterThanLast = 0;
		let firstPointValue = timeSeriesArray[0];
		let lastPointValue = timeSeriesArray[timeSeriesArray.length - 1];
		let isDecreasing = false;

		for (let i = 0; i < timeSeriesArray.length; i++) {
			let currentValue = timeSeriesArray[i];

			if (currentValue < firstPointValue)
				numberOfPointsLessThanFirst++;
			if (currentValue > lastPointValue)
				numberOfPointsGreaterThanLast++;
		}

		if ((numberOfPointsLessThanFirst / numberOfTimePointsMinusOne > 0.7) &&
			(numberOfPointsGreaterThanLast / numberOfTimePointsMinusOne > 0.7) &&
			(firstPointValue > lastPointValue))
			isDecreasing = true;

		return isDecreasing;
	},
	checkIsDifferenceLargeEnough: function(timeSeriesArray) {
		let firstPointValue = timeSeriesArray[0];
		let lastPointValue = timeSeriesArray[timeSeriesArray.length - 1];
		let largerValue = (lastPointValue > firstPointValue) ? lastPointValue : firstPointValue;
		let smallerValue = (lastPointValue < firstPointValue) ? lastPointValue : firstPointValue;
		let relativeChange = Math.abs((largerValue - smallerValue) / smallerValue);

		if (relativeChange > 0.05)
			return true;
		if (relativeChange <= 0.05)
			return false;
	}
}