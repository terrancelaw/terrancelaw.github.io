const MeanOperator = {
	dataForEachCategory: {},
	measureMeansForEachCategory: {},
	
	compute: function() {
		const self = MeanOperator;
		let dimension = DimensionPane.selectedAttribute;
		let categories = DimensionPane.selectedCategories;
		let measures = MeasurePane.selectedMeasures;

		self.getDataForEachCategory(dimension, categories);
		self.getMeasureMeansForEachCategory(measures);
	},
	getDataForEachCategory: function(dimension, categories) {
		const self = MeanOperator;
		let dataForEachCategory = {};

		for (let i = 0; i < categories.length; i++)
			dataForEachCategory[categories[i]] = { yes: [], no: [] };


		for (let i = 0; i < FilterHandler.filteredData.length; i++) {
			let currentObject = FilterHandler.filteredData[i];
			let currentObjectCategory = currentObject[dimension].category;

			for (let j = 0; j < categories.length; j++) {
				let currentRequiredCategory = categories[j];

				if (currentObjectCategory === currentRequiredCategory)
					dataForEachCategory[currentRequiredCategory].yes.push(currentObject);
				if (currentObjectCategory !== currentRequiredCategory)
					dataForEachCategory[currentRequiredCategory].no.push(currentObject);
			}
		}

		self.dataForEachCategory = dataForEachCategory;
	},
	getMeasureMeansForEachCategory: function(measures) {
		const self = MeanOperator;
		let dataForEachCategory = self.dataForEachCategory;
		let measureMeansForEachCategory = self.initMeasureMeansForEachCategory(measures);

		for (let category in measureMeansForEachCategory) {
			let yesObjects = dataForEachCategory[category].yes;
			let noObjects = dataForEachCategory[category].no;

			for (let measure in measureMeansForEachCategory[category].yes) {
				let yesObjectMean = self.generateOneMean(yesObjects, measure);
				let noObjectMean = self.generateOneMean(noObjects, measure);

				measureMeansForEachCategory[category].yes[measure] = yesObjectMean;
				measureMeansForEachCategory[category].no[measure] = noObjectMean;
			}
		}

		self.measureMeansForEachCategory = measureMeansForEachCategory;
	},

	// getMeasureMeansForEachCategory

	initMeasureMeansForEachCategory: function(measures) {
		const self = MeanOperator;
		let dataForEachCategory = self.dataForEachCategory;
		let means = {};

		for (let category in dataForEachCategory) {
			means[category] = { yes: {}, no: {} };

			for (let i = 0; i < measures.length; i++) {
				let currentMeasure = measures[i];

				means[category].yes[currentMeasure] = 0;
				means[category].no[currentMeasure] = 0;
			}
		}

		return means;
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
	}
}