async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const MetaTransactionCollector = await ethers.getContractFactory("MetaTransactionCollector");
    const adminAddress = process.env.ADMIN_ADDRESS;
    const metaTransactionCollector = await MetaTransactionCollector.deploy(adminAddress);
  
    console.log("MetaTransactionCollector deployed to:", metaTransactionCollector.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  