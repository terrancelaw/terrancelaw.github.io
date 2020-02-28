const DashboardView = {
	cursorDistFromLeftEdge: null,
	cursorDistFromTopEdge: null,

	show: function() {
		$('#dashboard-view')
			.css('display', 'block');
	},
	hide: function() {
		$('#dashboard-view')
			.css('display', 'none');
	},
	updateContent: function() {
		const self = this;

		self.updateCharts();
		self.updateText();
	},

	// updateContent

	updateCharts: function() {
		const self = this;
		let objectList = DashboardHandler.objectList;
		let chartList = objectList.filter(function(d) { return d.objectType == 'chart' });

		let chartUpdate = d3.select('#dashboard-view').selectAll('.chart')
			.data(chartList, function(d) { return d.ID });

		let chartEnter = chartUpdate.enter().append('div')
			.attr('class', 'chart object');

		chartEnter.each(function(d) {
			self.positionChartContainer(this);
			self.initChartContainer(this);
			self.drawResizableChart(this);
			self.installDraggingChart(this);
			self.installRemovingChart(this);
		});

		let chartExit = chartUpdate.exit()
			.remove();
	},
	updateText: function() {
		const self = this;
		let objectList = DashboardHandler.objectList;
		let textList = objectList.filter(function(d) { return d.objectType == 'text' });

		let textUpdate = d3.select('#dashboard-view').selectAll('.text')
			.data(textList, function(d) { return d.ID });

		let textEnter = textUpdate.enter().append('div')
			.attr('class', 'text object');

		textEnter.each(function(d) {
			self.positionTextBox(this);
			self.initTextBox(this);
			self.installResizingTextBox(this);
			self.installDraggingTextBox(this);
			self.installRemovingTextBox(this);
			self.installIncreasingFontSize(this);
			self.installDecreasingFontSize(this);
			self.installStoringTextOnInput(this);
		});

		let textExit = textUpdate.exit()
			.remove();
	},

	// updateCharts

	positionChartContainer: function(outerContainerEl) {
		let chartData = d3.select(outerContainerEl).datum();

		$(outerContainerEl).css({
			left: chartData.x, 
			top: chartData.y, 
			width: chartData.width, 
			height: chartData.height
		});
	},
	initChartContainer: function(outerContainerEl) {
		$(outerContainerEl).html(
			'<div class="container"></div>' +
			'<div class="remove button">' +
				'<i class="fas fa-times-circle"></i>' +
				'<span class="tooltip">Remove from Dashboard</span>' +
			'</div>'
		);
	},
	drawResizableChart: function(outerContainerEl) {
		let innerContainerEl = $(outerContainerEl).find('.container')[0];
		let chartData = d3.select(outerContainerEl).datum();
		let isInitiallyOverflowY = chartData.isInitiallyOverflowY;
		let VLSpec = chartData.content;

		vegaEmbed(innerContainerEl, VLSpec, { actions: false }).then(function(result) {
			let isOverflowY = innerContainerEl.offsetHeight < innerContainerEl.scrollHeight;
			let vegaView = result.view;
			chartData.vegaView = vegaView;

			if (isInitiallyOverflowY && isOverflowY) {
				chartData.isOverflowY = true;
				$(innerContainerEl).addClass('overflow-y');
			}

			$(outerContainerEl).resizable({
				create: createResize,
				start: startResize,
				resize: resize,
				stop: endResize
			});
		});

		function createResize() {
			let outerContainerEl = this;

			$(outerContainerEl).find('.ui-resizable-e').remove();
			$(outerContainerEl).find('.ui-resizable-s').remove();
			$(outerContainerEl).find('.ui-icon-gripsmall-diagonal-se').css('z-index', '');
		}

		function startResize(event) {
			let outerContainerEl = this;

			$('#dashboard-view > .object').css('z-index', '');
			$('#dashboard-view > .object').css('border', '');
			$('#dashboard-view > .object > .remove.button').css('display', '');
			$('#dashboard-view > .object > .ui-resizable-handle').css('visibility', '');
			$(outerContainerEl).css('z-index', 999);
			$(outerContainerEl).css('border', '2px dotted #c3d7e7');
			$(outerContainerEl).find('.remove.button').css('display', 'block');
			$(outerContainerEl).find('.ui-resizable-handle').css('visibility', 'visible');
		}

		function resize(event) {
			let outerContainerEl = this;
			let innerContainerEl = $(outerContainerEl).find('.container')[0];
			let chartData = d3.select(outerContainerEl).datum();
			let pressedShiftButton = event.shiftKey;
			let isInitiallyOverflowY = chartData.isInitiallyOverflowY;

			let containerWidth = $(innerContainerEl).width();
			let containerHeight = $(innerContainerEl).height();
			let chartWidth = containerWidth - 100;
			let chartHeight  = containerHeight - 100;
			let maxContainerDimension = null;
			let delayUpdateChart = chartData.insightSpec.type == 'correlation' && 
								   chartData.datasetSize >= 10000;

			if (pressedShiftButton) {
				maxContainerDimension = d3.max([ containerWidth, containerHeight ]);
				containerWidth = maxContainerDimension;
				containerHeight = maxContainerDimension;
				chartWidth = maxContainerDimension - 100;
				chartHeight = maxContainerDimension - 100;
				$(outerContainerEl).css({ 
					width: containerWidth, 
					height: containerHeight 
				});
			}

			if (!delayUpdateChart)
				chartData.vegaView.width(chartWidth).height(chartHeight).run();

			if (isInitiallyOverflowY) {
				let isOverflowY = innerContainerEl.offsetHeight < innerContainerEl.scrollHeight;

				if (isOverflowY) {
					chartData.isOverflowY = true;
					$(innerContainerEl).addClass('overflow-y');
				}
				if (!isOverflowY) {
					chartData.isOverflowY = false;
					$(innerContainerEl).removeClass('overflow-y');
				}
			}

			chartData.width = containerWidth;
			chartData.height = containerHeight;
		}

		function endResize(event) {
			let outerContainerEl = this;
			let innerContainerEl = $(outerContainerEl).find('.container')[0];
			let chartData = d3.select(outerContainerEl).datum(); 
			let pressedShiftButton = event.shiftKey;
			let isInitiallyOverflowY = chartData.isInitiallyOverflowY;

			let containerWidth = $(outerContainerEl).width();
			let containerHeight = $(outerContainerEl).height();
			let roundedContainerWidth = Math.round(containerWidth / 20) * 20;
			let roundedContainerHeight = Math.round(containerHeight / 20) * 20;
			let roundedChartWidth = roundedContainerWidth - 100;
			let roundedChartHeight = roundedContainerHeight - 100;
			let maxContainerDimension = null;

			if (pressedShiftButton) {
				maxContainerDimension = d3.max([ roundedContainerWidth, roundedContainerHeight ]);
				roundedContainerWidth = maxContainerDimension;
				roundedContainerHeight = maxContainerDimension;
				roundedChartWidth = maxContainerDimension - 100;
				roundedChartHeight = maxContainerDimension - 100;
			}

			$(outerContainerEl).css({ width: roundedContainerWidth, height: roundedContainerHeight });
			chartData.vegaView.width(roundedChartWidth).height(roundedChartHeight).run();
			chartData.width = roundedContainerWidth;
			chartData.height = roundedContainerHeight;

			if (isInitiallyOverflowY) {
				let isOverflowY = innerContainerEl.offsetHeight < innerContainerEl.scrollHeight;

				if (isOverflowY) {
					chartData.isOverflowY = true;
					$(innerContainerEl).addClass('overflow-y');
				}
				if (!isOverflowY) {
					chartData.isOverflowY = false;
					$(innerContainerEl).removeClass('overflow-y');
				}
			}

		}
	},
	installDraggingChart: function(outerContainerEl) {
		let innerContainerEl = $(outerContainerEl).find('.container')[0];
		let dragBehaviour = d3.drag()
			.on('start', startDragging)
			.on('drag', onDragging)
			.on('end', endDragging);

		d3.select(innerContainerEl)
			.call(dragBehaviour);

		function startDragging() {
			let outerContainerEl = this.parentNode;
			let innerContainerEl = this;

			let mouseX = d3.event.sourceEvent.clientX - 8;
			let mouseY = d3.event.sourceEvent.clientY - 8;
			let chartX = $(outerContainerEl).position().left;
			let chartY = $(outerContainerEl).position().top;

			DashboardView.cursorDistFromLeftEdge = mouseX - chartX;
			DashboardView.cursorDistFromTopEdge = mouseY - chartY;
			$('#dashboard-view > .object').css('z-index', '');
			$('#dashboard-view > .object').css('border', '');
			$('#dashboard-view > .object > .button').css('display', '');
			$('#dashboard-view > .object > .buttons').css('display', '');
			$('#dashboard-view > .object > .ui-resizable-handle').css('visibility', '');
			$(outerContainerEl).css('z-index', 999);
			$(outerContainerEl).css('border', '2px dotted #c3d7e7');
			$(outerContainerEl).find('.remove.button').css('display', 'block');
			$(outerContainerEl).find('.ui-resizable-handle').css('visibility', 'visible');
		}

		function onDragging() {
			let outerContainerEl = this.parentNode;
			let innerContainerEl = this;
			let chartData = d3.select(outerContainerEl).datum();

			let mouseX = d3.event.sourceEvent.clientX - 8;
			let mouseY = d3.event.sourceEvent.clientY - 8;
			let chartX = mouseX - DashboardView.cursorDistFromLeftEdge;
			let chartY = mouseY - DashboardView.cursorDistFromTopEdge;

			chartData.x = chartX;
			chartData.y = chartY;
			$(outerContainerEl).css({
				top: chartY, 
				left: chartX 
			});
		}

		function endDragging() {
			let outerContainerEl = this.parentNode;
			let innerContainerEl = this;
			let chartData = d3.select(outerContainerEl).datum();

			let chartX = $(outerContainerEl).position().left;
			let chartY = $(outerContainerEl).position().top;
			let roundedChartX = Math.round(chartX / 20) * 20;
			let roundedChartY = Math.round(chartY / 20) * 20;

			chartData.x = roundedChartX;
			chartData.y = roundedChartY;
			$(outerContainerEl).css({
				top: roundedChartY,
				left: roundedChartX
			});
		}
	},
	installRemovingChart: function(outerContainerEl) {		
		$(outerContainerEl).find('.remove.button')
			.on('click', clickRemoveButton);

		function clickRemoveButton() {
			let outerContainerEl = this.parentNode;
			let chartData = d3.select(outerContainerEl).datum();
			
			DashboardHandler.removeFromObjectList(chartData);
			DashboardView.updateContent();
		}
	},

	// updateText

	positionTextBox: function(outerContainerEl) {
		let textData = d3.select(outerContainerEl).datum();

		$(outerContainerEl).css({
			left: textData.x, 
			top: textData.y, 
			width: textData.width, 
			height: textData.height
		});
	},
	initTextBox: function(outerContainerEl) {
		let textData = d3.select(outerContainerEl).datum();
		let textBoxStyle = 'style="font-size:' + textData.fontSize + 'px"'

		$(outerContainerEl).html(
			'<div class="container" contenteditable="true" ' + textBoxStyle + ' placeholder="Enter Text Here"></div>' +
			'<div class="buttons">' +
				'<div class="remove button">' +
					'<i class="fas fa-times-circle"></i>' +
					'<span class="tooltip">Remove from Dashboard</span>' +
				'</div>' +
				'<div class="increase-font-size button">' +
					'<i class="fas fa-arrow-alt-circle-up"></i>' +
					'<span class="tooltip">Increase Font Size</span>' +
				'</div>' +
				'<div class="decrease-font-size button">' +
					'<i class="fas fa-arrow-alt-circle-down"></i>' +
					'<span class="tooltip">Decrease Font Size</span>' +
				'</div>' +
			'</div>'
		);
	},
	installResizingTextBox: function(outerContainerEl) {
		$(outerContainerEl).resizable({
			create: createResize,
			start: startResize,
			resize: resize
		});

		function createResize() {
			let outerContainerEl = this;

			$(outerContainerEl).find('.ui-resizable-e').remove();
			$(outerContainerEl).find('.ui-resizable-s').remove();
			$(outerContainerEl).find('.ui-icon-gripsmall-diagonal-se').css('z-index', '');
		}

		function startResize(event) {
			let outerContainerEl = this;

			$('#dashboard-view > .object').css('z-index', '');
			$('#dashboard-view > .object').css('border', '');
			$('#dashboard-view > .object > .button').css('display', '');
			$('#dashboard-view > .object > .buttons').css('display', '');
			$('#dashboard-view > .object > .ui-resizable-handle').css('visibility', '');
			$(outerContainerEl).css('z-index', 999);
			$(outerContainerEl).css('border', '2px dotted #c3d7e7');
			$(outerContainerEl).find('.buttons').css('display', 'block');
			$(outerContainerEl).find('.ui-resizable-handle').css('visibility', 'visible');
		}

		function resize(event) {
			let outerContainerEl = this;
			let textData = d3.select(outerContainerEl).datum();
			let pressedShiftButton = event.shiftKey;

			let containerWidth = $(outerContainerEl).width();
			let containerHeight = $(outerContainerEl).height();
			let maxContainerDimension = null;

			if (pressedShiftButton) {
				maxContainerDimension = d3.max([ containerWidth, containerHeight ]);
				containerWidth = maxContainerDimension;
				containerHeight = maxContainerDimension;
				$(outerContainerEl).css({ 
					width: containerWidth, 
					height: containerHeight 
				});
			}

			textData.width = containerWidth;
			textData.height = containerHeight;
		}
	},
	installDraggingTextBox: function(outerContainerEl) {
		let innerContainerEl = $(outerContainerEl).find('.container')[0];
		let dragBehaviour = d3.drag()
			.on('start', startDragging)
			.on('drag', onDragging);

		d3.select(innerContainerEl).call(dragBehaviour);
		$(innerContainerEl).dblclick(dblclickInnerContainer);

		function startDragging() {
			let outerContainerEl = this.parentNode;

			let mouseX = d3.event.sourceEvent.clientX - 8;
			let mouseY = d3.event.sourceEvent.clientY - 8;
			let textX = $(outerContainerEl).position().left;
			let textY = $(outerContainerEl).position().top;

			DashboardView.cursorDistFromLeftEdge = mouseX - textX;
			DashboardView.cursorDistFromTopEdge = mouseY - textY;
			$('#dashboard-view > .object').css('z-index', '');
			$('#dashboard-view > .object').css('border', '');
			$('#dashboard-view > .object > .button').css('display', '');
			$('#dashboard-view > .object > .buttons').css('display', '');
			$('#dashboard-view > .object > .ui-resizable-handle').css('visibility', '');
			$(outerContainerEl).css('z-index', 999);
			$(outerContainerEl).css('border', '2px dotted #c3d7e7');
			$(outerContainerEl).find('.buttons').css('display', 'block');
			$(outerContainerEl).find('.ui-resizable-handle').css('visibility', 'visible');
			$(this).placeCaretAtEnd();
		}

		function onDragging() {
			let outerContainerEl = this.parentNode;
			let textData = d3.select(outerContainerEl).datum();

			let mouseX = d3.event.sourceEvent.clientX - 8;
			let mouseY = d3.event.sourceEvent.clientY - 8;
			let textX = mouseX - DashboardView.cursorDistFromLeftEdge;
			let textY = mouseY - DashboardView.cursorDistFromTopEdge;

			textData.x = textX;
			textData.y = textY;
			$(outerContainerEl).css({
				top: textY, 
				left: textX 
			});
		}

		function dblclickInnerContainer() {
			$(this).selectText();
		}
	},
	installRemovingTextBox: function(outerContainerEl) {
		$(outerContainerEl).find('.remove.button')
			.on('click', clickRemoveButton);

		function clickRemoveButton() {
			let outerContainerEl = this.parentNode.parentNode;
			let textData = d3.select(outerContainerEl).datum();
			
			DashboardHandler.removeFromObjectList(textData);
			DashboardView.updateContent();
		}
	},
	installIncreasingFontSize: function(outerContainerEl) {
		$(outerContainerEl).find('.increase-font-size.button')
			.on('click', clickIncreaseFontSizeButton);

		function clickIncreaseFontSizeButton() {
			let outerContainerEl = this.parentNode.parentNode;
			let innerContainerEl = $(outerContainerEl).find('.container')[0];
			let textData = d3.select(outerContainerEl).datum();
			let fontSize = textData.fontSize + 2;

			$(innerContainerEl).css('font-size', fontSize);
			textData.fontSize = fontSize;	
		}
	},
	installDecreasingFontSize: function(outerContainerEl) {
		$(outerContainerEl).find('.decrease-font-size.button')
			.on('click', clickDecreaseFontSizeButton);

		function clickDecreaseFontSizeButton() {
			let outerContainerEl = this.parentNode.parentNode;
			let innerContainerEl = $(outerContainerEl).find('.container')[0];
			let textData = d3.select(outerContainerEl).datum();
			let fontSize = textData.fontSize - 2;
			if (fontSize < 3) fontSize = 5;

			$(innerContainerEl).css('font-size', fontSize);
			textData.fontSize = fontSize;	
		}
	},
	installStoringTextOnInput: function(outerContainerEl) {
		$(outerContainerEl).find('.container')
			.on('input', inputText);

		function inputText() {
			let outerContainerEl = this.parentNode;
			let input = $(this).html();
			let textData = d3.select(outerContainerEl).datum();
			
			textData.content = input;
		}
	}
}