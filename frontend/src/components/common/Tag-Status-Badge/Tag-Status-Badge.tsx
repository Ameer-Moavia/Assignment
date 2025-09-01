"use client";
import React from "react";
import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";
import {
  CheckCircleIcon,
  WarningIcon,
  CloseIcon,
  TimeIcon,
} from "@chakra-ui/icons";

type Status = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const config: Record<
    Status,
    { color: string; icon: React.ElementType; label: string }
  > = {
    PENDING: { color: "orange", icon: TimeIcon, label: "Pending" },
    CONFIRMED: { color: "green", icon: CheckCircleIcon, label: "Confirmed" },
    REJECTED: { color: "red", icon: CloseIcon, label: "Rejected" },
    CANCELLED: { color: "gray", icon: WarningIcon, label: "Cancelled" },
  };

  const { color, icon, label } = config[status];

  return (
    <Tag size={size} colorScheme={color} borderRadius="full">
      <TagLeftIcon as={icon} />
      <TagLabel>{label}</TagLabel>
    </Tag>
  );
};

export default StatusBadge;
