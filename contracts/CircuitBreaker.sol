pragma solidity ^0.4.24;

import "./Mortal.sol";

/** @title Circuit Breaker. */
/** This Contract is provided in Course */
contract CircuitBreaker is Mortal {
    /** @dev Control functions in Emergency using stopped variable. */
    bool public stopped = false;

    /** @dev Functions can run by stopped variable */
    modifier stopInEmergency { require(!stopped); _; }
    modifier onlyInEmergency { require(stopped); _; }
}