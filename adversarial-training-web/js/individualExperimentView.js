const IndividualExperimentView = {
	margin: { top: 45, right: 45, bottom: 45, left: 45 },
	chartWidth: null, chartHeight: null,
	xScale: null, yScale: null,
	svgGroup: null,

	init: function() {
		const self = this;
		let margin = self.margin;

		let chartWidth = $('#individual-experiment > .vis-container > .chart > svg').width();
		let chartHeight = $('#individual-experiment > .vis-container > .chart > svg').height();

		let xScale = d3.scaleLinear()
    		.domain([ 0, 49 ])
    		.range([ 0, chartWidth - margin.left - margin.right ]);
    	let yScale = d3.scaleLinear()
    		.domain([ 0, 1 ])
    		.range([ chartHeight - margin.top - margin.bottom, 0 ]);
    	let svgGroup = d3.select('#individual-experiment > .vis-container > .chart > svg').append('g')
    		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    	self.chartWidth = chartWidth;
		self.chartHeight = chartHeight;
		self.xScale = xScale;
		self.yScale = yScale;
		self.svgGroup = svgGroup;
		self.drawAxes();
		self.initStrategyDropDown();
		self.initExperimentDropDown();
	},
	drawChart: function() {
		const self = this;
		let strategy = self.getStrategy();
		let experiment = self.getExperiment();
		let data = Database[strategy][experiment];

		self.drawLine(data, 'train_err', d3.schemeTableau10[0], 'tr-e');
		self.drawLine(data, 'test_err', d3.schemeTableau10[1], 'te-e');
		self.drawLine(data, 'adv_err', d3.schemeTableau10[2], 'adv-e');
	},
	drawFinding: function() {
		const self = this;
		let strategy = self.getStrategy();
		let experiment = self.getExperiment();
		let data = Database[strategy][experiment];
		let findingHTML = '';

		let firstPoint_tr = data[0].train_err;
		let lastPoint_tr = data[49].train_err;
		let isDecreased_tr = lastPoint_tr < firstPoint_tr;
		let percentChange_tr = Math.round((Math.abs(lastPoint_tr - firstPoint_tr / firstPoint_tr) * 100) * 100) / 100;
		
		let firstPoint_te = data[0].test_err;
		let lastPoint_te = data[49].test_err;
		let isDecreased_te = lastPoint_te < firstPoint_te;
		let percentChange_te = Math.round((Math.abs(lastPoint_te - firstPoint_te / firstPoint_te) * 100) * 100) / 100;

		let firstPoint_adv = data[0].adv_err;
		let lastPoint_adv = data[49].adv_err;
		let isDecreased_adv = lastPoint_adv < firstPoint_adv;
		let percentChange_adv = Math.round((Math.abs(lastPoint_adv - lastPoint_adv / lastPoint_adv) * 100) * 100) / 100;

		findingHTML += '<div><span class="tr-e">train_err</span> ' + (isDecreased_tr ? 'decreases' : 'increases') + ' from ' + firstPoint_tr + ' to ' + lastPoint_tr + '(' + percentChange_tr + '% ' + (isDecreased_tr ? 'decrease' : 'increase') + ').</div>';
		findingHTML += '<div><span class="te-e">test_err</span> ' + (isDecreased_te ? 'decreases' : 'increases') + ' from ' + firstPoint_te + ' to ' + lastPoint_te + '(' + percentChange_te + '% ' + (isDecreased_te ? 'decrease' : 'increase') + ').</div>';
		findingHTML += '<div><span class="adv-e">adv_err</span> ' + (isDecreased_adv ? 'decreases' : 'increases') + ' from ' + firstPoint_adv + ' to ' + lastPoint_adv + '(' + percentChange_adv + '% ' + (isDecreased_adv ? 'decrease' : 'increase') + ').</div>';

		$('#individual-experiment > .vis-container > .finding')
			.html(findingHTML);
	},

	// init

	initStrategyDropDown: function() {
		const self = this;

		$('#individual-experiment > .introduction > .dropdown:nth-child(3) > .dropdown-menu > .dropdown-item')
			.on('click', selectStrategy);

		function selectStrategy() {
			let label = $(this).html();

			$(this.parentNode.parentNode).find('button').html(label);
			$(this.parentNode).find('.dropdown-item').removeClass('selected');
			$(this).addClass('selected');
			self.changeExperimentDropDownLabel();
			self.drawChart();
			self.drawFinding();
		}
	},
	initExperimentDropDown: function() {
		const self = this;

		$('#individual-experiment > .introduction > span:nth-child(5) > .dropdown-menu > .dropdown-item')
			.on('click', selectExperiment);

		function selectExperiment() {
			let label = $(this).html();

			$(this.parentNode.parentNode).find('button').html(label);
			$(this.parentNode).find('.dropdown-item').removeClass('selected');
			$(this).addClass('selected');
			self.drawChart();
			self.drawFinding();
		}
	},

	// initStrategyDropDown

	changeExperimentDropDownLabel: function() {
		const self = this;
		let strategy = self.getStrategy();
		let experiments = [ '0%', '20%', '40%', '60%', '80%', '100%' ];

		if (strategy == 'transferFromClean')
			experiments[0] = 'All Benign';
		if (strategy == 'transferFromAdversarial')
			experiments[0] = 'All Adversarial';

		$('#individual-experiment > .introduction > span:nth-child(5) button')
			.html(experiments[0])

		$('#individual-experiment > .introduction > span:nth-child(5) > .dropdown-menu > .dropdown-item').each(function(i) {
			if (i == 0) $(this).addClass('selected');
			if (i !== 0) $(this).removeClass('selected');
			$(this).html(experiments[i]);
		});
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
     		.text('Epoch')
     		.style('font-size', '15px');
     	svgGroup.append("text")
      		.attr("transform", "rotate(-90)")
      		.attr("y", 0 - margin.left)
      		.attr("x",0 - ((chartHeight - margin.top - margin.bottom) / 2))
      		.attr("dy", '0.8em')
      		.style("text-anchor", "middle")
      		.text('Error')
      		.style('font-size', '15px');
	},
	drawLine: function(data, errorType, color, className) {
		const self = this;
		let svgGroup = self.svgGroup;
		let xAxisValues = self.xAxisValues;
		let xScale = self.xScale;
		let yScale = self.yScale;
		let line = d3.line()
    		.x(function(d, i) { return xScale(i); })
    		.y(function(d) { return yScale(d[errorType]); })
    		.curve(d3.curveMonotoneX);

		let lineUpdate = svgGroup.selectAll('.' + className + '-line')
    		.data([ data ]);
    	let lineEnter = lineUpdate.enter().append('path')
    		.attr('class', className + '-line')
    		.style('fill', 'none')
    		.style('stroke', color)
    		.style('stroke-width', 2);
    	lineUpdate.merge(lineEnter)
    		.transition()
    		.attr('d', line);
    		
    	let dotUpdate = svgGroup.selectAll('.' + className + '-dot')
    		.data(data);
    	let dotEnter = dotUpdate.enter().append('circle')
    		.attr("class", className + '-dot')
    		.attr("r", 5)
		    .style('fill', color)
    		.style('stroke', 'none')
    		.style('opacity', 0)
    		.style('cursor', 'pointer')
    		.on('mouseenter', mouseenterDot)
    		.on('mouseleave', mouseleaveDot);
		dotUpdate.merge(dotEnter)
		    .attr("cx", function(d, i) { return xScale(i); })
		    .attr("cy", function(d) { return yScale(d[errorType]); });

		let textUpdate = svgGroup.selectAll('.' + className + '-text')
    		.data([ errorType ]);
    	let textEnter = textUpdate.enter().append('text')
    		.attr("x", xScale(49) + 5)
    		.attr("y", 0)
    		.attr('class', className + '-text')
		   	.style('fill', color)
		   	.style('alignment-baseline', 'middle')
		   	.style('font-size', '10px')
		    .style('font-weight', '400')
		    .text(errorType);
    	textUpdate.merge(textEnter)
    		.transition()
		   	.attr("y", yScale(data[49][errorType]))

    	function mouseenterDot(d, i) {
    		let svgGroup = IndividualExperimentView.svgGroup;
    		let className = d3.select(this).attr('class');
    		let isTr = className.indexOf('tr') != -1;
    		let isTe = className.indexOf('te') != -1;
    		let isAdv = className.indexOf('adv') != -1;
    		let errorType = isTr ? 'train_err' : (isTe ? 'test_err' : 'adv_err');  

    		svgGroup.selectAll('.tool-tip').remove();
    		svgGroup.selectAll('circle').style('opacity', 0);
    		d3.select(this).style('opacity', 1);

    		svgGroup.append('text')
    			.attr("class", 'tool-tip')
    			.attr("x", xScale(i) + 10)
		   		.attr("y", yScale(d[errorType]) + 10)
		   		.style('fill', color)
		   		.style('font-size', '13px')
		    	.style('font-weight', '400')
		    	.text(d[errorType]);
    	}

    	function mouseleaveDot() {
    		let svgGroup = IndividualExperimentView.svgGroup;
    		svgGroup.selectAll('.tool-tip').remove();
    		svgGroup.selectAll('circle').style('opacity', 0);
    	}
	},

	// helpers

	getStrategy: function() {
		let strategyID = +$('#individual-experiment > .introduction > .dropdown:nth-child(3) > .dropdown-menu > .dropdown-item.selected').attr('value');
		if (strategyID == 1) return 'stochastic';
		if (strategyID == 2) return 'transferFromClean';
		if (strategyID == 3) return 'transferFromAdversarial';
	},
	getExperiment: function() {
		let strategyID = +$('#individual-experiment > .introduction > .dropdown:nth-child(3) > .dropdown-menu > .dropdown-item.selected').attr('value');
		let experimentID = +$('#individual-experiment > .introduction > .dropdown:nth-child(5) > .dropdown-menu > .dropdown-item.selected').attr('value');
		if (strategyID != 3 && experimentID == 1) return 'vgg';
		if (strategyID == 3 && experimentID == 1) return 'attacked';
		if (experimentID == 2) return '_20';
		if (experimentID == 3) return '_40';
		if (experimentID == 4) return '_60';
		if (experimentID == 5) return '_80';
		if (experimentID == 6) return '_100';
	}
}