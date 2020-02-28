const Filters = {
	emptyAll: function() {
		for (filterName in Filter)
			Filter[filterName].removeCapsule();
	},
	endPreview: function() {
		for (filterName in Filter)
			Filter[filterName].endPreview();
	},
	getFilteredData: function() {
		let processingData = Database.data;
		let filteredData = [];

		for (let filterName in Filter) {
			let currentAttribute = Filter[filterName].attributeName;
			let currentFilterHasRange = ('range' in Filter[filterName].filterSpecification);
			let currentFilterRemovesMissing = Filter[filterName].removeMissing;

			if (currentFilterHasRange) {
				let minHandleValue = Filter[filterName].filterSpecification.range[0];
				let maxHandleValue = Filter[filterName].filterSpecification.range[1];

				for (let i = 0; i < processingData.length; i++) {
					let currentRow = processingData[i];
					let currentValue = currentRow[currentAttribute];
					let currentValueViolatesMissing = (currentFilterRemovesMissing && currentValue === null);
					let currentValueWithinRange = (currentValue >= minHandleValue && currentValue <= maxHandleValue);

					if (currentValueWithinRange && !currentValueViolatesMissing)
						filteredData.push(currentRow);
				}
			}

			if (!currentFilterHasRange) {
				let requiredCategories = Filter[filterName].filterSpecification.oneOf;

				for (let i = 0; i < processingData.length; i++) {
					let currentRow = processingData[i];
					let currentValue = currentRow[currentAttribute];
					let currentValueViolatesMissing = (currentFilterRemovesMissing && currentValue === null);
					let currentValueInRequiredCategories = (requiredCategories.indexOf(currentValue) != -1);

					if (currentValueInRequiredCategories && !currentValueViolatesMissing)
						filteredData.push(currentRow);
				}
			}

			// next iteration
			processingData = filteredData;
			filteredData = [];
		}

		return processingData;
	}
}