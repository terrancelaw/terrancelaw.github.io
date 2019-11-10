const MiddleTrendView = {
	draw: function(isInitialization) {
		const self = this;
		let quantitativeAttr = isInitialization ? Database.getQuantitativeAttrList()[1]
							 : $('#trend-view > .view:nth-child(2) > .header > .attribute[type="quantitative"]').attr('value');

		self.drawHeader(quantitativeAttr);
		self.drawContent(quantitativeAttr);
		self.installClickHeaderAttrBehaviour();
	},
	showLoader: function() {
		$('#trend-view > .view:nth-child(2) > .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#trend-view > .view:nth-child(2) > .loader')
			.css('display', 'none');
	},

	// draw

	drawHeader: function(quantitativeAttr) {
		let itemName = Database.getItemName();
		let filterState = MapView.selectedState;
		let stateAbbr = filterState !== null ? Database.stateToAbbr[filterState] : '';
		let headerHTML = '';

		headerHTML += '<span class="attribute" type="quantitative" value="' + quantitativeAttr + '">' + quantitativeAttr + '</span>';
		headerHTML += ' per ' + itemName + (filterState !== null ? ' in ' + stateAbbr : '');
		$('#trend-view > .view:nth-child(2) > .header').html(headerHTML);
	},
	drawContent: function(quantitativeAttr) {
		let filterState = MapView.selectedState;
		let containerWidth = $('#trend-view > .view:nth-child(2) > .content').width();
		let containerHeight = $('#trend-view > .view:nth-child(2) > .content').height();
		let vegaLiteSpec = {
			$schema: "https://vega.github.io/schema/vega-lite/v5.json",
			width: containerWidth - 90, height: containerHeight - 60,
			data: { values: Database.data },
			mark: {
				type: "line",
				point: { filled: false, fill: "white" }
			},
			encoding: {
				x: { 
					field: "Year", type: "temporal", timeUnit: "year", 
					axis: { 
						labelColor: "gray", labelFontSize: 8,
						titleColor: "gray", titleFontSize: 9, title: 'Year', titleFontWeight: 'normal',
						gridDash: [ 2, 2 ], tickCount: 10,
						labelExpr: "(datum.index === 0 || datum.index === 1) ? null : datum.label"
					}
				},
				y: {
					field: quantitativeAttr, type: "quantitative", aggregate: "mean",
					axis: { 
						labelColor: "gray", labelFontSize: 8,
						titleColor: "gray", titleFontSize: 9, titleFontWeight: 'normal',
						gridDash: [ 2, 2 ] 
					}
				},
				tooltip: [
			      { field: quantitativeAttr, type: "quantitative", aggregate: "mean", format: ".2f" },
			      { field: "Year", type: "temporal", timeUnit: "year", title: 'Year' }
			    ]
			}
		}

		if (filterState !== null) vegaLiteSpec.transform = [{ filter: { field: "State", equal: filterState } }];
		vegaEmbed('#trend-view > .view:nth-child(2) > .content', vegaLiteSpec, { actions: false });
	},
	installClickHeaderAttrBehaviour: function() {
		$('#trend-view > .view:nth-child(2) > .header > .attribute')
			.on('click', onClickHeaderAttribute);

		function onClickHeaderAttribute() {
			let attributeType = $(this).closest('.attribute').attr('type');
			let position = $(this).offset();
			let width = $(this).width();
			let height = $(this).height();
			let top = position.top - 8 - 20;
			let left = position.left + width / 2;

			$('#map-view > .header > .attribute').removeClass('clicking');
			$('#trend-view > .view > .header > .attribute').removeClass('clicking');
			$(this).addClass('clicking');
			
			DropDownMenu.show({
				attributeType: attributeType,
				focusedView: MiddleTrendView,
				top: top, left: left, isUpArrow: false
			});
		}
	}
}