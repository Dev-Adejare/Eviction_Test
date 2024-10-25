import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ERC20TokenModule = buildModule("ERC20Module", (m) => {
  const ERC20 = m.contract("ERC20");

  return { ERC20 };
});

export default ERC20TokenModule;