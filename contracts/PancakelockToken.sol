// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PancakelockToken is ERC20("Pancakelock Token", "PLT") {
    constructor() {
        _mint(msg.sender, 1e23);
    }
    
    function mint(address user, uint256 amount) public {
        _mint(user, amount);
    }
}
