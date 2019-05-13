const TimeSeriesOperator = {
	dataForEachCategory: {},
	meansForForEachPeriod: {},
	timeSeriesForEachCategory: {},
	interestingTimeSeries: [], // { category, measure }

	getDataForEachCategory: function(dimension, categories) {
		const self = this;
		let dataForEachCategory = self.initDataForEachCategory(categories);

		for (let i = 0; i < Database.data.length; i++) {
			let currentObject = Database.data[i];
			let currentObjectCategory = currentObject[dimension].category;
			let currentObjectPeriod = currentObject.Period.category;

			if (currentObjectCategory in dataForEachCategory)
				dataForEachCategory[currentObjectCategory][currentObjectPeriod].push(currentObject);
		}

		self.dataForEachCategory = dataForEachCategory;
	},
	computeMeansForEachPeriod: function(measures) {
		const self = this;
		let dataForEachCategory = self.dataForEachCategory;
		let meansForForEachPeriod = self.initMeansForForEachPeriod(measures);

		for (let category in meansForForEachPeriod)
			for (let period in meansForForEachPeriod[category])
				for (let measure in meansForForEachPeriod[category][period])
					meansForForEachPeriod[category][period][measure] = self.generateOneMean(dataForEachCategory[category][period], measure);

		self.meansForForEachPeriod = meansForForEachPeriod;
	},
	generateTimeSeriesForEachCategory: function(measures) {
		const self = this;
		let meansForForEachPeriod = self.meansForForEachPeriod;
		let periodList = Database.periodList;
		let timeSeriesForEachCategory = self.initTimeSeriesForEachCategory(measures);

		for (let category in timeSeriesForEachCategory)
			for (let measure in timeSeriesForEachCategory[category])
				for (let i = 0; i < periodList.length; i++) {
					let period = periodList[i];
					let currentMean = meansForForEachPeriod[category][period][measure];
					let currentMeanIsMissing = isNaN(currentMean);

					if (!currentMeanIsMissing)
						timeSeriesForEachCategory[category][measure].data.push(currentMean);
					if (currentMeanIsMissing)
						timeSeriesForEachCategory[category][measure].data.push(null);
				}

		self.timeSeriesForEachCategory = timeSeriesForEachCategory;
	},
	interpolateForMissingValues: function() {
		const self = this;
		let timeSeriesForEachCategory = self.timeSeriesForEachCategory;

		for (let category in timeSeriesForEachCategory)
			for (let measure in timeSeriesForEachCategory[category])
				for (let i = 0; i < timeSeriesForEachCategory[category][measure].data.length; i++) {
					let currentMean = timeSeriesForEachCategory[category][measure].data[i];
					let currentValueIsMissing = (currentMean === null);

					if (currentValueIsMissing) {
						let timeSeries = timeSeriesForEachCategory[category][measure].data;
						let currentIndex = i;
						let nonMissingValueBefore = self.getNonMissingValueBefore(timeSeries, currentIndex);
						let nonMissingValueAfter = self.getNonMissingValueAfter(timeSeries, currentIndex);
						let interpolatedValue = (nonMissingValueBefore + nonMissingValueAfter) / 2;
						timeSeriesForEachCategory[category][measure].data[i] = interpolatedValue;
					}
				}
	},
	detectTrendForEachTimeSeries: function() {
		const self = this;
		let interestingTimeSeries = [];
		let timeSeriesForEachCategory = self.timeSeriesForEachCategory;

		for (let category in timeSeriesForEachCategory)
			for (let measure in timeSeriesForEachCategory[category]) {
				let timeSeries = timeSeriesForEachCategory[category][measure].data;
				let trendIsIncreasing = self.checkIsIncreasingTrend(timeSeries);
				let trendIsDecreasing = self.checkIsDecreasingTrend(timeSeries);
				let differenceIsLargeEnough = self.checkIsDifferenceLargeEnough(timeSeries);

				if (trendIsIncreasing && differenceIsLargeEnough) {
					timeSeriesForEachCategory[category][measure].isIncreasing = true;
					interestingTimeSeries.push({ category: category, measure: measure });
				}
				if (trendIsDecreasing && differenceIsLargeEnough) {
					timeSeriesForEachCategory[category][measure].isDecreasing = true;
					interestingTimeSeries.push({ category: category, measure: measure });
				}
			}

		self.interestingTimeSeries = interestingTimeSeries;
	},

	// getDataForEachCategory

	initDataForEachCategory: function(categories) {
		let periodList = Database.periodList;
		let dataForEachCategory = {};

		for (let i = 0; i < categories.length; i++) {
			let currentCategory = categories[i];

			dataForEachCategory[currentCategory] = {};

			for (let j = 0; j < periodList.length; j++) {
				let currentPeriod = periodList[j];

				dataForEachCategory[currentCategory][currentPeriod] = [];
			}
		}

		return dataForEachCategory;
	},

	// computeMeansForEachPeriod

	initMeansForForEachPeriod: function(measures) {
		const self = this;
		let meansForForEachPeriod = {};
		let dataForEachCategory = self.dataForEachCategory;

		for (let category in dataForEachCategory) {
			meansForForEachPeriod[category] = {};

			for (let period in dataForEachCategory[category]) {
				meansForForEachPeriod[category][period] = {};

				for (let i = 0; i < measures.length; i++)
					meansForForEachPeriod[category][period][measures[i]] = null;
			}
		}

		return meansForForEachPeriod;
	},
	generateOneMean: function(rows, measure) {
		let numerator = 0, denominator = 0;

		for (let i = 0; i < rows.length; i++) {
			let currentObject = rows[i];
			let currentNumerator = currentObject[measure].numerator;
			let currentDenominator = currentObject[measure].denominator;
			let numeratorIsNotMissing = currentNumerator !== null;
			let denominatorIsNotMissing = currentDenominator !== null;

			if (numeratorIsNotMissing && denominatorIsNotMissing) {
				numerator += currentNumerator;
				denominator += currentDenominator;
			}
		}

		return numerator / denominator;
	},

	// generateTimeSeriesForEachCategory

	initTimeSeriesForEachCategory: function(measures) {
		const self = this;
		let timeSeriesForEachCategory = {};
		let dataForEachCategory = self.dataForEachCategory;

		for (let category in dataForEachCategory) {
			timeSeriesForEachCategory[category] = {};

			for (let i = 0; i < measures.length; i++)
				timeSeriesForEachCategory[category][measures[i]] = {
					data: [], // time series
					isIncreasing: false,
					isDecresing: false
				};
		}

		return timeSeriesForEachCategory;
	},

	// interpolateForMissingValues

	getNonMissingValueBefore: function(timeSeries, currentIndex) {
		const self = this;
		let nonMissingValueBefore = null;

		for (let i = currentIndex - 1; i >= 0; i--) {
			let currentValue = timeSeries[i];
			let currentValueIsMissing = (currentValue === null);

			if (!currentValueIsMissing) {
				nonMissingValueBefore = currentValue;
				break;
			}
		}

		if (nonMissingValueBefore === null)
			nonMissingValueBefore = self.computeMean(timeSeries);

		return nonMissingValueBefore;
	},
	getNonMissingValueAfter: function(timeSeries, currentIndex) {
		const self = this;
		let nonMissingValueAfter = null;

		for (let i = currentIndex + 1; i < timeSeries.length; i++) {
			let currentValue = timeSeries[i];
			let currentValueIsMissing = (currentValue === null);

			if (!currentValueIsMissing) {
				nonMissingValueAfter = currentValue;
				break;
			}
		}

		if (nonMissingValueAfter === null)
			nonMissingValueAfter = self.computeMean(timeSeries);

		return nonMissingValueAfter;
	},
	computeMean: function(array) {
		let sum = 0, count =  0;

		for (let i = 0; i < array.length; i++) {
			let currentValue = array[i];

			if (currentValue !== null) {
				sum += currentValue;
				count++;
			}
		}

		return sum / count;
	},

	// detectTrendForEachTimeSeries

	checkIsIncreasingTrend: function(timeSeries) {
		let numberOfTimePointsMinusOne = timeSeries.length - 1;
		let numberOfPointsGreaterThanFirst = 0;
		let numberOfPointsLessThanLast = 0;
		let firstPointValue = timeSeries[0];
		let lastPointValue = timeSeries[timeSeries.length - 1];
		let isIncreasing = false;

		for (let i = 0; i < timeSeries.length; i++) {
			let currentValue = timeSeries[i];

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
	checkIsDecreasingTrend: function(timeSeries) {
		let numberOfTimePointsMinusOne = timeSeries.length - 1;
		let numberOfPointsLessThanFirst = 0;
		let numberOfPointsGreaterThanLast = 0;
		let firstPointValue = timeSeries[0];
		let lastPointValue = timeSeries[timeSeries.length - 1];
		let isDecreasing = false;

		for (let i = 0; i < timeSeries.length; i++) {
			let currentValue = timeSeries[i];

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
	checkIsDifferenceLargeEnough: function(timeSeries) {
		let firstPointValue = timeSeries[0];
		let lastPointValue = timeSeries[timeSeries.length - 1];
		let largerValue = (lastPointValue > firstPointValue) ? lastPointValue : firstPointValue;
		let smallerValue = (lastPointValue < firstPointValue) ? lastPointValue : firstPointValue;
		let relativeChange = Math.abs((largerValue - smallerValue) / smallerValue);

		if (relativeChange > 0.08)
			return true;
		if (relativeChange <= 0.08)
			return false;
	}
}