import * as dotenv from 'dotenv';
dotenv.config();

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

let config: HardhatUserConfig;
if (process.env.NODE_ENV !== 'build') {
    const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || '';
    const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
    config = {
        defaultNetwork: 'hardhat',
        networks: {
            rinkeby: {
                url: RINKEBY_RPC_URL,
                accounts: [PRIVATE_KEY],
                chainId: 4,
            },
            localhost: {
                url: 'http://127.0.0.1:8545/',
                chainId: 31337,
            },
        },
        solidity: '0.8.8',
        etherscan: {
            apiKey: ETHERSCAN_API_KEY,
        },
    };
} else {
    config = {
        defaultNetwork: 'hardhat',
        solidity: '0.8.8',
    };
}

export default config;
