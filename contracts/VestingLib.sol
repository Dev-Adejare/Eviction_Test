// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

library VestingLib {
    struct VestingSchedule {
        uint256 start;
        uint256 duration;
        uint256 totalAmount;
        uint256 releasedAmount;
    }

    function releasableAmount(VestingSchedule storage schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.start) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - schedule.start;
        uint256 vestedAmount;

        if (timeElapsed >= schedule.duration) {
            // All tokens are vested
            vestedAmount = schedule.totalAmount;
        } else {
            // Calculate vested amount based on elapsed time
            vestedAmount = (schedule.totalAmount * timeElapsed) / schedule.duration;
        }

        // Return the amount that has not yet been released
        return vestedAmount - schedule.releasedAmount;
    }

    function release(VestingSchedule storage schedule, uint256 amount) internal {
        schedule.releasedAmount += amount;
    }
}
