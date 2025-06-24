'use client';

// import { RefineThemes } from '@refinedev/antd';
import CustomLightTheme from '@styles/theme/CustomLightTheme';
import CustomDarkTheme from '@styles/theme/CustomDarkTheme';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import Cookies from 'js-cookie';
import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

type ColorModeContextProviderProps = {
  defaultMode?: string;
};

export const ColorModeContextProvider: React.FC<
  PropsWithChildren<ColorModeContextProviderProps>
> = ({ children, defaultMode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState(defaultMode || 'light');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const theme = Cookies.get('theme') || 'light';
      setMode(theme);
    }
  }, [isMounted]);

  const setColorMode = () => {
    if (mode === 'light') {
      setMode('dark');
      Cookies.set('theme', 'dark');
    } else {
      setMode('light');
      Cookies.set('theme', 'light');
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  const customTheme = useMemo(() => {
    if (mode === 'dark') {
      return CustomDarkTheme;
    }

    return CustomLightTheme;
  }, [mode]);

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        // you can change the theme colors here. example: ...RefineThemes.Magenta,
        theme={{
          ...customTheme,
          algorithm: mode === 'light' ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
