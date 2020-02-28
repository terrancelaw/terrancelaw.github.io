let Database = {
	data: null,
	attributeMetadata: null,
	uniqueValuesForEachAttribute: {},
	categoryToColourDictForEachNominalAttr: {}, // { attributeName: colourCode }
	rangeAndDecimalForEachQuantAttr: {}, // { range: [ min, max ], maxNumberOfDecimal }

	load: function(data) {
		const self = this;

		self.data = data;
	},
	loadFromText: function(text) {
		const self = this;
		let data = d3.csvParse(text);

		self.data = data;
	},
	processMissingValues: function() {
		const self = this;

		for (let i = 0; i < self.data.length; i++) {
			let currentRow = self.data[i];

			for (let currentAttribute in currentRow) {
				let currentValue = currentRow[currentAttribute];
				let isCurrentValueMissing = (currentValue === '');

				if (isCurrentValueMissing)
					self.data[i][currentAttribute] = null;
			}
		}
	},
	attributeTyping: function() {
		const self = this;
		let allAttributes = self.data.columns;
		let numberOfRows = self.data.length;
		let attributeMetadata = {};
		let uniqueValuesForEachAttribute = {};
		let rangeAndDecimalForEachQuantAttr = {};
		let categoryToColourDictForEachNominalAttr = {};

		for (let i = 0; i < allAttributes.length; i++) {
			let attributeName = allAttributes[i];
			let metadataObject = self.gatherAttributeMetadata(attributeName);

			let uniqueValuesArray = metadataObject.uniqueValuesArray;
			let areAllValuesNumbers = metadataObject.areAllValuesNumbers;
			let areAllValuesDates = metadataObject.areAllValuesDates;
			let numberOfUniqueValues = metadataObject.numberOfUniqueValues;
			let hasMissingValues = metadataObject.hasMissingValues;
			let isID = (numberOfUniqueValues == numberOfRows);

			// determine type (can be both number and date, make it quantitative in that case)
			if (areAllValuesDates) {
				attributeMetadata[attributeName] = self.generateAttributeMetadata('temporal', false, numberOfUniqueValues, areAllValuesDates);
				uniqueValuesForEachAttribute[attributeName] = uniqueValuesArray;
			}
			else if (areAllValuesNumbers && numberOfUniqueValues > 5 && !isID) {
				attributeMetadata[attributeName] = self.generateAttributeMetadata('quantitative', false, numberOfUniqueValues, areAllValuesDates);
				rangeAndDecimalForEachQuantAttr[attributeName] = self.findRangeAndDecimal(attributeName);
				uniqueValuesForEachAttribute[attributeName] = uniqueValuesArray;
			}
			else if (areAllValuesNumbers && numberOfUniqueValues <= 5 && !isID) {
				attributeMetadata[attributeName] = self.generateAttributeMetadata('ordinal', false, numberOfUniqueValues, areAllValuesDates);
				rangeAndDecimalForEachQuantAttr[attributeName] = self.findRangeAndDecimal(attributeName);
				uniqueValuesForEachAttribute[attributeName] = uniqueValuesArray;
			}
			else {
				attributeMetadata[attributeName] = self.generateAttributeMetadata('nominal', false, numberOfUniqueValues, areAllValuesDates);
				categoryToColourDictForEachNominalAttr[attributeName] = self.findColourForEachCategory(attributeName, uniqueValuesArray, hasMissingValues);
				uniqueValuesForEachAttribute[attributeName] = uniqueValuesArray;
			}
		}

		// store the number of record variable
		attributeMetadata['Number of Records'] =
			self.generateAttributeMetadata('quantitative', true, null, false);

		// store metadata
		self.attributeMetadata = attributeMetadata;
		self.uniqueValuesForEachAttribute = uniqueValuesForEachAttribute;
		self.categoryToColourDictForEachNominalAttr = categoryToColourDictForEachNominalAttr;
		self.rangeAndDecimalForEachQuantAttr = rangeAndDecimalForEachQuantAttr;
	},
	gatherAttributeMetadata: function(attributeName) {
		const self = this;

		let areAllValuesNumbers = true;
		let areAllValuesDates = true;
		let numberOfUniqueValues = null;
		let hasMissingValues = false;

		let uniqueValuesObject = {};
		let uniqueValuesArray = [];
		
		for (let i = 0; i < self.data.length; i++) {
			let currentRow = self.data[i];
			let currentValue = currentRow[attributeName];

			let momentDateObject = moment(currentValue, moment.ISO_8601, true);
			let currentValueIsNotNum = isNaN(currentValue);
			let currentValueIsNotDate = !momentDateObject.isValid();
			let currentValueIsMissing = currentValue === null;

			// check if current value is number or date
			if (areAllValuesNumbers && currentValueIsNotNum)
				areAllValuesNumbers = false;
			if (areAllValuesDates && currentValueIsNotDate && !currentValueIsMissing)
				areAllValuesDates = false;

			// store unique values (missing value is not considered a unique value)
			if (!currentValueIsMissing)
				uniqueValuesObject[currentValue] = null;
			if (currentValueIsMissing)
				hasMissingValues = true;
		}

		// find number of unique values
		uniqueValuesArray = Object.keys(uniqueValuesObject);
		numberOfUniqueValues = uniqueValuesArray.length;
		uniqueValuesArray.sort(); // for aligning category with density plot color

		return {
			uniqueValuesArray: uniqueValuesArray,
			areAllValuesNumbers: areAllValuesNumbers, 
			areAllValuesDates: areAllValuesDates,
			numberOfUniqueValues: numberOfUniqueValues,
			hasMissingValues: hasMissingValues
		};
	},
	findRangeAndDecimal: function(attributeName) {
		const self = this;
		let min = Infinity, max = -Infinity;
		let maxNumberOfDecimal = -Infinity;

		for (let i = 0; i < self.data.length; i++) {
			let currentRow = self.data[i];
			let currentValue = +currentRow[attributeName];
			let currentNumberOfDecimal = currentValue.countDecimals();
			let currentValueIsNotMissing = currentValue !== null;

			if (currentValueIsNotMissing) {
				if (currentValue > max)
					max = currentValue;
				if (currentValue < min)
					min = currentValue;
				if (currentNumberOfDecimal > maxNumberOfDecimal)
					maxNumberOfDecimal = currentNumberOfDecimal;
			}
		}

		return {
			range: [ min, max ],
			maxNumberOfDecimal: maxNumberOfDecimal
		};
	},
	findColourForEachCategory: function(attributeName, uniqueValuesArray, hasMissingValues) {
		let updatedUniqueValuesArray = uniqueValuesArray;
		let categoryToColourDict = {};

		if (hasMissingValues)
			updatedUniqueValuesArray = [ '##missing' ].concat(uniqueValuesArray);

		for (let i = 0; i < updatedUniqueValuesArray.length; i++) {
			let currentCategory = updatedUniqueValuesArray[i];
			let currentColourCode = Helpers.getTableau10Colour(i);
			categoryToColourDict[currentCategory] = currentColourCode;
		}

		return categoryToColourDict;
	},
	generateAttributeMetadata: function(type, isAutoGenerated, numberOfUniqueValues, areAllValuesDates) {
		return {
			type: type,
			aggregate: 'none',
			timeUnit: 'none',
			maxbins: 'none',

			isAutoGenerated: isAutoGenerated,
			numberOfUniqueValues: numberOfUniqueValues,
			areAllValuesDates: areAllValuesDates
		};
	},
	addYearAndMonthVariable: function() {
		const self = this;

		for (let attributeName in self.attributeMetadata) {
			let currentAttributeType = self.attributeMetadata[attributeName].type;
			let yearVariableName = attributeName + ' (year)';
			let monthVariableName = attributeName + ' (month)';
			let weekVariableName = attributeName + ' (day)';

			let yearValueObject = {};
			let monthValueObject = {};
			let weekValueObject = {};
			let yearUniqueValueArray = [];
			let monthUniqueValueArray = [];
			let weekUniqueValueArray = [];

			if (currentAttributeType != 'temporal')
				continue;
			
			for (let i = 0; i < self.data.length; i++) {
				let currentRow = self.data[i];
				let currentValue = currentRow[attributeName];
				let isCurrentValueMissing = (currentValue === null);
				let currentMomentDateObject = moment(currentValue, moment.ISO_8601, true);

				if (isCurrentValueMissing) {
					currentRow[yearVariableName] = null;
					currentRow[monthVariableName] = null;
					currentRow[weekVariableName] = null;
				}
				
				if (!isCurrentValueMissing) {
					let yearValue = currentMomentDateObject.year();
					let monthValue = currentMomentDateObject.month() + 1;
					let weekValue = currentMomentDateObject.isoWeekday();

					currentRow[yearVariableName] = yearValue;
					currentRow[monthVariableName] = monthValue;
					currentRow[weekVariableName] = weekValue;
					yearValueObject[yearValue] = {};
					monthValueObject[monthValue] = {};
					weekValueObject[weekValue] = {};
				}
			}

			yearUniqueValueArray = Object.keys(yearValueObject).map(function(d) { return +d; }).sort();
			monthUniqueValueArray = Object.keys(monthValueObject).map(function(d) { return +d; }).sort();
			weekUniqueValueArray = Object.keys(weekValueObject).map(function(d) { return +d; }).sort();

			self.attributeMetadata[yearVariableName] = self.generateAttributeMetadata('temporal', true, yearUniqueValueArray.length, true);
			self.attributeMetadata[monthVariableName] = self.generateAttributeMetadata('temporal', true, monthUniqueValueArray.length, true);
			self.attributeMetadata[weekVariableName] = self.generateAttributeMetadata('temporal', true, weekUniqueValueArray.length, true);

			self.uniqueValuesForEachAttribute[yearVariableName] = yearUniqueValueArray;
			self.uniqueValuesForEachAttribute[monthVariableName] = monthUniqueValueArray;
			self.uniqueValuesForEachAttribute[weekVariableName] = weekUniqueValueArray;

			self.rangeAndDecimalForEachQuantAttr[yearVariableName] = { range: [ yearUniqueValueArray[0], yearUniqueValueArray[yearUniqueValueArray.length - 1] ], maxNumberOfDecimal: 0 };
			self.rangeAndDecimalForEachQuantAttr[monthVariableName] = { range: [ monthUniqueValueArray[0], monthUniqueValueArray[monthUniqueValueArray.length - 1] ], maxNumberOfDecimal: 0 };
			self.rangeAndDecimalForEachQuantAttr[weekVariableName] = { range: [ weekUniqueValueArray[0], weekUniqueValueArray[weekUniqueValueArray.length - 1] ], maxNumberOfDecimal: 0 };
		}
	}
}