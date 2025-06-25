"use client";

import { Kanban } from "@/components/kanban";
import { ThemedLayout } from "@components/themed-layout";
import { usePermissions } from "@refinedev/core";
import React from "react";

const TasksPage: React.FC = () => {
  const { data: permissions } = usePermissions<string>();
  const canCreateTask =
    permissions === "Authenticated" ||
    permissions === "Photographer" ||
    permissions === "Writer" ||
    permissions === "Layout";

  return (
    <ThemedLayout>
      <Kanban createButtonProps={{ hidden: false }} />
    </ThemedLayout>
  );
};

export default TasksPage;
