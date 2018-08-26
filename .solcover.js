module.exports = {
	testrpcOptions: '--allowUnlimitedContractSize -p 8555 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"',
	testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
	compileCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle compile --network coverage',
	skipFiles: ['abstractions/']
};