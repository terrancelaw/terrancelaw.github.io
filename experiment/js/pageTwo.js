var PageTwo = {
	init: function() {
		var self = this;

		self.drawContent();
		self.drawButton();
	},
	drawContent: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 600)
			.attr("y", 20)
			.style("font-weight", "bold")
			.style("font-size", 25)
			.style("text-anchor", "middle")
			.text("Training session");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 180)
			.style("font-size", 25)
			.text("We have collected the height and weight data of a large pool of people. Their height falls");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 210)
			.style("font-size", 25)
			.text("between 4'2'' (127cm) and 6'3'' (190.5cm). Based on the weight data, we classified them into");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 240)
			.style("font-size", 25)
			.text("three different body builds, skinny, medium build and obese.");

		self.drawHeightImages();
		self.drawWeightImages();

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 490)
			.style("font-size", 25)
			.text("In each task, you are presented with two pairs of groups, each contains 100 people. You are");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 520)
			.style("font-size", 25)
			.text("provided with the distributions of height and body build of each group. Your task is to");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 550)
			.style("font-size", 25)
			.text("determine which pair contains groups which are more distinguishing (i.e. you find it easier to");
		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 580)
			.style("font-size", 25)
			.text("tell them apart).");

		Database.svg.append("text")
			.attr("x", 100)
			.attr("y", 650)
			.style("font-size", 25)
			.text("When you are ready, click the button to start the training.");
	},
	drawHeightImages: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 80)
			.attr("y", 320)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.text("Height:");
		Database.svg.append("line")
			.attr("x1", 200)
			.attr("x2", 500)
			.attr("y1", 315)
			.attr("y2", 315)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 200)
			.attr("x2", 200)
			.attr("y1", 310)
			.attr("y2", 320)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 350)
			.attr("x2", 350)
			.attr("y1", 310)
			.attr("y2", 320)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 500)
			.attr("x2", 500)
			.attr("y1", 310)
			.attr("y2", 320)
			.style("stroke", "black");
		Database.svg.append("text")
			.attr("x", 200)
			.attr("y", 303)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("4'2''");
		Database.svg.append("text")
			.attr("x", 350)
			.attr("y", 303)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("5'3''");
		Database.svg.append("text")
			.attr("x", 500)
			.attr("y", 303)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("6'3''");

		Database.svg.append("svg:image")
   			.attr("x", 200 - 15)
			.attr("y", 330 + 27)
   			.attr('width', 35)
   			.attr("xlink:href","images/short.png");
   		Database.svg.append("svg:image")
   			.attr("x", 350 - 15)
			.attr("y", 330 + 8)
   			.attr('width', 30)
   			.attr("xlink:href","images/medium.png");
   		Database.svg.append("svg:image")
   			.attr("x", 500 - 15)
			.attr("y", 330)
   			.attr('width', 30)
   			.attr("xlink:href","images/tall.png");
	},
	drawWeightImages: function() {
		var self = this;

		Database.svg.append("text")
			.attr("x", 580)
			.attr("y", 320)
			.style("font-size", 25)
			.style("font-weight", "bold")
			.text("Weight:");
		Database.svg.append("line")
			.attr("x1", 700)
			.attr("x2", 1000)
			.attr("y1", 315)
			.attr("y2", 315)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 700)
			.attr("x2", 700)
			.attr("y1", 310)
			.attr("y2", 320)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 850)
			.attr("x2", 850)
			.attr("y1", 310)
			.attr("y2", 320)
			.style("stroke", "black");
		Database.svg.append("line")
			.attr("x1", 1000)
			.attr("x2", 1000)
			.attr("y1", 310)
			.attr("y2", 320)
			.style("stroke", "black");
		Database.svg.append("text")
			.attr("x", 700)
			.attr("y", 303)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("Skinny");
		Database.svg.append("text")
			.attr("x", 850)
			.attr("y", 303)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("Medium Build");
		Database.svg.append("text")
			.attr("x", 1000)
			.attr("y", 303)
			.style("font-size", 20)
			.style("text-anchor", "middle")
			.text("Obese");

		Database.svg.append("svg:image")
   			.attr("x", 700 - 15)
			.attr("y", 330)
   			.attr('width', 21)
   			.attr("xlink:href","images/thin.png");
   		Database.svg.append("svg:image")
   			.attr("x", 850 - 15)
			.attr("y", 330)
   			.attr('width', 30)
   			.attr("xlink:href","images/medium.png");
   		Database.svg.append("svg:image")
   			.attr("x", 1000 - 15)
			.attr("y", 330)
   			.attr('width', 42)
   			.attr("xlink:href","images/obese.png");
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
		PageThree.init();
	}
}