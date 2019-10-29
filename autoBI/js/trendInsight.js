const TrendInsight = {
	insightList: null,
	visList: null,
	threshold: null,

	search: function() {
		const self = this;
		let dataByAttrByTimeStep = self.getDataByAttrByTimeStep();
		let timeSeriesList = self.generateTimeSeriesList(dataByAttrByTimeStep);
		let increasingTrendInsightList = self.getIncreasingTrendInsights(timeSeriesList);
		let decreasingTrendInsightList = self.getDecreasingTrendInsights(timeSeriesList);
		let insightList = increasingTrendInsightList.concat(decreasingTrendInsightList);
		self.insightList = insightList;
	},
	generateVis: function() {
		const self = this;
		let insightList = self.insightList;
		let visList = [];

		for (let i = 0; i < insightList.length; i++) {
			let currentInsight = insightList[i];
			let description = self.generateDescription(currentInsight);
			let VLSpec = self.generateVLSpec(currentInsight);
			
			visList.push({
				insightSpec: currentInsight,
				VLSpec: VLSpec,
				description: description,
				score: currentInsight.data.score
			});
		}

		self.visList = visList;
	},
	storeVis: function() {
		const self = this;
		let visList = self.visList;

		InsightHandler.visList = InsightHandler.visList.concat(visList);
	},

	// search

	getDataByAttrByTimeStep: function() {
		const self = this;
		let dataByAttrByTimeStep = self.initDataByAttrByTimeStep();
		let data = Database.data;

		for (let i = 0; i < data.length; i++)
			for (let currentAttribute in dataByAttrByTimeStep) {
				let currentRow = data[i];
				let currentValue = currentRow[currentAttribute];
				let currentValueIsMissing = (currentValue === null);

				if (!currentValueIsMissing)
					dataByAttrByTimeStep[currentAttribute][currentValue].push(currentRow);
			}

		return dataByAttrByTimeStep;
	},
	generateTimeSeriesList: function(dataByAttrByTimeStep) {
		const self = this;
		let timeSeriesList = [];

		timeSeriesList = self.initTimeSeriesList(dataByAttrByTimeStep);
		timeSeriesList = self.computeMeanForTimeSeriesObject(dataByAttrByTimeStep, timeSeriesList);
		timeSeriesList = self.generateTimeSeriesArray(timeSeriesList);
		
		return timeSeriesList;
	},
	getIncreasingTrendInsights: function(timeSeriesList) {
		let increasingTrendInsightList = [];

		for (let i = 0; i < timeSeriesList.length; i++) {
			let timeSeries = timeSeriesList[i].timeSeriesArray;
			let temporalAttribute = timeSeriesList[i].originalTemporalAttributeName;
			let quantitativeAttribute = timeSeriesList[i].quantitativeAttribute;
			let timeUnit = timeSeriesList[i].timeUnit;

			let numberOfTimeStepsMinusOne = timeSeries.length - 1;
			let numberOfStepsGreaterThanFirst = 0;
			let numberOfStepsLessThanLast = 0;
			let numberOfIncreasingPeriod = 0;
			let firstValue = timeSeries[0];
			let lastValue = timeSeries[timeSeries.length - 1];

			for (let j = 0; j < timeSeries.length; j++) {
				let currentValue = timeSeries[j];
				let previousValue = (j >= 1) ? timeSeries[j - 1] : Infinity;
				let percentageChange = (j >= 1) ? ((currentValue - previousValue) / previousValue) : 0;

				if (currentValue > firstValue) numberOfStepsGreaterThanFirst++;
				if (currentValue < firstValue) numberOfStepsLessThanLast++;
				if (percentageChange > 0.05) numberOfIncreasingPeriod++; // only consider strong increasing
			}

			if ((numberOfStepsLessThanLast / numberOfTimeStepsMinusOne > 0.7) &&
				(numberOfStepsGreaterThanFirst / numberOfTimeStepsMinusOne > 0.7) && 
				(lastValue > firstValue)) // is increasing
				increasingTrendInsightList.push({
					type: 'trend',
					quantitativeAttrList: [ quantitativeAttribute ],
					temporalAttrList: [ temporalAttribute ],
					ordinalAttrList: [],
					nominalAttrList: [],
					data: { 
						score: numberOfIncreasingPeriod / numberOfTimeStepsMinusOne,
						isIncreasing: true,
						timeUnit: timeUnit
					}
				});
		}

		return increasingTrendInsightList;
	},
	getDecreasingTrendInsights: function(timeSeriesList) {
		let decreasingTrendInsightList = [];

		for (let i = 0; i < timeSeriesList.length; i++) {
			let timeSeries = timeSeriesList[i].timeSeriesArray;
			let temporalAttribute = timeSeriesList[i].originalTemporalAttributeName;
			let quantitativeAttribute = timeSeriesList[i].quantitativeAttribute;
			let timeUnit = timeSeriesList[i].timeUnit;

			let numberOfTimeStepsMinusOne = timeSeries.length - 1;
			let numberOfStepsLessThanFirst = 0;
			let numberOfStepsGreaterThanLast = 0;
			let numberOfDecreasingPeriod = 0;
			let firstValue = timeSeries[0];
			let lastValue = timeSeries[timeSeries.length - 1];

			for (let j = 0; j < timeSeries.length; j++) {
				let currentValue = timeSeries[j];
				let previousValue = (j >= 1) ? timeSeries[j - 1] : -Infinity;
				let percentageChange = (j >= 1) ? ((currentValue - previousValue) / previousValue) : 0;

				if (currentValue < firstValue) numberOfStepsLessThanFirst++;
				if (currentValue > lastValue) numberOfStepsGreaterThanLast++;
				if (percentageChange < -0.05) numberOfDecreasingPeriod++; // only consider strong decreasing
			}

			if ((numberOfStepsLessThanFirst / numberOfTimeStepsMinusOne > 0.7) &&
				(numberOfStepsGreaterThanLast / numberOfTimeStepsMinusOne > 0.7) &&
				(firstValue > lastValue)) // is decreasing
				decreasingTrendInsightList.push({
					type: 'trend',
					quantitativeAttrList: [ quantitativeAttribute ],
					temporalAttrList: [ temporalAttribute ],
					ordinalAttrList: [],
					nominalAttrList: [],
					data: {
						score: numberOfDecreasingPeriod / numberOfTimeStepsMinusOne,
						isIncreasing: false,
						timeUnit: timeUnit
					}
				});
		}

		return decreasingTrendInsightList;
	},

	// getDataByAttrByTimeStep

	initDataByAttrByTimeStep: function() {
		let dataByAttrByTimeStep = {};
		let attributeMetadata = Database.attributeMetadata;
		let temporalAttrList = Database.getAttributeList('temporal-generated');

		for (let i = 0; i < temporalAttrList.length; i++) {
			let attributeName = temporalAttrList[i];
			let uniqueTimeSteps = attributeMetadata[attributeName].uniqueValues;
			let tooFewUniqueTimeSteps = uniqueTimeSteps.length < 3;
			if (tooFewUniqueTimeSteps) continue; // filter out some temporal attributes

			dataByAttrByTimeStep[attributeName] = {};

			for (let j = 0; j < uniqueTimeSteps.length; j++) {
				let timeStep = uniqueTimeSteps[j];
				dataByAttrByTimeStep[attributeName][timeStep] = []
			}
		}

		return dataByAttrByTimeStep;
	},

	// generateTimeSeriesList

	initTimeSeriesList: function(dataByAttrByTimeStep) {
		let timeSeriesList = [];
		let attributeMetadata = Database.attributeMetadata;
		let quantitativeAttrList = Database.getAttributeList('quantitative');

		for (let temporalAttribute in dataByAttrByTimeStep)
			for (let i = 0; i < quantitativeAttrList.length; i++) {
				let quantitativeAttribute = quantitativeAttrList[i];
				let uniqueTimeSteps = attributeMetadata[temporalAttribute].uniqueValues;
				let originalTemporalAttributeName = attributeMetadata[temporalAttribute].originalName;
				let timeUnit = attributeMetadata[temporalAttribute].timeUnit;

				timeSeriesList.push({
					temporalAttribute: temporalAttribute,
					quantitativeAttribute: quantitativeAttribute,
					uniqueTimeSteps: uniqueTimeSteps,
					originalTemporalAttributeName: originalTemporalAttributeName,
					timeUnit: timeUnit,
					timeSeriesObject: {},
					timeSeriesArray: []
				});
			}

		return timeSeriesList;
	},
	computeMeanForTimeSeriesObject: function(dataByAttrByTimeStep, timeSeriesList) {
		for (let i = 0; i < timeSeriesList.length; i++) {
			let temporalAttribute = timeSeriesList[i].temporalAttribute;
			let quantitativeAttribute = timeSeriesList[i].quantitativeAttribute;
			let timeSeriesObject = timeSeriesList[i].timeSeriesObject;

			for (let timeStep in dataByAttrByTimeStep[temporalAttribute]) {
				let dataForCurrentStep = dataByAttrByTimeStep[temporalAttribute][timeStep];
				let meanForCurrentStep = computeMean(dataForCurrentStep, quantitativeAttribute);
				timeSeriesObject[timeStep] = meanForCurrentStep;
			}
		}

		return timeSeriesList;
	},
	generateTimeSeriesArray: function(timeSeriesList) {
		for (let i = 0; i < timeSeriesList.length; i++) {
			let uniqueTimeSteps = timeSeriesList[i].uniqueTimeSteps; // sorted
			let timeSeriesObject = timeSeriesList[i].timeSeriesObject;
			let timeSeriesArray = timeSeriesList[i].timeSeriesArray;

			for (let j = 0; j < uniqueTimeSteps.length; j++) {
				let currentTimeStep = uniqueTimeSteps[j];
				let currentMean = timeSeriesObject[currentTimeStep];
				timeSeriesArray.push(currentMean);
			}
		}

		return timeSeriesList;
	},

	// generateVis

	generateDescription: function(insight) {
		let quantitativeAttribute = insight.quantitativeAttrList[0];
		let isIncreasing = insight.data.isIncreasing;
		let isDecreasing = !insight.data.isIncreasing;
		let timeUnit = insight.data.timeUnit;

		if (isIncreasing) 
			return '<span class="attribute-name">' + quantitativeAttribute + '</span> seems to be increasing over the ' + timeUnit + 's.';
		if (isDecreasing) 
			return '<span class="attribute-name">' + quantitativeAttribute + '</span> seems to be decreasing over the ' + timeUnit + 's.';
	},
	generateVLSpec: function(insight) {
		let VLSpec = {
			$schema: "https://vega.github.io/schema/vega-lite/v4.json",
			data: { values: Database.data },
			width: 200,
			height: 200,
			mark: { type: 'line', tooltip: true },
			encoding: {
			    x: { field: insight.temporalAttrList[0], type: 'temporal', timeUnit: insight.data.timeUnit },
		    	y: { field: insight.quantitativeAttrList[0], type: 'quantitative', aggregate: 'mean' }
		  	}
		}

		return VLSpec;
	}
}