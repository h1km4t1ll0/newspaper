'use client';

import { ThemedTitleV2 } from '@components/layout/title';
import { ThemedLayoutV2 } from '@refinedev/antd';
import React, {createContext} from 'react';

export const ThemedLayout = ({ children }: React.PropsWithChildren) => {
  return (
      <ThemedLayoutV2 Title={ThemedTitleV2}>
        {children}
      </ThemedLayoutV2>
  );
};
