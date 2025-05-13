// src/app/RefineApp.tsx
"use client";
import '../components/Gridstack/grid-stack.css'
import React, {createContext, Suspense, useCallback, useEffect, useMemo, useState} from "react";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { DevtoolsProvider } from "@providers/devtools";
import { useNotificationProvider } from "@refinedev/antd";
import routerProvider from "@refinedev/nextjs-router";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProvider } from "@providers/auth-provider/auth-provider";
import { dataProvider } from "@providers/data-provider";
import "@refinedev/antd/dist/reset.css";

const allResources = [
  {
    name: 'layouts',
    list: '/layouts',
    create: '/layouts/create',
    edit: '/layouts/edit/:id',
    show: '/layouts/show/:id',
    meta: {
      label: 'Layouts',
    },
  },
  {
    name: 'advertisement-templates',
    list: '/advertisement-templates',
    create: '/advertisement-templates/create',
    edit: '/advertisement-templates/edit/:id',
    show: '/advertisement-templates/show/:id',
    meta: {
      label: 'Advertisement template',
    },
  },
  {
    name: 'advertisments',
    list: '/advertisments',
    create: '/advertisments/create',
    edit: '/advertisments/edit/:id',
    show: '/advertisments/show/:id',
    meta: {
      label: 'Advertisements',
    },
  },
  {
    name: 'articles',
    list: '/articles',
    create: '/articles/create',
    edit: '/articles/edit/:id',
    show: '/articles/show/:id',
    meta: {
      label: 'Articles',
    },
  },
  {
    name: 'photos',
    list: '/photos',
    create: '/photos/create',
    edit: '/photos/edit/:id',
    show: '/photos/show/:id',
    meta: {
      label: 'Photos',
    },
  },
  {
    name: 'newspapers',
    list: '/newspapers',
    create: '/newspapers/create',
    edit: '/newspapers/edit/:id',
    show: '/issues',
    meta: {
      label: 'Newspapers',
    },
  },
  {
    name: 'issues',
    list: '/issues',
    create: '/issues/create',
    edit: '/issues/edit/:id',
    show: '/issues/show/:id',
    meta: {
      label: 'Issues',
    },
  },
]

export const RoleContext = createContext<string | null | undefined>(null);

export default function RefineApp({
                                    children,
                                    defaultMode,
                                  }: {
  children: React.ReactNode;
  defaultMode: "light" | "dark";
}) {
  const [role, setRole] = useState<string | null | undefined>();

  const getPermissions = useCallback(async () => {
    const perm = await authProvider.getPermissions?.() as string | null;
    setRole(perm)
  }, []);

  const resources = useMemo(() => {
    if (role === "Writer") {
      return allResources.filter((r) =>
        ["articles", "photos", "issues"].includes(r.name),
      )
    }

    if (role === "Photographer") {
      return allResources.filter((r) =>
        ["articles", "photos", "issues"].includes(r.name),
      )
    }

    if (role === "Authenticated") {
      return allResources;
    }

    return [];
  }, [role]);

  useEffect(() => {
    getPermissions()
  }, [getPermissions]);

  return (
    <RefineKbarProvider>
      <AntdRegistry>
        <ColorModeContextProvider defaultMode={defaultMode}>
          <DevtoolsProvider>
            <Refine
              routerProvider={routerProvider}
              authProvider={authProvider}
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: "5dXQNc-LgkBeL-IkhHJz",
              }}
            >
              <Suspense fallback={<div>Loading content…</div>}>
                <RoleContext.Provider value={role}>
                  {children}
                </RoleContext.Provider>
              </Suspense>
              <RefineKbar />
            </Refine>
          </DevtoolsProvider>
        </ColorModeContextProvider>
      </AntdRegistry>
    </RefineKbarProvider>
  );
}
