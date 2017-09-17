var PageSeven = {
	init: function() {
		var self = this;

		self.drawContent();
		self.drawButton();
	},
	drawContent: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 20)
			.style("font-size", 25)
			.text("Great! You are done with the training.");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 120)
			.style("font-size", 25)
			.text("For the following study, we have collected marbles of different sizes and colors. Their size");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 150)
			.style("font-size", 25)
			.text("falls between 1 and 10. There are 10 different colors of marbles: red, orange, pink, purple,");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 180)
			.style("font-size", 25)
			.text("deep purple, indigo, blue, cyan, teal, green.");

		self.drawMarble();
	},
	drawMarble: function() {
		var self = this;

		Database.svg.append("svg:image")
   			.attr("x", 600 - 275)
			.attr("y", 250)
   			.attr('width', 550)
   			.attr("xlink:href","images/marble.jpg");
	},
	drawButton: function() {
		var self = this;

		var button = Database.svg.append("g")
			.style("cursor", "pointer")
			.on("click", function() {
				self.clear();
			});

		var buttonText = button.append("text")
			.attr("class", "button-text")
			.attr("x", 600)
			.attr("y", 760)
			.style("font-size", 25)
			.style("text-anchor", "middle")
			.style("alignment-baseline", "middle")
			.text("Next");

		var bbox = buttonText.node().getBBox();
		button.insert("rect", ".button-text")
			.attr("x", bbox.x - 5)
			.attr("y", bbox.y - 2)
			.attr("width", bbox.width + 10)
			.attr("height", bbox.height + 4)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "#e8e8e8");
	},
	clear: function() {
		var self = this;

		Database.svg.selectAll("*").remove();
		PageEight.init();
	}
}