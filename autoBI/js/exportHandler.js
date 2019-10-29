const ExportHandler = {
	data: [],
	currentDataID: -1,

	storeData: function(data) {
		const self = this;

		self.data.push(data);
		self.currentDataID++;
	},
	export: function() {
		const self = this;
		let HTML = null;

		fetch('template.html').then(function(response) {
			response.text().then(function(text) {
				HTML = text;
				HTML = self.appendData(HTML);
				HTML = self.appendCharts(HTML);
				HTML = self.appendText(HTML);
				self.downloadHTML(HTML);
			});
		});
	},
	appendData: function(HTML) {
		const self = this;
		let dataString = JSON.stringify(self.data);

		dataString = 'let data = ' + dataString + ';';
		HTML = HTML.replace('[[DATA]]', dataString);
		return HTML;
	},
	appendCharts: function(HTML) {
		let objectList = DashboardHandler.objectList;
		let chartList = objectList.filter(function(d) { return d.objectType == 'chart' });
		let chartDivHTML = '';

		for (let i = 0; i < chartList.length; i++) {
			let chartData = chartList[i];
			let className = chartData.isOverflowY ? 'chart overflow-y' : 'chart';
			let timeUnit = chartData.insightSpec.type == 'trend' ? chartData.insightSpec.data.timeUnit : '';

			chartDivHTML += '<div ';
			chartDivHTML += 'class="' + className + '"';
			chartDivHTML += ' x="' + chartData.x + '"';
			chartDivHTML += ' y="' + chartData.y + '"';
			chartDivHTML += ' width="' + chartData.width + '"';
			chartDivHTML += ' height="' + chartData.height + '"';
			chartDivHTML += ' insight-type="' + chartData.insightSpec.type + '"';
			chartDivHTML += ' q-attr-list="' + chartData.insightSpec.quantitativeAttrList.toString() + '"';
			chartDivHTML += ' t-attr-list="' + chartData.insightSpec.temporalAttrList.toString() + '"';
			chartDivHTML += ' o-attr-list="' + chartData.insightSpec.ordinalAttrList.toString() + '"';
			chartDivHTML += ' n-attr-list="' + chartData.insightSpec.nominalAttrList.toString() + '"';
			chartDivHTML += ' time-unit="' + timeUnit + '"';
			chartDivHTML += ' data-id="' + chartData.dataID + '"';
			chartDivHTML += '><div class="container"></div></div>';
		}

		HTML = HTML.replace('[[CHARTS]]', chartDivHTML);
		return HTML;
	},
	appendText: function(HTML) {
		let objectList = DashboardHandler.objectList;
		let textList = objectList.filter(function(d) { return d.objectType == 'text' });
		let textDivHTML = '';

		for (let i = 0; i < textList.length; i++) {
			let textData = textList[i];
			textDivHTML += '<div ';
			textDivHTML += 'class="text"';
			textDivHTML += ' x="' + textData.x + '"';
			textDivHTML += ' y="' + textData.y + '"';
			textDivHTML += ' width="' + textData.width + '"';
			textDivHTML += ' height="' + textData.height + '"';
			textDivHTML += ' font-size="' + textData.fontSize + '"';
			textDivHTML += ' content="' + textData.content + '"';
			textDivHTML += '><div class="container"></div></div>';
		}

		HTML = HTML.replace('[[TEXTBOXES]]', textDivHTML);
		return HTML;
	},
	downloadHTML: function(HTML) {
		var link = document.createElement('a');
		var dataURI = URL.createObjectURL(new Blob([ HTML ], { type: 'text/html' }));

		link.href = dataURI;
		link.download = 'dashboard.html';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}