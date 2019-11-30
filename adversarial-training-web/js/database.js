const Database = {
	stochastic: {},
	transferFromClean: {},
	transferFromAdversarial: {},

	load: function(data) {
		const self = this;

		self.stochastic.vgg = data[0];
		self.stochastic._20 = data[1];
		self.stochastic._40 = data[2];
		self.stochastic._60 = data[3];
		self.stochastic._80 = data[4];
		self.stochastic._100 = data[5];

		self.transferFromClean.vgg = data[6];
		self.transferFromClean._20 = data[7];
		self.transferFromClean._40 = data[8];
		self.transferFromClean._60 = data[9];
		self.transferFromClean._80 = data[10];
		self.transferFromClean._100 = data[11];

		self.transferFromAdversarial.attacked = data[12];
		self.transferFromAdversarial._20 = data[13];
		self.transferFromAdversarial._40 = data[14];
		self.transferFromAdversarial._60 = data[15];
		self.transferFromAdversarial._80 = data[16];
		self.transferFromAdversarial._100 = data[17];
	},
	preprocess: function() {
		const self = this;

		for (let experiment in self.stochastic)
			for (let i = 0; i < self.stochastic[experiment].length; i++) {
				self.stochastic[experiment][i].train_err = +self.stochastic[experiment][i].train_err;
				self.stochastic[experiment][i].test_err = +self.stochastic[experiment][i].test_err;
				self.stochastic[experiment][i].adv_err = +self.stochastic[experiment][i].adv_err;
			}

		for (let experiment in self.transferFromClean)
			for (let i = 0; i < self.transferFromClean[experiment].length; i++) {
				self.transferFromClean[experiment][i].train_err = +self.transferFromClean[experiment][i].train_err;
				self.transferFromClean[experiment][i].test_err = +self.transferFromClean[experiment][i].test_err;
				self.transferFromClean[experiment][i].adv_err = +self.transferFromClean[experiment][i].adv_err;
			}

		for (let experiment in self.transferFromAdversarial)
			for (let i = 0; i < self.transferFromAdversarial[experiment].length; i++) {
				self.transferFromAdversarial[experiment][i].train_err = +self.transferFromAdversarial[experiment][i].train_err;
				self.transferFromAdversarial[experiment][i].test_err = +self.transferFromAdversarial[experiment][i].test_err;
				self.transferFromAdversarial[experiment][i].adv_err = +self.transferFromAdversarial[experiment][i].adv_err;
			}
	}
}