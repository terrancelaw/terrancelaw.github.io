const InsightView = {
	show: function() {
		$('#insight-view')
			.css('display', 'block');
	},
	hide: function() {
		$('#insight-view')
			.css('display', 'none');
	},
	updateHeader: function() {
		let fileName = Database.fileName;

		$('#insight-view > .header > .file-name')
			.html(fileName)
	},
	updateContent: function() {
		const self = this;

		self.drawInsightContainers();
		self.drawVisualization();
		self.drawDescription();
		self.installAddToDashboardButton();
	},

	// updateContent

	drawInsightContainers: function() {
		let visList = InsightHandler.visList;

		let insightUpdate = d3.select('#insight-view > .content').selectAll('.insight')
			.data(visList);

		let insightEnter = insightUpdate.enter().append('div')
			.attr('class', 'insight');

		insightUpdate.merge(insightEnter).each(function() {
			$(this).html(
				'<div class="visualization"></div>' +
				'<div class="description"></div>' +
				'<div class="add-to-dashbord button">' +
					'<i class="fas fa-plus-circle"></i>' +
					'<span class="tooltip">Add to Dashboard</span>' +
				'</div>'
			);
		});

		let insightExit = insightUpdate.exit()
			.remove();
	},
	drawVisualization: function() {
		$('#insight-view > .content > .insight > .visualization').each(function() {
			let containerEl = this;
			let insightEl = this.parentNode;
			let visData = d3.select(insightEl).datum();
			let VLSpec = visData.VLSpec;

			vegaEmbed(this, VLSpec, { actions: false }).then(function(result) {
				let isOverflowY = containerEl.offsetHeight < containerEl.scrollHeight;
				if (isOverflowY) $(containerEl).addClass('overflow-y');
				if (!isOverflowY) $(containerEl).removeClass('overflow-y');
			});
		});
	},
	drawDescription: function() {
		$('#insight-view > .content > .insight > .description').each(function() {
			let insightEl = this.parentNode;
			let visData = d3.select(insightEl).datum();
			let description = visData.description;

			$(this).html('<span class="container">' + description + '</span>');
		});
	},
	installAddToDashboardButton: function() {
		$('#insight-view > .content > .insight > .add-to-dashbord.button')
			.on('click', clickAddToDashboardButton);

		function clickAddToDashboardButton() {
			let buttonEl = this;
			let tooltipEl = $(this).find('.tooltip')[0];
			let insightEl = this.parentNode;
			let containerEl = $(insightEl).find('.visualization');

			let isInitiallyOverflowY = $(containerEl).hasClass('overflow-y');
			let visData = d3.select(this.parentNode).datum();
			let insightSpec = visData.insightSpec;
			let VLSpec = visData.VLSpec;

			// add content + show signifier
			$(tooltipEl).html('Added!')
			$(buttonEl).addClass('changed');
			DashboardHandler.addToObjectList({
				objectType: 'chart', width: 300, height: 300, 
				content: VLSpec, insightSpec: insightSpec,
				isInitiallyOverflowY: isInitiallyOverflowY, fontSize: null,
				dataID: ExportHandler.currentDataID
			});

			// remove signifier
			setTimeout(function() {
				$(tooltipEl).html('Add to Dashboard');
				$(buttonEl).removeClass('changed');
			}, 700);
		}
	}
}