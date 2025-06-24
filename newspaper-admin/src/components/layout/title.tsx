'use client';
import React from 'react';
import { useRouterContext, useRouterType, useLink } from '@refinedev/core';
import {theme, Space, Typography} from 'antd';
import type { RefineLayoutThemedTitleProps } from '@refinedev/antd';
import Logo from './Logo';
import SmallLogo from './SmallLogo';

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
          // <Typography.Title
          //   style={{
          //     fontSize: 'inherit',
          //     marginBottom: 0,
          //     fontWeight: 700,
          //   }}
          // >
          // тут быд текст
          // </Typography.Title>
          <div
            style={{
              maxWidth: '160px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: token.colorPrimary,
              width: '100%'
            }}
          >
            <Logo width={50} height={50} />
            <Typography.Title level={4}>News<span style={{color: '#44a363'}}>paper</span></Typography.Title>
          </div>
        )}

        {collapsed && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
              color: token.colorPrimary,
            }}
          >
            <SmallLogo />
          </div>
        )}
      </div>
    </ActiveLink>
  );
};
