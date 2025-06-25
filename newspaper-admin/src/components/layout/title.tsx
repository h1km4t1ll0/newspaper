'use client';
import React from 'react';
import { useRouterContext, useRouterType, useLink } from '@refinedev/core';
import {theme, Space, Typography} from 'antd';
import type { RefineLayoutThemedTitleProps } from '@refinedev/antd';

type Props = RefineLayoutThemedTitleProps & {
  width?: number;
  height?: number;
};

export const ThemedTitleV2: React.FC<Props> = ({
  collapsed,
  wrapperStyles,
  width,
  height,
}) => {
  const { token } = theme.useToken();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === 'legacy' ? LegacyLink : Link;

  return (
    <ActiveLink
      to='/'
      style={{
        display: 'inline-block',
        textDecoration: 'none',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 'inherit',
          justifyContent: 'center',
          width: '100%',
          ...wrapperStyles,
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: token.colorPrimary,
              width: '100%'
            }}
          >
            <Typography.Title level={4}>News<span style={{color: '#44a363'}}>paper</span></Typography.Title>
          </div>
        )}

        {collapsed && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              color: token.colorPrimary,
            }}
          >
            <Typography.Title level={5}>N</Typography.Title>
          </div>
        )}
      </div>
    </ActiveLink>
  );
};
