const Demo = artifacts.require("Demo");

/** @dev This test is for the Library test.
  * I made the library about toUppercase in many languages.
  * Set aBcDe for the test and it should return the ABCDE.
  */
contract("Demo", function(accounts) {
    it("Library Test", async () => {
        const demo = await Demo.deployed();
        
        await demo.setData("aBcDe");
        var result = await demo.toUpper();

        assert.equal(result, "ABCDE", "To Uppercase is not working");
    });
});