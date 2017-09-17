var Database = {
	svg: null,

	trainingCategoricalWideNoOverlap: null,
	trainingCategoricalWideOverlap: null,
	trainingNumericalWideNoOverlap: null,
	trainingNumericalWideOverlap: null,

	studyCategoricalOneWideOverlap: null,
	studyNumericalBothWideOverlap: null,

	init: function() {
		var self = this;

		self.svg = d3.select("svg");
	},
	getData: function() {
		var self = this;

		d3.csv("csv/training_categorical_wide_noOverlap.csv", type, function(trainingCategoricalWideNoOverlap) {
		d3.csv("csv/training_categorical_wide_overlap.csv", type, function(trainingCategoricalWideOverlap) {
		d3.csv("csv/training_numerical_wide_noOverlap.csv", type, function(trainingNumericalWideNoOverlap) {
		d3.csv("csv/training_numerical_wide_overlap.csv", type, function(trainingNumericalWideOverlap) {
		d3.csv("csv/study_categorical_oneWide_overlap.csv", type, function(studyCategoricalOneWideOverlap) {
		d3.csv("csv/study_numerical_bothWide_overlap.csv", type, function(studyNumericalBothWideOverlap) {
			self.trainingCategoricalWideNoOverlap = trainingCategoricalWideNoOverlap;
			self.trainingCategoricalWideOverlap = trainingCategoricalWideOverlap;
			self.trainingNumericalWideNoOverlap = trainingNumericalWideNoOverlap;
			self.trainingNumericalWideOverlap = trainingNumericalWideOverlap;

			self.studyCategoricalOneWideOverlap = studyCategoricalOneWideOverlap;
			self.studyNumericalBothWideOverlap = studyNumericalBothWideOverlap;
		});
		});
		});
		});
		});
		});

		function type(data) {
			data.value = +data.value;
			return data;
		}
	}
}