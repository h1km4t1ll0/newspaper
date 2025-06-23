"use client";

import { Kanban } from "@/components/kanban";
import { ThemedLayoutV2 } from "@refinedev/antd";
import { usePermissions } from "@refinedev/core";
import React from "react";

const TasksPage: React.FC = () => {
  const { data: permissions } = usePermissions<string>();
  const canCreateTask =
    permissions === "Authenticated" ||
    permissions === "Photographer" ||
    permissions === "Layout";

  return (
    <ThemedLayoutV2>
      <Kanban createButtonProps={{ hidden: false }} />
    </ThemedLayoutV2>
  );
};

export default TasksPage;
