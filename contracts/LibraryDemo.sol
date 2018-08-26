pragma solidity ^0.4.24;

/** @title LibraryDemo. */
library LibraryDemo {
    /** @dev change lowercase to uppercase.
      * @param str String that mixed with lowercase and uppercase.
      * @return Uppercase string.
      */
    function toUppercase(string storage str) public pure returns (string memory) {
        bytes memory temp = bytes(str);
        require(temp.length != 0);
        for(uint i=0; i<temp.length; i++) {
            if(temp[i] >= 97 && temp[i] <= 122) {
                temp[i] = bytes1(int(temp[i]) - 32);
            }
        }
        return string(temp);
    }
}

/** @title Demo. */
contract Demo {
    using LibraryDemo for string;
    string data;

    /** @dev Set data state variable
      * @param _data To set state variable
      */
    function setData(string _data) public {
        data = _data;
    }
    /** @dev Return uppercase changed data variable
      * @return Uppercase changed data
      */
    function toUpper() public view returns (string memory) {
        string memory temp;
        temp = data.toUppercase();
        return temp;
    }
}