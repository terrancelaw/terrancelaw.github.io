const LearningFromCleanView = {
	margin: { top: 45, right: 45, bottom: 45, left: 45 },
	chartWidth: null, chartHeight: null,
	trainErr: null, testErr: null, advErr: null,
	xAxisValues: [ 'All Benign', '20%', '40%', '60%', '80%', '100%' ],
	xScale: null, yScale: null, line: null, 
	svgGroup: null,

	init: function() {
		const self = this;
		let xAxisValues = self.xAxisValues;
		let margin = self.margin;

		let chartWidth = $('#learning-from-clean > .vis-container > .chart > svg').width();
		let chartHeight = $('#learning-from-clean > .vis-container > .chart > svg').height();
		let trainErr = self.getTrainErr();
		let testErr = self.getTestErr();
		let advErr = self.getAdvErr();

		let xScale = d3.scaleBand()
    		.domain(xAxisValues)
    		.range([ 0, chartWidth - margin.left - margin.right ]);
    	let yScale = d3.scaleLinear()
    		.domain([ 0, 1 ])
    		.range([ chartHeight - margin.top - margin.bottom, 0 ]);
    	let line = d3.line()
    		.x(function(d, i) { return xScale(xAxisValues[i]) + xScale.bandwidth() / 2; })
    		.y(function(d) { return yScale(d); })
    		.curve(d3.curveMonotoneX);
    	let svgGroup = d3.select('#learning-from-clean > .vis-container > .chart > svg').append('g')
    		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    	self.chartWidth = chartWidth;
		self.chartHeight = chartHeight;
		self.trainErr = trainErr;
		self.testErr = testErr;
		self.advErr = advErr;
		self.xScale = xScale;
		self.yScale = yScale;
		self.line = line;
		self.svgGroup = svgGroup;
	},
	drawChart: function() {
		const self = this;
		let trainErr = self.trainErr;
		let testErr = self.testErr;
		let advErr = self.advErr;

		self.drawAxes();
		self.drawLine(trainErr, d3.schemeTableau10[0], 'tr-e');
		self.drawLine(testErr, d3.schemeTableau10[1], 'te-e');
		self.drawLine(advErr, d3.schemeTableau10[2], 'adv-e');
		self.adjustText();
		self.drawLegend();
	},

	// init

	getTrainErr: function() {
		let trainErr = [];
		let data = Database.transferFromClean;

		trainErr.push(data.vgg[49].train_err);
		trainErr.push(data._20[49].train_err);
		trainErr.push(data._40[49].train_err);
		trainErr.push(data._60[49].train_err);
		trainErr.push(data._80[49].train_err);
		trainErr.push(data._100[49].train_err);

		return trainErr;
	},
	getTestErr: function() {
		let testErr = [];
		let data = Database.transferFromClean;

		testErr.push(data.vgg[49].test_err);
		testErr.push(data._20[49].test_err);
		testErr.push(data._40[49].test_err);
		testErr.push(data._60[49].test_err);
		testErr.push(data._80[49].test_err);
		testErr.push(data._100[49].test_err);

		return testErr;
	},
	getAdvErr: function() {
		let advErr = [];
		let data = Database.transferFromClean;

		advErr.push(data.vgg[49].adv_err);
		advErr.push(data._20[49].adv_err);
		advErr.push(data._40[49].adv_err);
		advErr.push(data._60[49].adv_err);
		advErr.push(data._80[49].adv_err);
		advErr.push(data._100[49].adv_err);

		return advErr;
	},

	// drawChart

	drawAxes: function() {
		const self = this;
		let svgGroup = self.svgGroup;
		let chartHeight = self.chartHeight;
		let chartWidth = self.chartWidth;
		let margin = self.margin;
		let xScale = self.xScale;
		let yScale = self.yScale;

		svgGroup.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + (chartHeight - margin.top - margin.bottom) + ")")
		    .call(d3.axisBottom(xScale));
		svgGroup.append("g")
		    .attr("class", "y axis")
		    .call(d3.axisLeft(yScale));

		svgGroup.append("text")             
      		.attr("transform", "translate(" + 
      			((chartWidth - margin.left - margin.right) / 2) + " ," +  
      			(chartHeight - margin.top - margin.bottom + 40) + ")")
      		.style("text-anchor", "middle")
     		.text('Training Probability')
     		.style('font-size', '15px');
     	svgGroup.append("text")
      		.attr("transform", "rotate(-90)")
      		.attr("y", 0 - margin.left)
      		.attr("x",0 - ((chartHeight - margin.top - margin.bottom) / 2))
      		.attr("dy", '0.8em')
      		.style("text-anchor", "middle")
      		.text('Error at 50th Epoch')
      		.style('font-size', '15px');
	},
	drawLine: function(data, color, className) {
		const self = this;
		let svgGroup = self.svgGroup;
		let xAxisValues = self.xAxisValues;
		let xScale = self.xScale;
		let yScale = self.yScale;
		let line = self.line;

		svgGroup.append('path')
    		.datum(data)
   			.attr('class', className + '-line')
    		.attr('d', line)
    		.style('fill', 'none')
    		.style('stroke', color)
    		.style('stroke-width', 2);
    	svgGroup.selectAll('.' + className + '-dot')
		    .data(data)
		  	.enter()
		  	.append("circle")
		    .attr("class", className + '-dot')
		    .attr("cx", function(d, i) { return xScale(xAxisValues[i]) + xScale.bandwidth() / 2; })
		    .attr("cy", function(d) { return yScale(d) })
		    .attr("r", 3)
		    .style('fill', color)
    		.style('stroke', 'white')
    		.style('stroke-width', 2);
    	svgGroup.selectAll('.' + className + '-text')
		    .data(data)
		  	.enter()
		  	.append("text")
		    .attr("class", className + '-text')
		    .attr("x", function(d, i) { return xScale(xAxisValues[i]) + xScale.bandwidth() / 2; })
		    .attr("y", function(d) { return yScale(d) })
		    .style('fill', color)
		    .style('font-size', '10px')
		    .style('font-weight', '400')
		    .text(function(d) { return d; });
	},
	adjustText: function() {
		const self = this;
		let svgGroup = self.svgGroup;
		let tr_e_text = svgGroup.selectAll('.tr-e-text').nodes();
		let te_e_text = svgGroup.selectAll('.te-e-text').nodes();
		let adv_e_text = svgGroup.selectAll('.adv-e-text').nodes();

		d3.select(tr_e_text[0]).attr('dx', 5).attr('dy', 0);
		d3.select(tr_e_text[1]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); })
		d3.select(tr_e_text[2]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); });
		d3.select(tr_e_text[3]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); });
		d3.select(tr_e_text[4]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); });
		d3.select(tr_e_text[5]).attr('dx', 0).attr('dy', 15);

		d3.select(te_e_text[0]).attr('dx', 5).attr('dy', 10);
		d3.select(te_e_text[1]).attr('dx', -8).attr('dy', 15).text(function(d) { return d.toFixed(3); })
		d3.select(te_e_text[2]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); })
		d3.select(te_e_text[3]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); });
		d3.select(te_e_text[4]).attr('dx', 0).attr('dy', 15).text(function(d) { return d.toFixed(3); })
		d3.select(te_e_text[5]).attr('dx', 0).attr('dy', 15);

		d3.select(adv_e_text[0]).attr('dx', -10).attr('dy', 15);
		d3.select(adv_e_text[1]).attr('dx', 0).attr('dy', -7);
		d3.select(adv_e_text[2]).attr('dx', 0).attr('dy', -7);
		d3.select(adv_e_text[3]).attr('dx', 0).attr('dy', -7);
		d3.select(adv_e_text[4]).attr('dx', 0).attr('dy', -7);
		d3.select(adv_e_text[5]).attr('dx', 0).attr('dy', -7);
	},
	drawLegend: function() {
		const self = this;
		let svgGroup = self.svgGroup;

		svgGroup.append('rect')
			.attr("x", 247)
		    .attr("y", 200)
		    .attr("width", 66)
		    .attr("height", 60)
		    .style('fill', 'white')
    		.style('stroke', '#d3d3d3');

		svgGroup.append('circle')
		    .attr("cx", 255)
		    .attr("cy", 210)
		    .attr("r", 3)
		    .style('fill', d3.schemeTableau10[0])
    		.style('stroke', 'white')
    		.style('stroke-width', 2);
    	svgGroup.append('circle')
		    .attr("cx", 255)
		    .attr("cy", 230)
		    .attr("r", 3)
		    .style('fill', d3.schemeTableau10[1])
    		.style('stroke', 'white')
    		.style('stroke-width', 2);
    	svgGroup.append('circle')
		    .attr("cx", 255)
		    .attr("cy", 250)
		    .attr("r", 3)
		    .style('fill', d3.schemeTableau10[2])
    		.style('stroke', 'white')
    		.style('stroke-width', 2);

    	svgGroup.append('text')
		    .attr("x", 262)
		    .attr("y", 210)
		    .style('fill', d3.schemeTableau10[0])
		    .style('font-size', '12px')
		    .style('font-weight', '400')
		    .style('alignment-baseline', 'middle')
		    .text('train_err');
    	svgGroup.append('text')
		    .attr("x", 262)
		    .attr("y", 230)
		    .style('fill', d3.schemeTableau10[1])
    		.style('font-size', '12px')
		    .style('font-weight', '400')
		    .style('alignment-baseline', 'middle')
		    .text('test_err');
    	svgGroup.append('text')
		    .attr("x", 262)
		    .attr("y", 250)
		    .style('fill', d3.schemeTableau10[2])
    		.style('font-size', '12px')
		    .style('font-weight', '400')
		    .style('alignment-baseline', 'middle')
		    .text('adv_err');
	}
}