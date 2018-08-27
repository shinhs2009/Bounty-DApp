var BountyHub = artifacts.require("BountyHub");
var LibraryDemo = artifacts.require("LibraryDemo")
var Demo = artifacts.require("Demo")

module.exports = function(deployer) {
    deployer.deploy(LibraryDemo);
    deployer.link(LibraryDemo, Demo);
    deployer.deploy(Demo);
    deployer.deploy(BountyHub);
}
