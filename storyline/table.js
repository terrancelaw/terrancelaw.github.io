var Table = {
	allSizeData: null,
	avgSizeData: null,

	init: function() {
		var self = this;

		d3.csv("csv/allSize.csv", function(data) {
			self.allSizeData = d3.nest()
									.key(function(d) {
										return d.name;
									})
									.entries(data);

			self.avgSizeData = d3.nest()
									.key(function(d) {
										return d.name;
									})
									.rollup(function(array) {
										var mean = d3.mean(array, function(d) {
											return d.size;
										})

										return mean;
									})
									.entries(data);
			self.avgSizeData.sort(function(a, b){return b.values - a.values});

			// create table header
			var header = $("<thead/>");
			var headerRow = $("<tr/>");
			headerRow.append($("<th/>").html("Size"));
			headerRow.append($("<th/>").html("Name"));
			header.append(headerRow);

			// create table body
			var body = $("<tbody/>");
			_.each(self.avgSizeData, function(d) {
				var row = $("<tr/>");

				var avgSize = $("<span/>").html(d.values);
				var avg = $("<td/>").append($("<div/>")).append(avgSize);
				var name = $("<td/>").html(d.key);
				
				row.append(avg).append(name);
				body.append(row);
			});

			$("#table-view").append("<table/>");
			$("#table-view table").append(header).append(body);

			// click on an item to create its flow
			$("#table-view table tbody tr").click(function() {
				var name = $(this).find("td:nth-child(2)").html();

				FlowFactory.createFlow(name);
			});

			var minSize = d3.min(self.avgSizeData, function(d) { return d.values; });
			var maxSize = d3.max(self.avgSizeData, function(d) { return d.values; });
			var radiusScale = d3.scale.linear()
										.domain([minSize, maxSize])
										.range([2, 10]);

			// insert svg to first cell of each row
			var circles = d3.select("#table-view")
							.selectAll("tbody tr")
							.select("td div")
							.data(self.avgSizeData)
							.append("svg")
							.attr("width", 20)
							.attr("height", 20)
							.append("circle")
							.attr("r", function(d) {
								return radiusScale(d.values);
							})
							.style("fill", "#ffe900")
							.attr("cx", 10)
							.attr("cy", 10);

			// render table
			$("#table-view table").DataTable({
		        "scrollY": "200px",
		        "scrollCollapse": true,
		        "paging": false,
		        "order": [[0, "desc"]]
    		});

    		$("#table-view table").addClass("compact hover display")
		});
	}
};