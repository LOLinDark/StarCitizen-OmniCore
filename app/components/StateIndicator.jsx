import { Badge, Tooltip } from '@mantine/core';

export const StateIndicator = ({ changed, pendingApply }) => {
  if (pendingApply) {
    return (
      <Tooltip label="Changed but not yet applied. Will apply when game exits.">
        <Badge color="yellow" variant="filled" size="sm">
          ⧗ Pending
        </Badge>
      </Tooltip>
    );
  }
  if (changed) {
    return (
      <Tooltip label="Modified from game default">
        <Badge color="orange" variant="filled" size="sm">
          ◆ Changed
        </Badge>
      </Tooltip>
    );
  }
  return (
    <Tooltip label="Matches game default">
      <Badge color="green" variant="filled" size="sm">
        ✓ Applied
      </Badge>
    </Tooltip>
  );
};
