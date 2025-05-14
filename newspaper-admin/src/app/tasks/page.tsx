'use client';

import React from 'react';
import { Kanban } from '@/components/kanban';
import { useGetIdentity } from '@refinedev/core';
import { ThemedLayoutV2 } from '@refinedev/antd';

const TasksPage: React.FC = () => {
    const { data: user } = useGetIdentity<{ role: string }>();
    const canCreateTask = user?.role === 'Authenticated' || user?.role === 'Photographer';

    return (
        <ThemedLayoutV2>
            <Kanban createButtonProps={{ hidden: !canCreateTask }} />
        </ThemedLayoutV2>
    );
};

export default TasksPage; 