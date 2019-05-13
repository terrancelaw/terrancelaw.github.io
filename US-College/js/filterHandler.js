let FilterHandler = {
	filteredData: null,
	minMaxValuesForEachAttribute: {},
	numberOfDecimalsForEachAttribute: {},
	probabilityDistributionForEachAttribute: {},
	uniqueValuesForEachAttribute: {},

	filterData: function() {
		const self = this;
		let filters = FilterBar.getFilters();
		let filteredData = [];

		for (let i = 0; i < Database.data.length; i++) {
			let currentRow = Database.data[i];
			let currentRowSatisifiesAllConditions = true;

			for (let j = 0; j < filters.length; j++) {
				let currentFilter = filters[j];
				let currentFilterAttribute = currentFilter.attributeName;
				let currentFilterAttributeValueObject = currentFilter.attributeValueObject;
				let isCurrentAttributeNumerical = ('lowerValue' in currentFilterAttributeValueObject);

				if (isCurrentAttributeNumerical) {
					let currentFilterLowerValue = currentFilterAttributeValueObject.lowerValue;
					let currentFilterUpperValue = currentFilterAttributeValueObject.upperValue;
					let currentRowValue = currentRow[currentFilterAttribute].value;

					if (currentRowValue < currentFilterLowerValue || 
						currentRowValue > currentFilterUpperValue)
						currentRowSatisifiesAllConditions = false;
				}

				if (!isCurrentAttributeNumerical) {
					let currentFilterValue = currentFilterAttributeValueObject.category;
					let currentRowValue = currentRow[currentFilterAttribute].category;

					if (currentRowValue !== currentFilterValue)
						currentRowSatisifiesAllConditions = false;
				}
			}

			if (currentRowSatisifiesAllConditions)
				filteredData.push(currentRow);
		}

		self.minMaxValuesForEachAttribute = {};
		self.numberOfDecimalsForEachAttribute = {};
		self.probabilityDistributionForEachAttribute = {};
		self.uniqueValuesForEachAttribute = {};
		self.filteredData = filteredData;
	},
	getMinMaxValues: function(attributeName) {
		const self = this;
		let filteredData = self.filteredData;
		let minMaxValuesForEachAttribute = self.minMaxValuesForEachAttribute;
		let attributeIsNumerical = (Database.allAttributeMetadata[attributeName].type == 'numerical');
		let minValue = Infinity, maxValue = -Infinity;

		if (!attributeIsNumerical)
			return [ minValue, maxValue ];
		if (attributeName in minMaxValuesForEachAttribute)
			return minMaxValuesForEachAttribute[attributeName];

		for (let i = 0; i < filteredData.length; i++) {
			let currentObject = filteredData[i];
			let currentValue = currentObject[attributeName].value;
			let currentValueIsMissing = (currentObject[attributeName].value === null);

			if (!currentValueIsMissing && currentValue > maxValue)
				maxValue = currentValue;
			if (!currentValueIsMissing && currentValue < minValue)
				minValue = currentValue;
		}

		minMaxValuesForEachAttribute[attributeName] = [ minValue, maxValue ];
		return [ minValue, maxValue ];
	},
	getNumberOfDecimals: function(numericalAttrName) {
		const self = this;
		let numberOfDecimals = null;
		let filteredData = self.filteredData;
		let numberOfDecimalsForEachAttribute = self.numberOfDecimalsForEachAttribute;

		if (numericalAttrName in numberOfDecimalsForEachAttribute)
			return numberOfDecimalsForEachAttribute[numericalAttrName];

		for (let i = 0; i < filteredData.length; i++) {
			let currentObject = filteredData[i];
			let currentValue = currentObject[numericalAttrName].value;
			let currentValueIsMissing = (currentValue === null);

			// check decimal only for the first 
			if (!currentValueIsMissing) { 
				let actualNumberOfDecimals = currentValue.countDecimals();
				numberOfDecimals = (actualNumberOfDecimals > 2) ? 2 : actualNumberOfDecimals;
				break;
			}
		}

		numberOfDecimalsForEachAttribute[numericalAttrName] = numberOfDecimals;
		return numberOfDecimals;
	},
	getProbabilityDistribution: function(numericalAttrName, binNumber) {
		const self = this;
		[ min, max ] = self.getMinMaxValues(numericalAttrName);
		let probabilityDistributionForEachAttribute = self.probabilityDistributionForEachAttribute;
		let counts = {};
		let nonMissingValueCount = 0;
		let filteredData = self.filteredData;
		let probabilityDistribution = [];
		let binSize = (max - min) / binNumber;

		if (numericalAttrName in probabilityDistributionForEachAttribute)
			return probabilityDistributionForEachAttribute[numericalAttrName];

		// init counts
		for (let i = 0; i < binNumber; i++)
			counts[i] = 0;

		// count
		for (let i = 0; i < filteredData.length; i++) {
			let currentObject = filteredData[i];
			let currentValue = currentObject[numericalAttrName].value;
			let currentValueIsMissing = (currentValue === null);
			let binIndex = Math.floor((currentValue - min) / binSize);

			if (currentValueIsMissing)
				continue;
			if (binIndex >= binNumber)
				binIndex = binNumber - 1;

			nonMissingValueCount++;
			counts[binIndex]++;
		}

		// store data
		for (let i = 0; i < binNumber; i++) {
			let currentBinCount = counts[i];
			let probability = currentBinCount / nonMissingValueCount;
			probabilityDistribution.push(probability);
		}

		probabilityDistributionForEachAttribute[numericalAttrName] = probabilityDistribution;
		return probabilityDistribution;
	},
	getUniqueValues: function(attributeName) {
		const self = this;
		let filteredData = self.filteredData;
		let uniqueValuesForEachAttribute = self.uniqueValuesForEachAttribute;
		let attributeIsCategorical = (Database.allAttributeMetadata[attributeName].type == 'categorical');
		let uniqueValuesObject = {};
		let uniqueValuesArray = [];

		if (attributeName in uniqueValuesForEachAttribute)
			return uniqueValuesForEachAttribute[attributeName];

		for (let i = 0; i < filteredData.length; i++) {
			let currentObject = filteredData[i];
			let currentValue = null;
			let currentValueIsMissing = null;

			if (attributeIsCategorical) {
				currentValueIsMissing = (currentObject[attributeName].category === null);
				currentValue = currentObject[attributeName].category;
			}

			if (!attributeIsCategorical) {
				currentValueIsMissing = (currentObject[attributeName].numerator === null || currentObject[attributeName].denominator === null);
				currentValue = currentValueIsMissing ? null : currentObject[attributeName].numerator / currentObject[attributeName].denominator;
			}

			if (!currentValueIsMissing)
				uniqueValuesObject[currentValue] = null;
		}

		// return
		uniqueValuesArray = Object.keys(uniqueValuesObject);
		uniqueValuesArray.sort();
		uniqueValuesForEachAttribute[attributeName] = uniqueValuesArray;
		return uniqueValuesArray;
	}
}