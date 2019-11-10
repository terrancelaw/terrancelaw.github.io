const Database = {
	data: null,
	fileName: null,
	attributeMetadata: null, // { type }
	stateToGeoID: { 
		"Alabama": 1, "Alaska": 2, "Arizona": 4, "Arkansas": 5, "California": 6, "Colorado": 8, "Connecticut": 9, "Delaware": 10,
		"District of Columbia": 11, "Florida": 12, "Georgia": 13, "Hawaii": 15, "Idaho": 16, "Illinois": 17, "Indiana": 18, "Iowa": 19,
		"Kansas": 20, "Kentucky": 21, "Louisiana": 22, "Maine": 23, "Maryland": 24, "Massachusetts": 25, "Michigan": 26, "Minnesota": 27,
		"Mississippi": 28, "Missouri": 29, "Montana": 30, "Nebraska": 31, "Nevada": 32, "New Hampshire": 33, "New Jersey": 34, "New Mexico": 35,
		"New York": 36, "North Carolina": 37, "North Dakota": 38, "Ohio": 39, "Oklahoma": 40, "Oregon": 41, "Pennsylvania": 42, "Rhode Island": 44, 
		"South Carolina": 45, "South Dakota": 46, "Tennessee": 47, "Texas": 48, "Utah": 49, "Vermont": 50, "Virginia": 51, "Washington": 53,
		"West Virginia": 54, "Wisconsin": 55, "Wyoming": 56, "Puerto Rico": 72
	},
	stateToAbbr: {
		"Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
		"District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
		"Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
		"Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
		"New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", 
		"South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
		"West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY", "Puerto Rico": "PR"
	},

	storeFileName: function(fileName) {
		const self = this;

		self.fileName = fileName;
	},
	load: function(data) {
		const self = this;

		self.data = data;
	},
	preprocess: function() {
		const self = this;

		self.processMissingValues();
		self.attributeTyping();
		self.storeYearList();
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
			let uniqueValues = metadata.uniqueValues;
			let tooManyUniqueValues = (uniqueValues.length > 51);
			let isID = (uniqueValues.length == numberOfRows);
			if (isID) continue;

			if (allValuesAreDates) attributeMetadata[attributeName] = { type: 'temporal' };
			else if (allValuesAreNumbers && uniqueValues.length > 5) attributeMetadata[attributeName] = { type: 'quantitative' };
			else if (allValuesAreNumbers && uniqueValues.length <= 5) attributeMetadata[attributeName] = { type: 'ordinal' };
			else if (!allValuesAreNumbers) attributeMetadata[attributeName] = { type: 'nominal', uniqueValues: uniqueValues };
		}

		self.attributeMetadata = attributeMetadata;
	},
	storeYearList: function() {
		const self = this;
		let data = self.data;
		let attributeMetadata = self.attributeMetadata;
		let yearListObject = {};

		for (let i = 0; i < data.length; i++) {
			let currentRow = data[i];
			let currentYearString = currentRow.Year;
			let currentYear = moment(currentYearString, moment.ISO_8601, true).year();
			currentRow.year_ = currentYear; // for filtering
			yearListObject[currentYear] = null;

			if (isNaN(currentYear))
				console.log(currentYearString)
		}

		attributeMetadata.Year.yearList = Object.keys(yearListObject);
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
			uniqueValues: Object.keys(uniqueValuesObject)
		};
	},

	// others

	getQuantitativeAttrList: function() {
		const self = this;
		let attributeMetadata = self.attributeMetadata;
		let quantitativeAttrList = [];

		for (let attributeName in attributeMetadata) {
			let attributeType = attributeMetadata[attributeName].type;

			if (attributeType == 'quantitative')
				quantitativeAttrList.push(attributeName);
		}

		return quantitativeAttrList;
	},
	getYearList: function() {
		const self = this;
		let attributeMetadata = self.attributeMetadata;

		return attributeMetadata.Year.yearList;
	},
	getFilteredDataByState: function(quantitativeAttr, filterYear) {
		const self = this;
		let data = self.data;
		let stateToGeoID = self.stateToGeoID;
		let stateList = self.attributeMetadata.State.uniqueValues;
		let dataByStateObject = {};
		let dataByStateArray = [];

		// init
		for (let i = 0; i < stateList.length; i++) {
			let currentState = stateList[i];
			dataByStateObject[currentState] = {};
			dataByStateObject[currentState].count = 0;
			dataByStateObject[currentState]['sum_' + quantitativeAttr] = 0;
		}

		// generate dataByStateObject
		for (let i = 0; i < data.length; i++) {
			let currenRow = data[i];
			let currentState = currenRow.State;
			let currentYear = currenRow.year_;
			let currentValueIsMissing = currenRow[quantitativeAttr] === null;
			let currentValue = +currenRow[quantitativeAttr];
			if (currentYear === +filterYear && !currentValueIsMissing) {
				dataByStateObject[currentState].count++;
				dataByStateObject[currentState]['sum_' + quantitativeAttr] += currentValue;
			}
		}

		// generate dataByStateArray
		for (let currentState in dataByStateObject) {
			let geoID = stateToGeoID[currentState];
			let sum = dataByStateObject[currentState]['sum_' + quantitativeAttr];
			let count = dataByStateObject[currentState].count;
			let stateObject = {};
			stateObject.state = currentState;
			stateObject.geoID = geoID;
			stateObject.sum = sum;
			stateObject.count = count;
			stateObject[quantitativeAttr] = sum / count;
			dataByStateArray.push(stateObject);
		}
	
		return dataByStateArray;
	},
	getItemName: function(smallLetter=false) {
		const self = this;
		let fileName = self.fileName;
		let itemName = '';

		if (fileName == 'county.csv' && !smallLetter) itemName = 'County';
		if (fileName == 'college.csv' && !smallLetter) itemName = 'College';
		if (fileName == 'county.csv' && smallLetter) itemName = 'county';
		if (fileName == 'college.csv' && smallLetter) itemName = 'college';

		return itemName;
	}
}