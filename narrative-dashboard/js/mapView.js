const MapView = {
	selectedState: null,

	draw: function(isInitialization) {
		const self = this;
		let quantitativeAttr = isInitialization 
							 ? Database.getQuantitativeAttrList()[0] 
							 : $('#map-view > .header > .attribute[type="quantitative"]').attr('value');
		let year = isInitialization 
				 ? Database.getYearList().sort(function(a, b) { return b - a; })[0]
				 : $('#map-view > .header > .attribute[type="temporal"]').attr('value');

		self.selectedState = null;
		self.drawHeader(quantitativeAttr, year);
		self.drawContent(quantitativeAttr, year);
		self.installClickHeaderAttrBehaviour();
	},
	showLoader: function() {
		$('#map-view > .loader')
			.css('display', 'block');
	},
	hideLoader: function() {
		$('#map-view > .loader')
			.css('display', 'none');
	},

	// draw

	drawHeader: function(quantitativeAttr, year) {
		let itemName = Database.getItemName();
		let headerHTML = '<span class="attribute" type="quantitative" value="' + quantitativeAttr + '">' + quantitativeAttr + '</span> per ' + itemName + ' in ' + 
						 '<span class="attribute" type="temporal" value="' + year + '">' + year + '</span>';

		$('#map-view > .header')
			.html(headerHTML);
	},
	drawContent: function(quantitativeAttr, year) {
		let containerWidth = $('#map-view > .content').width();
		let containerHeight = $('#map-view > .content').height();
		let tooltipExpression = '{"State": datum.state, "' + quantitativeAttr + '": format(datum["' + quantitativeAttr + '"], ".2f")}'
		let vegaSpec = {
			$schema: 'https://vega.github.io/schema/vega/v5.json',
			width: containerWidth, height: containerHeight, autosize: 'none',
			signals: [
				{ name: "tx", update: "width / 2" },
    			{ name: "ty", update: "height / 2" },
    			{ 
    				name: "clickUS", value: null,
    				on: [{ events: "click", update: "item()" }] 
    			}, {
    				name: "scale", value: 550,
    				on: [{
						events: { type: "wheel", consume: true },
						update: "clamp(scale * pow(1.0005, -event.deltaY * pow(16, event.deltaMode)), 150, 3000)"
					}]
    			}, {
    				name: "angles", value: [0, 0],
    				on: [{
    					events: "mousedown",
    					update: "[rotateX, centerY]"
    				}]
    			}, {
    				name: "cloned", value: null,
    				on: [{
    					events: "mousedown",
    					update: "copy('projection')"
    				}]
    			}, {
    				name: "start", value: null,
    				on: [{
    					events: "mousedown",
    					update: "invert(cloned, xy())"
    				}]
    			}, {
    				name: "drag", value: null,
    				on: [{
    					events: "[mousedown, window:mouseup] > window:mousemove",
    					update: "invert(cloned, xy())"
    				}]
    			}, {
    				name: "delta", value: null,
    				on: [{
    					events: { signal: "drag"},
    					update: "[drag[0] - start[0], start[1] - drag[1]]"
    				}]
    			}, {
    				name: "rotateX", value: 95.5,
    				on: [{
    					events: { signal: "delta"},
    					update: "angles[0] + delta[0]"
    				}]
    			}, {
    				name: "centerY", value: 38.5,
    				on: [{
    					events: { signal: "delta" },
    					update: "clamp(angles[1] + delta[1], -60, 60)"
    				}]
    			}
			],
			data: [{
				name: "database",
      			values: Database.getFilteredDataByState(quantitativeAttr, year)
    		}, {
				name: "world",
				url: "data/world-110m.json",
				format: {
					type: "topojson",
					feature: "countries"
				}
			}, {
				name: "states",
				url: "data/us-10m.json",
				format: { type: "topojson", feature: "states" },
				transform: [
					{ type: "lookup", from: "database", key: "geoID", fields: [ "id" ], values: [ quantitativeAttr, "state" ] }
     	 		]
     	 	}, {
				name: "graticule",
				transform: [{ "type": "graticule", "step": [15, 15] }]
			}],
			projections: [{
				name: "projection",
				type: "mercator",
				scale: { signal: "scale" },
				rotate: [ {"signal": "rotateX"}, 0, 0 ],
				center: [ 0, { signal: "centerY" } ],
				translate: [ { signal: "tx" }, { signal: "ty" } ]
			}],
			scales: [{
				name: "color",
				type: "quantize",
				domain: { data: "database", field: quantitativeAttr },
				range: { scheme: "blues", count: 7 }
			}],
			legends: [{
				fill: "color",
				type: "symbol",
				orient: "bottom-right",
				title: quantitativeAttr,
				gradientLength: 120,
				encode: {
					symbols: { enter: { shape: { value: 'square' } } },
					labels: { enter: { fontSize: { value: 8 }, dx: { value: 3 }, fill: { value: 'gray' } } },
					title: { enter: { fontSize: { value: 9 }, fill: { value: 'gray' } } },
				}
			}],
			marks: [{
				type: "shape",
				from: { data: "graticule" },
				encode: {
					enter: {
						strokeWidth: { value: 1 },
						stroke: { value: "#f5f5f5" },
						fill: { value: null }
					}
				},
				transform: [{ type: "geoshape", projection: "projection" }]
    		}, {
    			type: "shape",
    			from: { data: "world" },
    			encode: {
    				enter: { fill: { value: "#f5f5f5" } }
    			},
    			transform: [{ type: "geoshape", projection: "projection" }]
    		}, {
    			type: "shape",
    			from: { data: "states" },
    			encode: {
    				enter: { fill: { value: "#f5f5f5" } },
    				update: { 
    					opacity: [
    						{ test: "!clickUS || !clickUS.datum || !clickUS.datum.state || datum.state == clickUS.datum.state", value: 1 }, 
    						{ value: 0.15 }
    					],
    					fill: { scale: "color", field: quantitativeAttr }, 
    					cursor: { value: "pointer" },
    					tooltip: { signal: tooltipExpression } 
    				}
    			},
    			transform: [{ type: "geoshape", projection: "projection" }]
    		}]
		};

		vegaEmbed('#map-view > .content', vegaSpec, { actions: false }).then(function(result) {
			let view = result.view;

			view.addSignalListener('clickUS', function(name, value) {
				let clickedBlankSpace = !('datum' in value)
				let clickOtherShapes = !clickedBlankSpace && !('state' in value.datum);
				let selectedState = (clickedBlankSpace || clickOtherShapes) ? null : value.datum.state;
				if (MapView.selectedState == selectedState) return;

				MapView.selectedState = selectedState;
				LeftTrendView.showLoader();
				MiddleTrendView.showLoader();
				RightTrendView.showLoader();
				NarrativeView.showLoader();

				setTimeout(function() {
					LeftTrendView.draw(isInitialization=false);
					MiddleTrendView.draw(isInitialization=false);
					RightTrendView.draw(isInitialization=false);
					NarrativeView.draw();

					LeftTrendView.hideLoader();
					MiddleTrendView.hideLoader();
					RightTrendView.hideLoader();
					NarrativeView.hideLoader();
				}, 50);
	        });
		});
	},
	installClickHeaderAttrBehaviour: function() {
		$('#map-view > .header > .attribute')
			.on('click', onClickHeaderAttribute);

		function onClickHeaderAttribute() {
			let attributeType = $(this).closest('.attribute').attr('type');
			let position = $(this).offset();
			let width = $(this).width();
			let height = $(this).height();
			let top = position.top + height - 8 + 20;
			let left = position.left + width / 2;

			$('#map-view > .header > .attribute').removeClass('clicking');
			$('#trend-view > .view > .header > .attribute').removeClass('clicking');
			$(this).addClass('clicking');
			
			DropDownMenu.show({
				attributeType: attributeType,
				focusedView: MapView,
				top: top, left: left, isUpArrow: true
			});
		}
	}
}