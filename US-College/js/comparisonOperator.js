const ComparisonOperator = {
	binNumber: 10,

	ObjectPairs: {
		data: {}, // rows in table
		metadata: {}, // { means, differentMeasures, numberArrays, probabilityDistributions }

		getData: function(dimension, categories) {
			const self = ComparisonOperator;

			self.ObjectPairs.data = MeanOperator.dataForEachCategory;
		},
		generateMeans: function(measures) {
			const self = ComparisonOperator;

			self.ObjectPairs.metadata.means = MeanOperator.measureMeansForEachCategory;
		},
		generateDifferentMeasures: function() {
			const self = ComparisonOperator;
			let means = self.ObjectPairs.metadata.means;
			let differentMeasures = self.ObjectPairs.initDifferentMeasures();

			for (let category in means)
				for (let measure in means[category].yes) {
					let yesMean = means[category].yes[measure];
					let noMean = means[category].no[measure];
					[ minValue, maxValue ] = FilterHandler.getMinMaxValues(measure);

					let meanDifference = Math.abs(yesMean - noMean);
					let normalizedMeanDifference = (meanDifference - minValue) / (maxValue - minValue);

					let classDWeightedSum = normalizedMeanDifference * 45.6985 - 5.4464;
					let classDExp = Math.exp(classDWeightedSum);
					let classNWeightedSum = normalizedMeanDifference * 23.9107 - 1.9907;
					let classNExp = Math.exp(classNWeightedSum);

					classDProbability = classDExp / (1 + classDExp + classNExp);
					classNProbability = classNExp / (1 + classDExp + classNExp);
					classSProbability = 1 - classDProbability - classNProbability;

					if (isNaN(classDProbability))
						continue;
					if (classDProbability >= classNProbability && classDProbability >= classSProbability)
						differentMeasures[category].push(measure);
				}

			self.ObjectPairs.metadata.differentMeasures = differentMeasures;
		},
		generateNumberArrays: function() {
			const self = ComparisonOperator;
			let data = self.ObjectPairs.data;
			let numberArrays = self.ObjectPairs.initNumberArrays();

			for (let category in numberArrays) {
				let yesObjects = data[category].yes;
				let noObjects = data[category].no;

				for (let measure in numberArrays[category].yes) {
					numberArrays[category].yes[measure] = self.Helpers.gatherNumbersWithHighContribution(yesObjects, measure);
					numberArrays[category].no[measure] = self.Helpers.gatherNumbersWithHighContribution(noObjects, measure);
				}
			}

			self.ObjectPairs.metadata.numberArrays = numberArrays;
		},
		generateProbabilityDistributions: function() {
			const self = ComparisonOperator;
			let data = self.ObjectPairs.data;
			let numberArrays = self.ObjectPairs.metadata.numberArrays;
			let pobabilityDistributions = self.ObjectPairs.initPobabilityDistributions();

			for (let category in pobabilityDistributions)
				for (let measure in pobabilityDistributions[category].yes) {
					let yesNumberArray = numberArrays[category].yes[measure];
					let noNumberArray = numberArrays[category].no[measure];
					let allNumbers = yesNumberArray.concat(noNumberArray);
					let min = d3.min(allNumbers), max = d3.max(allNumbers);

					pobabilityDistributions[category].yes[measure] = self.Helpers.generateOneProbabilityDistribution(yesNumberArray, min, max);
					pobabilityDistributions[category].no[measure] = self.Helpers.generateOneProbabilityDistribution(noNumberArray, min, max);
				}

			self.ObjectPairs.metadata.pobabilityDistributions = pobabilityDistributions;
		},

		// init

		initDifferentMeasures: function() {
			const self = ComparisonOperator;
			let data = self.ObjectPairs.data;
			let differentMeasures = {};

			for (let category in data)
				differentMeasures[category] = [];

			return differentMeasures;
		},
		initNumberArrays: function() {
			const self = ComparisonOperator;
			let data = self.ObjectPairs.data;
			let differentMeasures = self.ObjectPairs.metadata.differentMeasures;
			let numberArrays = {};			

			for (let category in differentMeasures) {
				numberArrays[category] = { yes: {}, no: {} };

				for (let i = 0; i < differentMeasures[category].length; i++) {
					let differentMeasure = differentMeasures[category][i];

					numberArrays[category].yes[differentMeasure] = [];
					numberArrays[category].no[differentMeasure] = [];
				}
			}

			return numberArrays;
		},
		initPobabilityDistributions: function() {
			const self = ComparisonOperator;
			let data = self.ObjectPairs.data;
			let differentMeasures = self.ObjectPairs.metadata.differentMeasures;
			let probabilityDistributions = {};			

			for (let category in differentMeasures) {
				probabilityDistributions[category] = { yes: {}, no: {} };

				for (let i = 0; i < differentMeasures[category].length; i++) {
					let differentMeasure = differentMeasures[category][i];

					probabilityDistributions[category].yes[differentMeasure] = [];
					probabilityDistributions[category].no[differentMeasure] = [];
				}
			}

			return probabilityDistributions;
		}
	},
	Objects: {
		meanType: null,
		data: {}, // rows in table
		metadata: {}, // { means, differentMeasures, numberArrays, probabilityDistributions }

		getData: function(dimension, categories) {
			const self = ComparisonOperator;
			let dataForEachCategory = MeanOperator.dataForEachCategory;
			let data = {};

			for (let category in dataForEachCategory)
				data[category] = dataForEachCategory[category].yes;

			self.Objects.data = data;
		},
		generateMeans: function(measures) {
			const self = ComparisonOperator;
			let measureMeansForEachCategory = MeanOperator.measureMeansForEachCategory;
			let means = {};

			for (let category in measureMeansForEachCategory)
				means[category] = measureMeansForEachCategory[category].yes;

			self.Objects.metadata.means = means;
		},
		generateDifferentMeasures: function() {
			const self = ComparisonOperator;
			let meanType = self.Objects.meanType;
			let means = self.Objects.metadata.means;
			let differentMeasures = self.Objects.initDifferentMeasures();

			for (let category in means)
				for (let measure in means[category]) {
					let currentMean = means[category][measure];
					let referenceMean = Database.allAttributeMetadata[measure][meanType];
					[ minValue, maxValue ] = FilterHandler.getMinMaxValues(measure);

					if (referenceMean === null)
						continue;

					let meanDifference = Math.abs(currentMean - referenceMean);
					let normalizedMeanDifference = (meanDifference - minValue) / (maxValue - minValue);

					let classDWeightedSum = normalizedMeanDifference * 45.6985 - 5.4464;
					let classDExp = Math.exp(classDWeightedSum);
					let classNWeightedSum = normalizedMeanDifference * 23.9107 - 1.9907;
					let classNExp = Math.exp(classNWeightedSum);

					classDProbability = classDExp / (1 + classDExp + classNExp);
					classNProbability = classNExp / (1 + classDExp + classNExp);
					classSProbability = 1 - classDProbability - classNProbability;

					if (isNaN(classDProbability))
						continue;
					if (classDProbability >= classNProbability && classDProbability >= classSProbability)
						differentMeasures[category].push(measure);
				}

			self.Objects.metadata.differentMeasures = differentMeasures;
		},
		generateNumberArrays: function() {
			const self = ComparisonOperator;
			let data = self.Objects.data;
			let numberArrays = self.Objects.initNumberArrays();

			for (let category in numberArrays) {
				let objects = data[category];

				for (let measure in numberArrays[category])
					numberArrays[category][measure] = self.Helpers.gatherNumbersWithHighContribution(objects, measure);
			}

			self.Objects.metadata.numberArrays = numberArrays;
		},
		generateProbabilityDistributions: function() {
			const self = ComparisonOperator;
			let data = self.Objects.data;
			let numberArrays = self.Objects.metadata.numberArrays;
			let pobabilityDistributions = self.Objects.initPobabilityDistributions();

			for (let category in pobabilityDistributions)
				for (let measure in pobabilityDistributions[category]) {
					let numberArray = numberArrays[category][measure];
					[ min , max ] = FilterHandler.getMinMaxValues(measure);

					pobabilityDistributions[category][measure] = self.Helpers.generateOneProbabilityDistribution(numberArray, min, max);
				}

			self.Objects.metadata.pobabilityDistributions = pobabilityDistributions;
		},

		// init

		initDifferentMeasures: function() {
			const self = ComparisonOperator;
			let data = self.Objects.data;
			let differentMeasures = {};

			for (let category in data)
				differentMeasures[category] = [];

			return differentMeasures;
		},
		initNumberArrays: function() {
			const self = ComparisonOperator;
			let data = self.Objects.data;
			let differentMeasures = self.Objects.metadata.differentMeasures;
			let numberArrays = {};			

			for (let category in differentMeasures) {
				numberArrays[category] = {};

				for (let i = 0; i < differentMeasures[category].length; i++) {
					let differentMeasure = differentMeasures[category][i];

					numberArrays[category][differentMeasure] = [];
				}
			}

			return numberArrays;
		},
		initPobabilityDistributions: function() {
			const self = ComparisonOperator;
			let data = self.Objects.data;
			let differentMeasures = self.Objects.metadata.differentMeasures;
			let probabilityDistributions = {};			

			for (let category in differentMeasures) {
				probabilityDistributions[category] = {};

				for (let i = 0; i < differentMeasures[category].length; i++) {
					let differentMeasure = differentMeasures[category][i];

					probabilityDistributions[category][differentMeasure] = [];
				}
			}

			return probabilityDistributions;
		}
	},
	Helpers: {
		gatherNumbersWithHighContribution: function(rows, measure) {
			let numberArray = [];
			let averageContributionToDenominator = Database.allAttributeMetadata[measure].averageContributionToDenominator;

			for (let i = 0; i < rows.length; i++) {
				let currentObject = rows[i];
				let currentDenominator = currentObject[measure].denominator;
				let currentValue = currentObject[measure].value;
				let currentDenominatorHasEnoughContribution = (currentDenominator / averageContributionToDenominator > 0.5);
				let currentValueIsMissing = (currentValue === null);

				if (currentDenominatorHasEnoughContribution && !currentValueIsMissing)
					numberArray.push(currentValue);
			}

			return numberArray;
		},
		generateOneProbabilityDistribution: function(numberArray, min, max) {
			const self = ComparisonOperator;
			let binNumber = self.binNumber;
			let binSize = (max - min) / binNumber;
			let counts = {};
			let probabilityDistribution = [];

			// init counts
			for (let i = 0; i < binNumber; i++)
				counts[i] = 0;

			for (let i = 0; i < numberArray.length; i++) {
				let currentValue = numberArray[i];
				let binIndex = Math.floor((currentValue - min) / binSize);

				if (binIndex >= binNumber)
					binIndex = binNumber - 1;

				counts[binIndex]++;
			}

			// store data
			for (let i = 0; i < binNumber; i++) {
				let currentBinCount = counts[i];
				let probability = currentBinCount / numberArray.length;

				probabilityDistribution.push(probability);
			}

			return probabilityDistribution;
		}
	}
}