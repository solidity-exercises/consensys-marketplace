const util = {
	constants: {
		seconds: function (val) { return val; },
		minutes: function (val) { return val * this.seconds(60); },
		hours: function (val) { return val * this.minutes(60); },
		days: function (val) { return val * this.hours(24); },
		weeks: function (val) { return val * this.days(7); },
		years: function (val) { return val * this.days(365); },
	},

	assertRevert: async (promise) => {
		try {
			await promise;
			assert.fail('Expected revert not received');
		} catch (error) {
			const revertFound = error.message.search('revert') >= 0;
			assert(revertFound, `Expected "revert", got ${error} instead`);
		}
	},

	assertThrow: async (promise) => {
		try {
			await promise;
		} catch (error) {
			const invalidJump = error.message.search('invalid JUMP') >= 0;
			const invalidOpcode = error.message.search('invalid opcode') >= 0;
			const outOfGas = error.message.search('out of gas') >= 0;
			assert(invalidJump || invalidOpcode || outOfGas, `Expected throw, got ${error} instead`);
			return;
		}
		assert.fail('Expected throw not received');
	},

	watchEvent: (event) => {
		return new Promise((resolve, reject) => {
			event.watch((err, res) => {
				if (err) {
					reject(err);
				}
				resolve(res);
			});
		});
	},

	inLogs: async (logs, eventName, eventArgs = {}) => {
		const event = logs.find(e => e.event === eventName);
		assert.exists(event);
		for (const [k, v] of Object.entries(eventArgs)) {
			assert.exists(event.args[k]);
			assert.deepEqual(event.args[k], v);
		}
		return event;
	},

	increaseTime: (seconds) => {
		const id = Date.now();

		return new Promise((resolve, reject) => {
			web3.currentProvider.sendAsync({
				jsonrpc: '2.0',
				method: 'evm_increaseTime',
				params: [seconds],
				id: id,
			}, err1 => {
				if (err1) return reject(err1);

				web3.currentProvider.sendAsync({
					jsonrpc: '2.0',
					method: 'evm_mine',
					id: id + 1,
				}, (err2, res) => {
					return err2 ? reject(err2) : resolve(res);
				});
			});
		});
	},

	assertJump: async promise => {
		try {
			await promise;
			assert.fail('Expected invalid opcode not received');
		} catch (error) {
			const invalidOpcodeReceived = error.message.search('invalid opcode') >= 0;
			assert(invalidOpcodeReceived, `Expected "invalid opcode", got ${error} instead`);
		}
	},
};

module.exports = util;
