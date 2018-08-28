# consensys-marketplace

[![Build Status](https://travis-ci.org/solidity-exercises/consensys-marketplace.svg?branch=develop)](https://travis-ci.org/solidity-exercises/consensys-marketplace)

### Final course project for the "ConsenSys Academy" Developers Program 2018.

### Contract has been deployed on the Rinkeby network: [0xb42d3214eec65d3e6a6257a778823ad093cbd7fd](https://rinkeby.etherscan.io/address/0xb42d3214eec65d3e6a6257a778823ad093cbd7fd#code)

### Steps to run the project
#### It is to be dockerized, but till then: 
  - Global dependencies
    - **IPFS** (Please run the following commands also):
      - Download [link](https://dist.ipfs.io/#go-ipfs)
      - `ipfs init`
      - `ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001`
      - `ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'`
      - `ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'`
      - `ipfs daemon`
    - Node.js:
      - Download [link](https://nodejs.org/en/download/)
    - Angular CLI:
      - `npm install -g @angular/cli`
    - Truffle && Ganache:
      - `npm install -g truffle ganache-cli`
    - Metamask:
      - [link](https://metamask.io/)
  - Local dependencies
    - Navigate into `/consensys-marketplace/` and run `npm install`
    - Navigate into `/consensys-marketplace/ui` and run `npm install`
  - Running the project with local test network(ganache-cli)
    - Start ganache-cli with the following command:
      - `ganache-cli --allowUnlimitedContractSize -l 8000000 -i 42 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"`
      - The private key of the zero indexed account for convinience: `0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3`.
    - In the `/consensys-marketplace/` folder run `truffle deploy`
    - In the `/consensys-marketplace/ui` folder run `ng serve`
    - Head out to `http://localhost:4200/` and interact with the application.
  - Running the project with the **Rinkeby** deployed contract:
    - In the `/consensys-marketplace/ui` folder run `ng serve --prod --aot=false`
    - Head out to `http://localhost:4200/` and interact with the application.
  - Running tests and code coverage:
    - You can see the whole CI pipeline from [here](https://travis-ci.org/solidity-exercises/consensys-marketplace)
        - **Note!** There are **142** tests and code coverage is **~100%**, but solidity-coverage package fails to reproduce some of the tests.
    - Start ganache-cli with the following command:
      - `ganache-cli --allowUnlimitedContractSize -l 8000000 -i 42 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"`
    - In the `/consensys-marketplace/` folder run `truffle test`
    - To run coverage:
      - In the `/consensys-marketplace/` folder run `./node_modules/.bin/solidity-coverage`
      - For Windows user you may need to run `testrpc-sc` before that locally.
