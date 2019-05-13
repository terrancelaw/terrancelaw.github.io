let Database = {
	rawData: null,
	data: null,
	periodList: [
		'2006-2007', '2007-2008',
		'2008-2009', '2009-2010',
		'2010-2011', '2011-2012',
		'2012-2013', '2013-2014',
		'2014-2015', '2015-2016',
		'2016-2017'
	],
	excludedAttributes: [ 'Name' ],
	allAttributeMetadata: null,

	load: function() {
		const self = this;

		MeasurePane.showLoader();
		DimensionPane.showLoader();
		VisPane.showLoader();
		DimensionHightlightPane.showLoader();
		MeasureHighlightPane.showLoader();

		d3.csv('csv/data.csv').then(function(data) {
			d3.csv('csv/means.csv').then(function(meanInfo) {
				// database processing
				self.rawData = data;
				self.parseAttributeType();
				self.processData();
				self.addDenominatorInfoToMetadata();
				self.addMeanInfoToMetadata(meanInfo)

				// filtering
				FilterBar.Capsule.add('Period', { category: '2016-2017' });
				FilterBar.Capsule.installClickRemoveBehaviour();
				FilterHandler.filterData();
				FilterBar.updateRecordNumber();

				// interface updates
				MeasurePane.populate();
				MeasurePane.initEvents();
				DimensionPane.populate();
				DimensionPane.initEvents();

				MeanOperator.compute();
				VisPane.update();
				DimensionHightlightPane.update();
				MeasureHighlightPane.update();

				// hide loaders
				MeasurePane.hideLoader();
				DimensionPane.hideLoader();
				VisPane.hideLoader();
				DimensionHightlightPane.hideLoader();
				MeasureHighlightPane.hideLoader();
			});
		});
	},
	parseAttributeType: function() {
		const self = this;
		let rawData = self.rawData;
		let allAttributes = rawData.columns;
		let numberOfRows = rawData.length;
		let allAttributeMetadata = {};

		for (let i = 0; i < allAttributes.length; i++) {
			let attributeName = allAttributes[i];
			let attributeMetadata = null;
			let allValuesAreNumbers = null;
			let allValuesAreMissing = null;
			let nameHasDenominator = attributeName.includes('denominator');

			if (nameHasDenominator)
				continue;
			if (!nameHasDenominator) {
				attributeMetadata = self.gatherAttributeMetaData(attributeName);
				allValuesAreNumbers = attributeMetadata.allValuesAreNumbers;
				allValuesAreMissing = attributeMetadata.allValuesAreMissing;
			}

			if (!allValuesAreMissing && allValuesAreNumbers)
				allAttributeMetadata[attributeName] = { type: 'numerical' };
			if (!allValuesAreMissing && !allValuesAreNumbers)
				allAttributeMetadata[attributeName] = { type: 'categorical' };
		}

		self.allAttributeMetadata = allAttributeMetadata;
	},
	gatherAttributeMetaData: function(attributeName) {
		const self = this;
		let rawData = self.rawData;
		let allValuesAreNumbers = true;
		let allValuesAreMissing = true;

		for (let i = 0; i < rawData.length; i++) {
			let currentObject = rawData[i];
			let currentValue = currentObject[attributeName];
			let currentValueIsNotNum = isNaN(currentValue);
			let currentValueIsMissing = (currentValue === '');

			if (!currentValueIsMissing)
				allValuesAreMissing = false;

			if (!currentValueIsMissing && currentValueIsNotNum)
				allValuesAreNumbers = false;
		}

		return {
			allValuesAreNumbers: allValuesAreNumbers,
			allValuesAreMissing: allValuesAreMissing
		}
	},
	processData: function() {
		const self = this;
		let rawData = self.rawData;
		let allAttributeMetadata = self.allAttributeMetadata;
		let processedData = [];

		for (let i = 0; i < rawData.length; i++) {
			let currentObject = rawData[i];
			let newObject = {};

			for (let attributeName in allAttributeMetadata) {
				let currentAttributeIsCategorical = (allAttributeMetadata[attributeName].type == 'categorical');
				let currentValue = currentObject[attributeName];
				let newValueObject = {};

				// create new value object for categorical
				if (currentAttributeIsCategorical) {
					let currentValueIsMissing = (currentValue === '');
					let currentCategory = (currentValueIsMissing ? null : currentValue);

					newValueObject.category = currentCategory;
				}

				// create new value object for numerical
				if (!currentAttributeIsCategorical) {
					let currentNumerator = currentValue;
					let currentDenominator = currentObject[attributeName + ' - denominator'];
					let currentNumeratorIsMissing = (currentNumerator === '');
					let currentDenominatorIsMissing = (currentDenominator === '');

					currentNumerator = (currentNumeratorIsMissing ? null : +currentNumerator);
					currentDenominator = (currentDenominatorIsMissing ? null : +currentDenominator);
					newValueObject.numerator = currentNumerator;
					newValueObject.denominator = currentDenominator;
					newValueObject.value = (!currentNumeratorIsMissing && !currentDenominatorIsMissing) 
										 ? (currentNumerator / currentDenominator) : null;
				}

				// save
				newObject[attributeName] = newValueObject;
			}

			processedData.push(newObject);
		}

		self.data = processedData;
	},
	addDenominatorInfoToMetadata: function() {
		const self = this;
		let data = self.data;
		let allAttributeMetadata = self.allAttributeMetadata;

		for (let attributeName in allAttributeMetadata) {
			let currentAttributeIsNumerical = (allAttributeMetadata[attributeName].type == 'numerical');
			let currentDenominatorSum = 0;
			let nonZeroDenominatorCount = 0;

			if (currentAttributeIsNumerical) {
				for (let i = 0; i < data.length; i++) {
					let currentObject = data[i];
					let currentDenominator = currentObject[attributeName].denominator;
					let currentDenominatorIsMissing = (currentDenominator === '');

					if (!currentDenominatorIsMissing) {
						currentDenominatorSum += currentDenominator;
						nonZeroDenominatorCount++;
					}
				}

				if (nonZeroDenominatorCount != 0)
					allAttributeMetadata[attributeName].averageContributionToDenominator = currentDenominatorSum / nonZeroDenominatorCount;
			}
		}
	},
	addMeanInfoToMetadata: function(meanInfo) {
		const self = this;
		let allAttributeMetadata = self.allAttributeMetadata;

		for (let i = 0; i < meanInfo.length; i++) {
			let attributeName = meanInfo[i].attributeName;
			let cmsMeanIsMissing = (meanInfo[i].CMS === '');
			let peerMeanIsMissing = (meanInfo[i].peer === '');
			let cmsMean = cmsMeanIsMissing ? null : +meanInfo[i].CMS;
			let peerMean = peerMeanIsMissing ? null : +meanInfo[i].peer;

			allAttributeMetadata[attributeName].cmsMean = cmsMean;
			allAttributeMetadata[attributeName].peerMean = peerMean;
		}
	},
	checkIfAttributeIsExcluded: function(attributeName) {
		const self = this;
		let excludedAttributes = self.excludedAttributes;
		let attributeIsExcluded = excludedAttributes.indexOf(attributeName) != -1;

		return attributeIsExcluded;
	}
}