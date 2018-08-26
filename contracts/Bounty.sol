pragma solidity ^0.4.24;

/** @title Bounty Contract. */
contract Bounty {
    // State variables about Bounty conditions.
    address public bountyOwner;
    string public title;
    string public description;
    uint public reward;
    State public state;

    // mapping address to struct Work.
    mapping (address => Work) works;
    // Check Submitted state about each address.
    mapping (address => bool) isSubmit;
    
    // hunter and accepted hunter address array to manage submitted work.
    address[] public hunter;
    address[] public acceptedHunter;
    
    // State about Bounty
    enum State { Posted, Finished }

    /** @dev Work struct consist of comment and acceptancy. 
      * People doing their work and comment simply.
      * And Bounty Owner can decide acceptancy about it.
      */
    struct Work {
        string comment;
        bool isAccept;
    }

    // event about bounty state.
    event Posted(State _state);
    event Finished(State _state);

    // event about work submit state and accept.
    event Submitted(address _hunter, bool _isSubmit);
    event Accepted(address _hunter, bool _isAccep);

    // onlyOwner for restrict access to Bounty contract functions.
    modifier onlyOwner (address _bountyOwner) {
        require(bountyOwner == _bountyOwner);
        _;
    }

    /** @dev Change state to Finished.  */
    modifier finished {
        _;
        state = State.Finished;
    }

    /** @dev constructor.
      * @param _bountyOwner bounty Owner.
      * @param _title bounty title.
      * @param _description bounty description.
      * @param _reward reward for the work.
      * When the contract created, emit event Posted.
      */
    constructor(address _bountyOwner, string _title, string _description, uint _reward) public {
        bountyOwner = _bountyOwner;
        title = _title;
        description = _description;
        reward = _reward;
        state = State.Posted;
        emit Posted(state);
    }

    /** @dev Change the Bounty state to Finished.
      * @param _bountyOwner Only Bounty Owner can finish the Bounty.
      * @return success.
      */ 
    function finishBounty(address _bountyOwner) external onlyOwner(_bountyOwner) finished returns (bool success) {
        /* emit event */
        emit Finished(state);
        return true;
    }

    /** @dev Fetch Bounty Informations.
      * @return Bounty Informations.
      */
    function fetchBounty() external view returns (address, string, string, uint, uint) {
        return (bountyOwner, title, description, reward, ((state == State.Posted) ? 0 : 1));
    }

    /** @dev Add Works.
      * @param _hunter address who submit Work.
      * @param _comment Work summary.
      * @return success.
      */
    function addWork(address _hunter, string _comment) external returns (bool) {
        require(_hunter != bountyOwner);
        require(state == State.Posted);
        works[_hunter].comment = _comment;
        works[_hunter].isAccept = false;
        hunter.push(_hunter);

        isSubmit[_hunter] = true;
        return true;
    }

    /** @dev Return All Hunters who submit Work at Bounty.
      * @return hunter address array.
      */
    function getAllHunter() external view returns (address[]) {
        return hunter;
    }

    /** @dev Get Work Informations about hunter.
      * @param _hunter address to get Work struct.
      * @return Work Informations.
      */
    function getWork(address _hunter) external view returns (string, bool) {
        return (works[_hunter].comment, works[_hunter].isAccept);
    }

    /** @dev Bounty Owner can review Work.
      * @param _bountyOwner For modifier onlyOwner.
      * @param _hunterAddress Review this hunter's Work.
      * @return success.
      */
    function reviewWork(address _bountyOwner, address _hunterAddress) external onlyOwner(_bountyOwner) returns (bool success) {
        works[_hunterAddress].isAccept = true;
        acceptedHunter.push(_hunterAddress);
        success = true;
    }

    /** @dev Get Hunter's Participation status.
      * @param _hunter For get hunter's participation status(using isSubmit mapping).
      * @return success.
      */
    function getParticipationStatus(address _hunter) external view returns (bool) {
        // return result of submit status. if hunter already submitted work, return true.
        return isSubmit[_hunter];
    }

    /** @dev Return Accepted Hunter to pay.
      * @return Accepted Work Hunters.
      */
    function getAcceptedHunter() external view returns (address[]) {
        return acceptedHunter;
    }

}