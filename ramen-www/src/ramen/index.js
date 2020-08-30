import Web3 from 'web3';
import BigNumber from 'bignumber.js';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export { Ramen } from './Ramen.js';
export {
  Web3,
  BigNumber,
};
