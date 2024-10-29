async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const MetaTransactionCollector = await ethers.getContractFactory("MetaTransactionCollector");
    const metaTransactionCollector = await MetaTransactionCollector.deploy("0x24a460B3862D65A743fC86Ed926ad4E40ED2BCBE"); // Укажите адрес администратора
  
    console.log("MetaTransactionCollector deployed to:", metaTransactionCollector.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  