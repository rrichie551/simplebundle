import React, { useState, useCallback } from 'react';
import { Button, Tooltip, Popover, ActionList } from "@shopify/polaris";
import { StatusIcon, StatusActiveIcon, OrderDraftFilledIcon, ArchiveIcon } from "@shopify/polaris-icons";

export function StatusChangeButton({ status, onStatusChange }) {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleStatusChange = useCallback(
    (newStatus) => {
      onStatusChange(newStatus);
      setPopoverActive(false);
    },
    [onStatusChange],
  );

  const activator = (
    <Tooltip content="Change status" dismissOnMouseOut>
      <Button
        size="slim"
        icon={StatusIcon}
        onClick={togglePopoverActive}
        disclosure
      />
    </Tooltip>
  );

  const statuses = [
    {content: 'Active', icon: StatusActiveIcon, disabled: status === 'ACTIVE'},
    {content: 'Draft', icon: OrderDraftFilledIcon, disabled: status === 'DRAFT'},
    {content: 'Archived', icon: ArchiveIcon, disabled: status === 'ARCHIVED'}
  ];

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      sectioned
    >
      <ActionList
        items={statuses.map(item => ({
          ...item,
          onAction: () => handleStatusChange(item.content.toUpperCase())
        }))}
      />
    </Popover>
  );
}