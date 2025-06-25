'use client';

import { ThemedTitleV2 } from '@components/layout/title';
import { ThemedLayoutV2} from '@refinedev/antd';
import React, {} from 'react';
import { Header } from '@components/header';

export const ThemedLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemedLayoutV2 Header={() => <Header sticky />} Title={ThemedTitleV2}>
      {children}
    </ThemedLayoutV2>
  );
};
