/* eslint-disable */
module.exports = {
	networks: {
		development: {
			host: 'localhost',
			port: 8545,
			network_id: '42', // Match any network id
			gas: 8000000, // <-- Use this high gas value
		},
		coverage: {
			host: 'localhost',
			network_id: '*',
			port: 8555, // <-- If you change this, also set the port option in .solcover.js.
			gas: 0xfffffffffff, // <-- Use this high gas value
			gasPrice: 0x01, // <-- Use this low gas price
		},
		solc: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
};
