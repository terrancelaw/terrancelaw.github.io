var Slider = {
	init: function() {
		d3.select('#slider')
      		.call(d3.slider().axis(true).min(2000).max(2012).step(1)
            .on("slide", function(evt, value) {
            	Network.update(value);
            	LineChart.update(value);
            }));
	}
};