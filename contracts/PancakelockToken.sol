// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PancakelockToken is ERC20("Pancakelock Token", "PLT") {
    constructor() {
        _mint(address(msg.sender), 1e23);
    }
}
