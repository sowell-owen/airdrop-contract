// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public userClaimed;

    event Claim(address indexed claimer, uint256 amount);

    constructor(IERC20 _token, bytes32 _merkleRoot) {
        token = _token;
        merkleRoot = _merkleRoot;
    }

    function isCanClaim(
        uint256 _amount,
        bytes32[] calldata _merkleProof,
        address _claimer
    ) public view returns (bool) {
        return
            !userClaimed[_claimer] &&
            MerkleProof.verify(
                _merkleProof,
                merkleRoot,
                keccak256(abi.encodePacked(_claimer, _amount))
            );
    }

    function claimTokens(uint256 _amount, bytes32[] calldata _merkleProof)
        external
    {
        require(
            isCanClaim(_amount, _merkleProof, msg.sender),
            "Airdrop: Can't claim tokens"
        );

        userClaimed[msg.sender] = true;
        token.transfer(msg.sender, _amount);

        emit Claim(msg.sender, _amount);
    }
}
