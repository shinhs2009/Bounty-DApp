pragma solidity ^0.4.24;

import "./Ownable.sol";

/** @title Mortal */
contract Mortal is Ownable {
    /** @dev selfdestruct contract in emergency */
    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
