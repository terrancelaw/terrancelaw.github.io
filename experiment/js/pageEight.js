var PageEight = {
	init: function() {
		var self = this;

		self.drawContent();
		self.drawButton();
	},
	drawContent: function() {
		var self = this;

		self.drawMarbleSize();
		self.drawMarbleColors();

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 290)
			.style("font-size", 25)
			.text("In each task, you are presented with two pairs of groups, each contains 100 marbles. You are");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 320)
			.style("font-size", 25)
			.text("provided with the distributions of size and color of each group. Your task is to determine");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 350)
			.style("font-size", 25)
			.text("which pair contains groups which are more distinguishing (i.e. easier to tell them apart).");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 450)
			.style("font-size", 25)
			.text("When you are ready, click the button below to start the study. Thanks for helping!");
	},
	drawMarbleSize: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 80)
			.attr("y", 50)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.text("Marble Size:");
		Database.svg.append("line")
			.attr("x1", 250)
			.attr("x2", 550)
			.attr("y1", 45)
			.attr("y2", 45)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 250)
			.attr("x2", 250)
			.attr("y1", 40)
			.attr("y2", 50)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 400)
			.attr("x2", 400)
			.attr("y1", 40)
			.attr("y2", 50)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 550)
			.attr("x2", 550)
			.attr("y1", 40)
			.attr("y2", 50)
			.style("stroke", "black");
		Database.svg.append("text")
			.attr("x", 250)
			.attr("y", 33)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("1");
		Database.svg.append("text")
			.attr("x", 400)
			.attr("y", 33)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("5");
		Database.svg.append("text")
			.attr("x", 550)
			.attr("y", 33)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("10");

		Database.svg.append("svg:image")
   			.attr("x", 250 - 60)
			.attr("y", 65)
   			.attr('width', 120)
   			.attr("xlink:href","images/small_marble.png");
   		Database.svg.append("svg:image")
   			.attr("x", 400 - 60)
			.attr("y", 65)
   			.attr('width', 120)
   			.attr("xlink:href","images/medium_marble.png");
   		Database.svg.append("svg:image")
   			.attr("x", 550 - 60)
			.attr("y", 65)
   			.attr('width', 120)
   			.attr("xlink:href","images/large_marble.png");
	},
	drawMarbleColors: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 650)
			.attr("y", 50)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.text("Marble Colors:");

		Database.svg.append("text")
			.attr("x", 830)
			.attr("y", 50)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#F44336")
			.text("Red");
		Database.svg.append("text")
			.attr("x", 890)
			.attr("y", 50)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#FF5723")
			.text("Orange");
		Database.svg.append("text")
			.attr("x", 990)
			.attr("y", 50)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#E91E63")
			.text("Pink");

		Database.svg.append("text")
			.attr("x", 830)
			.attr("y", 80)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#9C27B0")
			.text("Purple");
		Database.svg.append("text")
			.attr("x", 920)
			.attr("y", 80)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#673AB7")
			.text("Deep Purple");
		Database.svg.append("text")
			.attr("x", 1070)
			.attr("y", 80)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#3F51B5")
			.text("Indigo");

		Database.svg.append("text")
			.attr("x", 830)
			.attr("y", 110)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#2096F3")
			.text("Blue");
		Database.svg.append("text")
			.attr("x", 910)
			.attr("y", 110)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#01BCD4")
			.text("Cyan");
		Database.svg.append("text")
			.attr("x", 990)
			.attr("y", 110)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#009588")
			.text("Teal");

		Database.svg.append("text")
			.attr("x", 830)
			.attr("y", 140)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.style("fill", "#4CAF50")
			.text("Green");
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
		PageNine.init();
	}
}