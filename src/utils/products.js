import MarketJSON from "../../build/contracts/Market.json";
var coder = require("web3/lib/solidity/coder");
const Promise = require("bluebird");
const CryptoJS = require("crypto-js");

const encodeFunctionTxData = (functionName, types, args) => {
  var fullName = functionName + "(" + types.join() + ")";
  var signature = CryptoJS.SHA3(fullName, { outputLength: 256 })
    .toString(CryptoJS.enc.Hex)
    .slice(0, 8);
  var dataHex = "0x" + signature + coder.encodeParams(types, args);
  return dataHex;
};

// TODO: Market name and product name will ideally come from the Buyer contract in the future.
// Not possible now due to Solidity limitations:
// http://solidity.readthedocs.io/en/develop/frequently-asked-questions.html#can-you-return-an-array-or-a-string-from-a-solidity-function-call
export const getMarketName = (web3, marketAddr) => {
  return new Promise(async (resolve, reject) => {
    const marketContract = web3.eth.contract(MarketJSON.abi).at(marketAddr);
    try {
      const name = await marketContract.name(marketAddr);
      resolve(name);
    } catch (err) {
      reject(err);
    }
  });
};

export const getProductName = (web3, DIN, marketAddr) => {
  return new Promise(async (resolve, reject) => {
    const marketContract = web3.eth.contract(MarketJSON.abi).at(marketAddr);
    const callAsync = Promise.promisify(web3.eth.call);

    // Some nonsense to work around Solidity errors
    const nameOfData = encodeFunctionTxData("nameOf", ["uint256"], [DIN])
    const result = await callAsync({
      to: marketAddr,
      data: nameOfData
    })

    if (result === "0x") {
      resolve("")
    } else {
      // Sometimes web3 to Ascii on the result is slightly wrong, so make request directly
      const nameOfAsync = Promise.promisify(marketContract.nameOf);
      const name = await nameOfAsync(DIN);
      resolve(name);
    }
  });
};

export const getValue = (web3, BuyerContract, DIN, quantity, buyerAcct) => {
  return new Promise(async (resolve, reject) => {
    const totalPriceAsync = Promise.promisify(BuyerContract.totalPrice);
    try {
      const priceInKMTWei = await totalPriceAsync(DIN, quantity, buyerAcct);
      const formattedPrice = web3
        .fromWei(priceInKMTWei, "ether")
        .toNumber()
        .toFixed(3);
      resolve(formattedPrice);
    } catch (err) {
      reject(err);
    }
  });
};

export const getIsAvailable = (
  web3,
  BuyerContract,
  DIN,
  quantity,
  buyerAcct
) => {
  return new Promise(async (resolve, reject) => {
    const availableAsync = Promise.promisify(BuyerContract.availableForSale);
    try {
      const available = await availableAsync(DIN, quantity, buyerAcct);
      resolve(available);
    } catch (err) {
      reject(err);
    }
  });
};

export const getProducts = async (
  event,
  web3,
  DINRegistry,
  BuyerContract,
  buyerAcct
) => {
  const asyncEvent = Promise.promisifyAll(event);
  const logs = await asyncEvent.getAsync();
  const DINs = logs.map(log => {
    return parseInt(log["args"]["DIN"]["c"][0], 10);
  });

  const registry = Promise.promisifyAll(DINRegistry);

  let products = [];
  for (let DIN of DINs) {
    const owner = await registry.ownerAsync(DIN);
    const market = await registry.marketAsync(DIN);

    const product = {
      DIN: DIN,
      seller: owner,
      market: market
    };

    try {
      const name = await getProductName(web3, DIN, market);
      const value = await getValue(web3, BuyerContract, DIN, 1, buyerAcct);
      const available = await getIsAvailable(
        web3,
        BuyerContract,
        DIN,
        buyerAcct,
        1
      );
      const newProduct = {
        ...product,
        name,
        value,
        available
      };
      products.push(newProduct);
    } catch (err) {
      products.push(product);
    }
  }

  // Only show products where the market is set and with a name
  const filteredProducts = products.filter(
    product =>
      product.market !== "0x0000000000000000000000000000000000000000" &&
      product.name
  );

  return filteredProducts;
};

// TODO: This should confirm that the market has not changed
export const getMarketProducts = async (
  web3,
  DINRegistry,
  marketAddr,
  buyer
) => {
  var event = DINRegistry.NewMarket(
    { market: marketAddr },
    { fromBlock: 0, toBlock: "latest" }
  );
  return getProducts(event, web3, DINRegistry);
};

// TODO: This should confirm that the owner has not changed
export const getOwnerProducts = async (
  web3,
  DINRegistry,
  BuyerContract,
  owner,
  buyerAcct
) => {
  var event = DINRegistry.NewRegistration(
    { owner: owner },
    { fromBlock: 0, toBlock: "latest" }
  );
  return getProducts(event, web3, DINRegistry, BuyerContract, buyerAcct);
};

export const getAllProducts = async (
  web3,
  DINRegistry,
  BuyerContract,
  buyerAcct
) => {
  var event = DINRegistry.NewRegistration(
    {},
    { fromBlock: 0, toBlock: "latest" }
  );
  return getProducts(event, web3, DINRegistry, BuyerContract, buyerAcct);
};