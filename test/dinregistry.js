var DINRegistry = artifacts.require("./DINRegistry.sol");

contract('DINRegistry', function(accounts) {

  // Initialization
  it("should have an index equal to the genesis number of 10000000 + 1", function() {
    return DINRegistry.deployed().then(function(registry) {
      return registry.index();
    }).then(function(index) {
      assert.equal(index, 10000001, "The genesis number was not 10000000");
    });
  });

  // Registration
  it("should register a new DIN correctly", function() {
    var registry;
    var newIndex;

    return DINRegistry.deployed().then(function(instance) {
      registry = instance;
      return registry.registerNewDIN();
    }).then(function() {
      return registry.index();
    }).then(function(index) {
      newIndex = index;
      return registry.owner(newIndex);
    }).then(function(owner) {
      assert.equal(newIndex, 10000002, "The new index was not 10000002");
      assert.equal(owner, accounts[0], "The owner was not set correctly");
    });
  });

});