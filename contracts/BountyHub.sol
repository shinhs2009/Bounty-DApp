pragma solidity ^0.4.24;

import "./CircuitBreaker.sol";
import "./Bounty.sol";

/** @title Bounty Hub. */
/** @dev inherit Circuit Breaker */
contract BountyHub is CircuitBreaker {
    // Arrays to manage Bounty.
    address[] public bountyAddress;

    // One Address can make many bounties.
    mapping(address => address[]) public bountyAddressByOwner;

    /** @dev Stop Contract in Emergency.
      * @return success.
      */
    function stopBountyHub() public onlyOwner returns (bool success) {
        stopped = true;
        success = true;
    }
    
    /**
      * @dev Restart Contract when Contract in normal.
      * @return success.
      */
    function restartBountyHub() public onlyOwner returns (bool success) {
        stopped = false;
        success = true;
    }

    /** @dev Create Bounty Contract and save address in arrays.
      * @param _title Title of Bounty.
      * @param _description Description of Bounty.
      * @param _amount Reward.
      * @return Created Bounty address.
      */
    function createBounty(string _title, string _description, uint _amount) stopInEmergency public returns (address) {
        Bounty newBounty = new Bounty(msg.sender, _title, _description, _amount);
        bountyAddressByOwner[msg.sender].push(address(newBounty));
        bountyAddress.push(address(newBounty));

        return address(newBounty);
    }

    /** @dev Get All Bounty addresses from array.
      * @return bountyAddress array.
      */
    function getAllBountyAddress() stopInEmergency external view returns (address[]) {
        return bountyAddress;
    }

    /** @dev Get Bounty addresses of Bounty Owner.
      * @param _bountyOwner Get address array from mapping bountyAddressByOwner.
      * @return bountyAddressByOwner array.
      */
    function getBountyAddressByOwner(address _bountyOwner) stopInEmergency external view returns (address[]) {
        return bountyAddressByOwner[_bountyOwner];
    }

    /** @dev Get Bounty Information(Using Bounty's fetchBounty function).
      * @param _bountyAddress To use deployed Bounty.
      * @return Bounty Informations.
      */
    function getBountyInfo(address _bountyAddress) stopInEmergency external view returns (address _owner, string _title, string _description, uint _reward, uint _status, address bounty) {
        Bounty result = Bounty(_bountyAddress);
        (_owner, _title, _description, _reward, _status) = result.fetchBounty();
        bounty = _bountyAddress;
    }

    /** @dev Submit Work to Bounty Contract(Using Bounty's addWork function).
      * @param _bountyAddress To use deployed Bounty.
      * @return success
      */
    function submitWork(address _bountyAddress, string _comment) stopInEmergency public returns (bool success) {
        Bounty bounty = Bounty(_bountyAddress);
        success = bounty.addWork(msg.sender, _comment);
    }

    /** @dev Get All Hunters(Using Bounty's getAllHunter function).
      * @param _bountyAddress To use deployed Bounty.
      * @return All Bounty Hunters.
      */
    function getHunterAddress(address _bountyAddress) stopInEmergency external view returns (address[] _hunters) {
        Bounty bounty = Bounty(_bountyAddress);
        _hunters = bounty.getAllHunter();
    }

    /** @dev Get Work Information(Using Bounty's getWork function).
      * @param _bountyAddress To use deployed Bounty.
      * @param _hunter To get submitted Work of Hunter.
      * @return Work Information.
      */
    function getWork(address _bountyAddress, address _hunter) stopInEmergency external view returns (string _comment, bool _isAccept) {
        Bounty bounty = Bounty(_bountyAddress);
        (_comment, _isAccept) = bounty.getWork(_hunter);
    }

    /** @dev Get Work participation status(Using Bounty's getParticipationStatus).
      * @param _bountyAddress To use deployed Bounty.
      * @return Submit status.
      */
    function getParticipationStatus(address _bountyAddress) stopInEmergency external view returns (bool _isSubmit) {
        Bounty bounty = Bounty(_bountyAddress);
        _isSubmit = bounty.getParticipationStatus(msg.sender);
    }

    /** @dev Finish Bounty(Using Bounty's finishBounty function).
      * @param _bountyAddress To use deployed Bounty.
      * @return success.
      */
    function finishBounty(address _bountyAddress) stopInEmergency public returns (bool success){
        Bounty bounty = Bounty(_bountyAddress);
        success = bounty.finishBounty(msg.sender);
    }

    /** @dev Review Work(Using Bounty's reviewWork function).
      * @param _bountyAddress To use deployed Bounty.
      * @param _hunterAddress To use target hunter's Work.
      * @return success.
      */
    function reviewWork(address _bountyAddress, address _hunterAddress) stopInEmergency public returns (bool success){
        Bounty bounty = Bounty(_bountyAddress);
        success = bounty.reviewWork(msg.sender, _hunterAddress);
    }

    /** @dev Get Accepted Hunter to reward(Using Bounty's getAcceptedHunter function).
      * @param _bountyAddress To use deployed Bounty.
      * @return Accepted Hunters.
      */
    function getAcceptedHunter(address _bountyAddress) external view returns (address[] _hunter) {
        Bounty bounty = Bounty(_bountyAddress);
        _hunter = bounty.getAcceptedHunter();
    }

    /** @dev Pay For the Work.
      * @param _bountyAddress To use deployed Bounty.
      * @param _acceptedHunter To Pay Hunter.
      * @return success.
      */
    function payBounty(address _bountyAddress, address _acceptedHunter) public payable returns (bool success) {
        Bounty bounty = Bounty(_bountyAddress);
        address bountyOwner = bounty.bountyOwner();
        require(bountyOwner == msg.sender);
        _acceptedHunter.transfer(msg.value);
        bounty.finishBounty(msg.sender);
        return true;
    }
}