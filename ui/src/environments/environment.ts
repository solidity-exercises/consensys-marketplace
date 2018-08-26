// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import * as contractArtifacts from '../../build/contracts/DDNSCore.json';

export const environment = {
	production: false,
	provider: 'http://localhost:9545',
	ABI: contractArtifacts['abi'],
	address: contractArtifacts['networks']['42'].address
};
