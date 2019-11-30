$(function() {
  Promise.all([
  		d3.csv('data/stochastic_vgg.csv'),
  		d3.csv('data/stochastic_20.csv'),
  		d3.csv('data/stochastic_40.csv'),
  		d3.csv('data/stochastic_60.csv'),
  		d3.csv('data/stochastic_80.csv'),
  		d3.csv('data/stochastic_100.csv'),

  		d3.csv('data/transferFromClean_vgg.csv'),
  		d3.csv('data/transferFromClean_20.csv'),
  		d3.csv('data/transferFromClean_40.csv'),
  		d3.csv('data/transferFromClean_60.csv'),
  		d3.csv('data/transferFromClean_80.csv'),
  		d3.csv('data/transferFromClean_100.csv'),

  		d3.csv('data/transferFromAdversarial_attacked.csv'),
  		d3.csv('data/transferFromAdversarial_20.csv'),
  		d3.csv('data/transferFromAdversarial_40.csv'),
  		d3.csv('data/transferFromAdversarial_60.csv'),
  		d3.csv('data/transferFromAdversarial_80.csv'),
  		d3.csv('data/transferFromAdversarial_100.csv')
	])
	.then(function(data) {
		Database.load(data);
		Database.preprocess();

        StochasticView.init();
        LearningFromCleanView.init();
        LearningFromAdvView.init();
        IndividualExperimentView.init();

        StochasticView.drawChart();
        LearningFromCleanView.drawChart();
        LearningFromAdvView.drawChart();
        IndividualExperimentView.drawChart();
        IndividualExperimentView.drawFinding();
	});
});