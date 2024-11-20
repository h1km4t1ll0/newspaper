import React, { FC, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import VideoJsPlayer, { VideoJsPlayerProps } from './VideoJsPlayer';
import useStore from '../../../../domain/modelLayer/store/useStore';

const LmsVideoJsPlayer: FC<VideoJsPlayerProps> = (
  {
    onReady,
    headers,
    ...rest
  },
) => {
  const { authStore: { auth: { token } } } = useStore();

  const headersWithAuth = useMemo(() => {
    const authHeaders = {
      authorization: token ? `Bearer ${token}` : '',
    };

    if (!headers) {
      return authHeaders;
    }

    return {
      ...authHeaders,
      ...headers,
    };
  }, [token, headers]);

  const onReadyVideoJS = useCallback((player: any) => {
    player.fluid(true);
    if (onReady) {
      onReady(player);
    }
  }, [onReady]);

  return (
    <VideoJsPlayer
      headers={headersWithAuth}
      onReady={onReadyVideoJS}
      {...rest}
    />
  );
};

export default observer(LmsVideoJsPlayer);
