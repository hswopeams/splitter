const Splitter = artifacts.require("Splitter");

/*
module.exports = function(deployer) {
    deployer.deploy(Splitter);
};
*/

module.exports = function(deployer, network, accounts) {
    //deployer.deploy(Splitter, accounts[1]);
    deployer.deploy(Splitter);
}