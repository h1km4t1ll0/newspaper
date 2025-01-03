import { DevtoolsProvider } from "@providers/devtools";
import { useNotificationProvider } from "@refinedev/antd";
import { GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProvider } from "@providers/auth-provider";
import { dataProvider } from "@providers/data-provider";
import "@refinedev/antd/dist/reset.css";
import {observer} from "mobx-react-lite";

export const metadata: Metadata = {
  title: "Refine",
  description: "Generated by create refine app",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="en">
      <body>
        <Suspense>
          <RefineKbarProvider>
            <AntdRegistry>
              <ColorModeContextProvider defaultMode={defaultMode}>
                <DevtoolsProvider>
                  <Refine
                    routerProvider={routerProvider}
                    authProvider={authProvider}
                    dataProvider={dataProvider}
                    notificationProvider={useNotificationProvider}
                    resources={[
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
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      useNewQueryKeys: true,
                      projectId: "5dXQNc-LgkBeL-IkhHJz",
                    }}
                  >
                    {children}
                    <RefineKbar />
                  </Refine>
                </DevtoolsProvider>
              </ColorModeContextProvider>
            </AntdRegistry>
          </RefineKbarProvider>
        </Suspense>
      </body>
    </html>
  );
}
