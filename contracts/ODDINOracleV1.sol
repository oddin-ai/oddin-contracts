// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract ODDINOracleV1 {
    mapping(address => uint256) public values;
    address oracleUpdater;

    event OracleUpdate(address key, bool value, uint128 timestamp);
    event UpdaterAddressChange(address newUpdater);

    constructor() {
        oracleUpdater = msg.sender;
    }

    function setValue(
        address key,
        bool value,
        uint128 timestamp
    ) public {
        require(msg.sender == oracleUpdater);
        uint256 unitValue = value ? uint256(1) : uint256(0);
        uint256 cValue = (((uint256)(unitValue)) << 128) + timestamp;
        values[key] = cValue;
        emit OracleUpdate(key, value, timestamp);
    }

    function isNotValid(address key) external view returns (bool, uint128) {
        uint256 cValue = values[key];
        uint128 timestamp = (uint128)(cValue % 2**128);
        uint128 value = (uint128)(cValue >> 128);
        bool boolValue = value > 0 ? true : false;
        return (boolValue, timestamp);
    }

    function updateOracleUpdaterAddress(address newOracleUpdaterAddress)
        public
    {
        require(msg.sender == oracleUpdater);
        oracleUpdater = newOracleUpdaterAddress;
        emit UpdaterAddressChange(newOracleUpdaterAddress);
    }
}
