const NarrativeView = {
	draw: function() {
		const self = this;

		$('#narrative-view > .container > .content > .container').html('');
		self.writeNarrativeForMapView();
		self.writeNarrativeForTrend('left');
		self.writeNarrativeForTrend('middle');
		self.writeNarrativeForTrend('right');
		self.installMouseoverNarrative();
	},
	showLoader: function() {
		$('#narrative-view > .container > .content > .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#narrative-view > .container > .content > .loader')
			.css('display', 'none');
	},

	// draw

	writeNarrativeForMapView: function() {
		const self = this;
		let viewClassName = '#map-view';
		let selectedQuantitativeAttr = $('#map-view > .header > .attribute[type="quantitative"]').attr('value');
		let selectedYear = $('#map-view > .header > .attribute[type="temporal"]').attr('value');
		let selectedState = MapView.selectedState;

		let dataByState = Database.getFilteredDataByState(selectedQuantitativeAttr, selectedYear);
		[ lowestStateStat, highestStateStat, average ] = self.getStateStatistics(dataByState, selectedQuantitativeAttr);
		let selectedStateStat = (selectedState === null) ? null : dataByState.find(function(d) { return d.state == selectedState });
		let itemName = Database.getItemName(smallLetter=true);
		let description = '';

		if (selectedState === null) {
			description += 'In <span>' + selectedYear + '</span>, the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' is ' + Math.round(average * 100 ) / 100 + ' nationwise. ';
			description += '<span>' + lowestStateStat.state + '</span> has the lowest value (' + Math.round(lowestStateStat[selectedQuantitativeAttr] * 100) / 100 + ') ';
			description += 'while <span>' + highestStateStat.state + '</span> has the highest value (' + Math.round(highestStateStat[selectedQuantitativeAttr] * 100 ) / 100 + ').';
		}
		if (selectedState !== null) {
			description += 'In <span>' + selectedYear + '</span>, the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' ';
			description += 'is ' + Math.round(selectedStateStat[selectedQuantitativeAttr] * 100) / 100 + ' in <span>' + selectedStateStat.state + '</span>.';
		}

		$('#narrative-view > .container > .content > .container')
			.append('<div view-class-name="' + viewClassName + '">' + description + '</div>');
	},
	writeNarrativeForTrend: function(viewName) {
		const self = this;
		let index = viewName == 'left' ? 1 : (viewName == 'middle' ? 2 : 3);
		let viewClassName = '#trend-view > .view:nth-child(' + index + ')';
		let selectedQuantitativeAttr = $('#trend-view > .view:nth-child(' + index + ') > .header > .attribute').attr('value');
		let selectedState = MapView.selectedState;

		let dataByTimeStep = self.getDataByTimeStep(selectedQuantitativeAttr, selectedState);
		let timeSeries = self.generateTimeSeries(dataByTimeStep);

		let roundedFirstValue = Math.round(timeSeries[0] * 100) / 100;
		let roundedLastValue = Math.round(timeSeries[timeSeries.length - 1] * 100) / 100;
		let roundedPercentChange = Math.abs(Math.round((timeSeries[timeSeries.length - 1] - timeSeries[0]) / timeSeries[0] * 100 * 100) / 100);

		let hasIncreased = timeSeries[timeSeries.length - 1] > timeSeries[0];
		let hasDecreased = timeSeries[timeSeries.length - 1] < timeSeries[0];
		let unchanged = timeSeries[timeSeries.length - 1] == timeSeries[0];
		let isSignificantlyIncreasing = self.isSignificantlyIncreasing(timeSeries) || (hasIncreased && roundedPercentChange > 10);
		let isSignificantlyDecreasing = self.isSignificantlyDecreasing(timeSeries) || (hasDecreased && roundedPercentChange > 10);
		let remainSteady = !isSignificantlyIncreasing && !isSignificantlyDecreasing;

		let yearList = Database.getYearList().sort();
		let firstYear = yearList[0], lastYear = yearList[yearList.length - 1];
		let itemName = Database.getItemName(smallLetter=true);
		let description = '';

		// first part
		if (viewName == 'left') description += 'Between <span>' + firstYear + '</span> and <span>' + lastYear + '</span>, ';
		if (viewName == 'middle') description += 'In the same period, ';
		if (viewName == 'right') description += 'Meanwhile, ';

		// second part
		if (selectedState === null && isSignificantlyIncreasing) description += 'the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' increases significantly nationwise';
		if (selectedState === null && isSignificantlyDecreasing) description += 'the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' decreases significantly nationwise';
		if (selectedState === null && remainSteady) description += 'the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' remains steady nationwise';
		if (selectedState !== null && isSignificantlyIncreasing) description += 'the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' increases significantly in <span>' + selectedState + '</span>';
		if (selectedState !== null && isSignificantlyDecreasing) description += 'the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' decreases significantly in <span>' + selectedState + '</span>';
		if (selectedState !== null && remainSteady) description += 'the average <span>' + selectedQuantitativeAttr + '</span> per ' + itemName + ' remains steady in <span>' + selectedState + '</span>';

		// third part
		if (hasIncreased) description += ', with ' + (remainSteady ? 'a mild' : 'an') + ' increase from ' + roundedFirstValue + ' in <span>' + firstYear + '</span> to ' + roundedLastValue + ' in <span>' + lastYear + '</span> (' + roundedPercentChange + '% increase).';
		if (hasDecreased) description += ', with ' + (remainSteady ? 'a mild' : 'a') + ' decrease from ' + roundedFirstValue + ' in <span>' + firstYear + '</span> to ' + roundedLastValue + ' in <span>' + lastYear + '</span> (' + roundedPercentChange + '% decrease).';
		if (unchanged) description += '. The average value remains unchanged at ' + roundedFirstValue + '.';

		$('#narrative-view > .container > .content > .container')
			.append('<div view-class-name="' + viewClassName + '">' + description + '</div>');
	},
	installMouseoverNarrative: function() {
		$('#narrative-view > .container > .content > .container > div')
			.on('mouseenter', onMouseenterDescription);
		$('#narrative-view > .container > .content > .container > div')
			.on('mouseleave', onMouseleaveDescription);

		function onMouseenterDescription() {
			let viewClassName = $(this).attr('view-class-name');
			$('#map-view').removeClass('highlight');
			$('#trend-view > .view').removeClass('highlight');
			$(viewClassName).addClass('highlight');
		}

		function onMouseleaveDescription() {
			$('#map-view').removeClass('highlight');
			$('#trend-view > .view').removeClass('highlight');
		}
	},

	// writeNarrativeForMapView

	getStateStatistics: function(dataByState, quantitativeAttr) {
		let lowestStateIndex = 0;
		let highestStateIndex = dataByState.length - 1;
		let sum = 0, count = 0;

		for (let i = 0; i < dataByState.length; i++) {
			sum += dataByState[i].sum;
			count += dataByState[i].count;
		}
		dataByState.sort(function(a, b) {
			return a[quantitativeAttr] - b[quantitativeAttr];
		});

		return [
			dataByState[lowestStateIndex],
			dataByState[highestStateIndex],
			sum / count
		]
	},

	// writeNarrativeForLeftTrend

	getDataByTimeStep: function(quantitativeAttr, selectedState) {
		const self = this;
		let data = Database.data;
		let dataByTimeStep = self.initDataByTimeStep();

		for (let i = 0; i < data.length; i++) {
			let currentRow = data[i];
			let currentYear = currentRow.year_;
			let currentState = currentRow.State;
			let currentValue = +currentRow[quantitativeAttr];
			let currentValueIsMissing = (currentRow[quantitativeAttr] === null);
			let hasNoSelectedState = selectedState === null;
			let currentStateIsSameAsSelected = currentState == selectedState;

			if (!currentValueIsMissing && (hasNoSelectedState || currentStateIsSameAsSelected)) {
				dataByTimeStep[currentYear].sum += currentValue;
				dataByTimeStep[currentYear].count++;
			}
		}

		return dataByTimeStep;
	},
	generateTimeSeries: function(dataByTimeStep) {
		const self = this;
		let timeSeries = [];
		let yearList = Database.getYearList().sort();

		for (let i = 0; i < yearList.length; i++) {
			let year = yearList[i];
			let sum = dataByTimeStep[year].sum;
			let count = dataByTimeStep[year].count;
			timeSeries.push(sum / count);
		}

		return timeSeries;
	},
	isSignificantlyIncreasing: function(timeSeries) {
		let numberOfTimeStepsMinusOne = timeSeries.length - 1;
		let numberOfStepsGreaterThanFirst = 0;
		let numberOfStepsLessThanLast = 0;
		let numberOfIncreasingPeriod = 0;
		let firstValue = timeSeries[0];
		let lastValue = timeSeries[timeSeries.length - 1];

		for (let i = 0; i < timeSeries.length; i++) {
			let currentValue = timeSeries[i];
			let previousValue = (i >= 1) ? timeSeries[i - 1] : Infinity;
			let percentageChange = (i >= 1) ? ((currentValue - previousValue) / previousValue) : 0;

			if (currentValue > firstValue) numberOfStepsGreaterThanFirst++;
			if (currentValue < lastValue) numberOfStepsLessThanLast++;
			if (percentageChange > 0.05) numberOfIncreasingPeriod++; // only consider strong increasing
		}

		return ((numberOfStepsLessThanLast / numberOfTimeStepsMinusOne > 0.7) &&
				(numberOfStepsGreaterThanFirst / numberOfTimeStepsMinusOne > 0.7) && 
				(lastValue > firstValue)); // is increasing
	},
	isSignificantlyDecreasing: function(timeSeries) {
		let numberOfTimeStepsMinusOne = timeSeries.length - 1;
		let numberOfStepsLessThanFirst = 0;
		let numberOfStepsGreaterThanLast = 0;
		let numberOfDecreasingPeriod = 0;
		let firstValue = timeSeries[0];
		let lastValue = timeSeries[timeSeries.length - 1];

		for (let i = 0; i < timeSeries.length; i++) {
			let currentValue = timeSeries[i];
			let previousValue = (i >= 1) ? timeSeries[i - 1] : -Infinity;
			let percentageChange = (i >= 1) ? ((currentValue - previousValue) / previousValue) : 0;

			if (currentValue < firstValue) numberOfStepsLessThanFirst++;
			if (currentValue > lastValue) numberOfStepsGreaterThanLast++;
			if (percentageChange < -0.05) numberOfDecreasingPeriod++; // only consider strong decreasing
		}

		return ((numberOfStepsLessThanFirst / numberOfTimeStepsMinusOne > 0.7) &&
				(numberOfStepsGreaterThanLast / numberOfTimeStepsMinusOne > 0.7) &&
				(firstValue > lastValue)); // is decreasing
	},

	// getDataByTimeStep

	initDataByTimeStep: function() {
		let dataByTimeStep = {};
		let yearList = Database.getYearList().sort();

		for (let i = 0; i < yearList.length; i++) {
			let year = yearList[i];
			dataByTimeStep[year] = { sum: 0, count: 0 };
		}

		return dataByTimeStep;
	}
}