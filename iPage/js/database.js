const Database = {
	data: null,
	fileName: null,
	attributeMetadata: null, // { type }

	load: function(data) {
		const self = this;

		self.data = data;
		ExportHandler.storeData(data);
	},
	loadFromText: function(text) {
		const self = this;
		let data = d3.csvParse(text);

		self.data = data;
		ExportHandler.storeData(data);
	},
	preprocess: function() {
		const self = this;

		self.processMissingValues();
		self.attributeTyping();
		self.addTemporalAttributes();
	},
	storeFileName: function(fileName) {
		const self = this;

		self.fileName = fileName;
	},

	// preprocess

	processMissingValues: function() {
		const self = this;
		let data = self.data;

		for (let i = 0; i < data.length; i++) {
			let currentRow = data[i];

			for (let currentAttribute in currentRow) {
				let currentValue = currentRow[currentAttribute];
				let isCurrentValueMissing = (currentValue === '');

				if (isCurrentValueMissing)
					currentRow[currentAttribute] = null;
			}
		}
	},
	attributeTyping: function() {
		const self = this;
		let allAttributes = self.data.columns;
		let numberOfRows = self.data.length;
		let attributeMetadata = {};

		for (let i = 0; i < allAttributes.length; i++) {
			let attributeName = allAttributes[i];
			let metadata = self.gatherAttributeMetadata(attributeName);

			let allValuesAreNumbers = metadata.allValuesAreNumbers;
			let allValuesAreDates = metadata.allValuesAreDates;
			let numberOfUniqueValues = metadata.numberOfUniqueValues;
			let tooManyUniqueValues = (numberOfUniqueValues > 51);
			let isID = (numberOfUniqueValues == numberOfRows);
			if (isID) continue;

			if (allValuesAreDates) attributeMetadata[attributeName] = { type: 'temporal' };
			else if (allValuesAreNumbers && numberOfUniqueValues > 5) attributeMetadata[attributeName] = { type: 'quantitative' };
			else if (allValuesAreNumbers && numberOfUniqueValues <= 5) attributeMetadata[attributeName] = { type: 'ordinal' };
			else if (!allValuesAreNumbers && !tooManyUniqueValues) attributeMetadata[attributeName] = { type: 'nominal' };
		}

		self.attributeMetadata = attributeMetadata;
	},
	addTemporalAttributes: function() {
		const self = this;
		let data = self.data;
		let attributeMetadata = self.attributeMetadata;
		let temporalAttrList = self.getAttributeList('temporal');

		for (let i = 0; i < temporalAttrList.length; i++) {
			let attributeName = temporalAttrList[i];
			let yearAttributeName = attributeName + ' (year)';
			let monthAttributeName = attributeName + ' (month)';
			let yearValueObject = {};
			let monthValueObject = {};
			let yearUniqueValueArray = [];
			let monthUniqueValueArray = [];

			for (let i = 0; i < data.length; i++) {
				let currentRow = data[i];
				let currentValue = currentRow[attributeName];
				let isCurrentValueMissing = (currentValue === null);
				let currentMomentDateObject = moment(currentValue, moment.ISO_8601, true);

				if (isCurrentValueMissing) {
					currentRow[yearAttributeName] = null;
					currentRow[monthAttributeName] = null;
				}
				
				if (!isCurrentValueMissing) {
					let yearValue = currentMomentDateObject.year();
					let monthValue = currentMomentDateObject.month();
					currentRow[yearAttributeName] = yearValue;
					currentRow[monthAttributeName] = monthValue;
					yearValueObject[yearValue] = {};
					monthValueObject[monthValue] = {};
				}
			}

			yearUniqueValueArray = Object.keys(yearValueObject).map(function(d) { return +d; }).sort();
			monthUniqueValueArray = Object.keys(monthValueObject).map(function(d) { return +d; }).sort();
			attributeMetadata[yearAttributeName] = { 
				type: 'temporal-generated', 
				originalName: attributeName, 
				uniqueValues: yearUniqueValueArray,
				timeUnit: 'year'
			};
			attributeMetadata[monthAttributeName] = { 
				type: 'temporal-generated', 
				originalName: attributeName, 
				uniqueValues: monthUniqueValueArray,
				timeUnit: 'month'
			};
		}
	},

	// attributeTyping

	gatherAttributeMetadata: function(attributeName) {
		const self = this;
		let data = self.data;

		let allValuesAreNumbers = true;
		let allValuesAreDates = true;
		let uniqueValuesObject = {};

		for (let i = 0; i < data.length; i++) {
			let currentRow = data[i];
			let currentValue = currentRow[attributeName];

			let momentDateObject = moment(currentValue, moment.ISO_8601, true);
			let currentValueIsNotNum = isNaN(currentValue);
			let currentValueIsNotDate = !momentDateObject.isValid();
			let currentValueIsMissing = currentValue === null;

			// check if current value is number or date
			if (!currentValueIsMissing && currentValueIsNotNum)
				allValuesAreNumbers = false;
			if (!currentValueIsMissing && currentValueIsNotDate)
				allValuesAreDates = false;

			// store unique values (missing value is not considered a unique value)
			if (!currentValueIsMissing)
				uniqueValuesObject[currentValue] = null;
		}

		return {
			allValuesAreNumbers: allValuesAreNumbers, 
			allValuesAreDates: allValuesAreDates,
			numberOfUniqueValues: Object.keys(uniqueValuesObject).length
		};
	},

	// others

	getAttributeList: function(type) {
		const self = this;
		let attributeMetadata = self.attributeMetadata;
		let attributeList = [];

		for (let attributeName in attributeMetadata) 
			if (attributeMetadata[attributeName].type == type)
				attributeList.push(attributeName);

		return attributeList;
	}
}