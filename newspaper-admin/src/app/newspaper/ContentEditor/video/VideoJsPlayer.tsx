import React, { Component } from 'react';
import videojs from 'video.js';
import cn from 'classnames';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';
import axios from 'axios';
// import 'videojs-contrib-quality-levels';
// import videojsqualityselector from 'videojs-hls-quality-selector';
import isEqual from 'lodash/isEqual';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';

export interface VideoJsPlayerProps {
  src: string,
  poster?: string,
  controls?: boolean,
  autoplay?: boolean,
  preload?: 'auto' | 'none' | 'metadata',
  width?: string | number,
  height?: string | number,
  hideControls?: string[],
  bigPlayButton?: boolean,
  bigPlayButtonCentered?: boolean,
  onReady?: Function,
  onPlay?: Function,
  onPause?: Function,
  onTimeUpdate?: Function,
  onSeeking?: Function,
  onSeeked?: Function,
  onEnd?: Function,
  playbackRates?: number[],
  hidePlaybackRates?: boolean,
  className?: string,
  headers?: {
    [key: string]: string,
  },
}

class VideoJsPlayer extends Component<VideoJsPlayerProps> {
  static defaultProps = {
    src: '',
    poster: '',
    controls: true,
    autoplay: false,
    preload: 'auto',
    playbackRates: [0.75, 1, 1.25, 1.5, 1.75, 2],
    hidePlaybackRates: false,
    className: '',
    hideControls: [],
    bigPlayButton: true,
    bigPlayButtonCentered: true,
    width: 720,
    height: 400,
    onReady: () => {
    },
    onPlay: () => {
    },
    onPause: () => {
    },
    onTimeUpdate: () => {
    },
    onSeeking: () => {
    },
    onSeeked: () => {
    },
    onEnd: () => {
    },
    headers: {},
  };

  playerId = `video-player-${uuidv4()}`;

  player: videojs.Player | null = null;

  componentDidMount() {
    const { props } = this;
    this.initPlayer(props);
    this.applyHeaders();

    // init player events
    let currentTime = 0;
    let previousTime = 0;
    let position = 0;
    const { player } = this;
    if (player) {
      player.ready(() => {
        if (props.onReady) {
          props.onReady(player);
        }
      });
      player.on('play', () => {
        if (props.onPlay) {
          props.onPlay(player.currentTime());
        }
      });
      player.on('pause', () => {
        if (props.onPause) {
          props.onPause(player.currentTime());
        }
      });
      player.on('timeupdate', () => {
        if (props.onTimeUpdate) {
          props.onTimeUpdate(player.currentTime());
        }
        previousTime = currentTime;
        currentTime = player.currentTime();
        if (previousTime < currentTime) {
          position = previousTime;
          previousTime = currentTime;
        }
      });
      player.on('seeking', () => {
        player.off('timeupdate', () => {
        });
        player.one('seeked', () => {
        });
        if (props.onSeeking) {
          props.onSeeking(player.currentTime());
        }
      });
      player.on('seeked', () => {
        const completeTime = Math.floor(player.currentTime());
        if (props.onSeeked) {
          props.onSeeked(position, completeTime);
        }
      });
      player.on('ended', () => {
        if (props.onEnd) {
          props.onEnd();
        }
      });
      player.on('error', () => {
        const error = player.error();
        console.error(`ошибка при воспроизведении видеофайла на странице: ${window.location}, файл: ${player.src()}`, error);
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: VideoJsPlayerProps) {
    const { src, headers } = this.props;
    this.setControlsVisibility(this.player, nextProps.hideControls || []);
    if (src !== nextProps.src) {
      this.initPlayer(nextProps);
    }
    if (isEqual(headers, nextProps.headers)) {
      this.applyHeaders();
    }
  }

  componentWillUnmount() {
    if (this.player) this.player.dispose();
  }

  setControlsVisibility(player: videojs.Player | null, hiddenControls: string[]) {
    if (player) {
      const Controls = {
        play: 'playToggle',
        volume: 'volumePanel',
        seekbar: 'progressControl',
        timer: 'remainingTimeDisplay',
        playbackrates: 'playbackRateMenuButton',
        fullscreen: 'fullscreenToggle',
      };
      Object.keys(Controls).forEach((x) => {
        // @ts-ignore
        player.controlBar[Controls[x]].show();
      });
      hiddenControls.forEach((x) => {
        // @ts-ignore
        player.controlBar[Controls[x]].hide();
      });
    }
  }

  /**
   * Сделано в рамках LMS_ONLINE-753 Баг. Не воспроизводится видео.
   */
  private static async getVideoUrl(url: string) {
    if (!url.includes('byShortCode')) {
      return url;
    }

    try {
      const res = await axios.get(url);

      return res.data;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  applyHeaders() {
    const { headers } = this.props;
    videojs.Vhs.xhr.beforeRequest = (options) => {
      if (!options.headers) {
        options.headers = {};
      }
      Object.assign(options.headers, headers);
    };
  }

  async initPlayer(props: VideoJsPlayerProps) {
    const {
      controls,
      autoplay,
      preload,
      width = 500,
      height = 300,
      bigPlayButton,
      playbackRates,
    } = props;
    const hidePlaybackRates = props.hidePlaybackRates || (props.hideControls || []).includes('playbackrates');
    const playerOptions = {
      controls,
      autoplay,
      preload,
      width: Number(width),
      height: Number(height),
      bigPlayButton,
      playbackRates: hidePlaybackRates ? undefined : playbackRates,
    };
    const element = document.querySelector(`#${this.playerId}`);
    if (element) {
      this.player = videojs(element, playerOptions);
      this.player.src(await VideoJsPlayer.getVideoUrl(props.src));
      this.player.poster(props.poster || '');
      this.setControlsVisibility(this.player, props.hideControls || []);
      // this.player.hlsQualitySelector = videojsqualityselector;
      // this.player.hlsQualitySelector({
      //   displayCurrentQuality: true,
      // });
    }
  }

  render() {
    const { bigPlayButtonCentered, className } = this.props;
    return (
      // eslint-disable-next-line
      <video
        id={this.playerId}
        className={cn([
          'video-js',
          bigPlayButtonCentered && 'vjs-big-play-centered',
          className,
        ])}
      />
    );
  }
}

export default VideoJsPlayer;
