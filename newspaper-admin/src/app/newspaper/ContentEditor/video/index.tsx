import { Input, message, Upload } from 'antd';
import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import styles from './video.module.scss';
import VideoJsPlayer from './VideoJsPlayer';
import svgVideoIcon from './svgVideoIcon.svg';
export const getMaxUploadSize = () => 1073741824;

import additionalRequestHeaders from '../additionalRequestHeaders';
import {getApiBase} from "@app/newspaper/ContentEditor";
export const humanFileSize = (size: number) => {
  const i = Math.floor(Math.log(size) / Math.log(1024));

  return `${(size / 1024 ** i).toFixed(2)} ${['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'][i]}`;
};
interface VideoData {
  link: string | null,
  title: string,
}

const playbackRates = [0.75, 1, 1.25, 1.5, 1.75, 2];

interface IProps {
  data: VideoData,
  onDataChange: (data: VideoData) => void,
  readOnly: boolean,
}

export const VideoPlayer = memo(
  ({
    data: { title, link },
    onDataChange,
    readOnly,
  }: IProps) => {
    const videoJsRef = useRef<any | null>(null);
    const [showVideo, setShowVideo] = useState(false);
    const dropzoneContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      setTimeout(() => {
        setShowVideo(true);
        // @ts-ignore
        dropzoneContainerRef.current?.querySelector('input')?.click();
      }, 100);
    }, []);

    return (link || readOnly) ? (
      <div className={styles.videoBlock}>
        <div className={styles.videoContainer}>
          {showVideo && (
          <VideoJsPlayer
            controls
            src={link || ''}
            playbackRates={playbackRates}
            onReady={(player: any) => {
              player.fluid(true);
              videoJsRef.current = player;
            }}
            headers={additionalRequestHeaders}
            // onPlay={this.onVideoPlay.bind(this)}
            // onPause={this.onVideoPause.bind(this)}
            // onTimeUpdate={this.onVideoTimeUpdate.bind(this)}
            // onSeeking={this.onVideoSeeking.bind(this)}
            // onSeeked={this.onVideoSeeked.bind(this)}
            // onEnd={this.onVideoEnd.bind(this)}
          />
          )}
        </div>

        {readOnly ? (
          <div className={styles.videoCaption}>
            {title}
          </div>
        ) : (
          <Input
            className={styles.videoCaption}
            placeholder="Надпись"
            value={title}
            onChange={(e) => onDataChange({ title: e.target.value, link })}
            onPressEnter={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    ) : (
      <div ref={dropzoneContainerRef}>
        <Upload.Dragger
          className={styles.dropzone}
          name="file"
          accept="video/*"
          multiple={false}
          maxCount={1}
          action={`${getApiBase()}/api/editorjs/uploadVideo`}
          headers={additionalRequestHeaders}
          beforeUpload={(file) => {
            const maxUploadSize = getMaxUploadSize();
            if (file.size > maxUploadSize) {
              message.error(`Размер файла для загрузки не должен превышать ${humanFileSize(maxUploadSize)}`);
              throw new Error('Превышен размер файла для загрузки.');
            }
          }}
          onChange={(info) => {
            const { status } = info.file;
            if (status === 'done') {
              const { success, file: { url } } = info.file.response;
              if (success !== 1 || !url) {
                message.error(`${info.file.name} - ошибка загрузки.`);
                return;
              }
              onDataChange({ title, link: url });
              message.success(`${info.file.name} - загружен.`);
            } else if (status === 'error') {
              message.error(`${info.file.name} - ошибка загрузки.`);
            }
          }}
          onDrop={(e) => {
            // eslint-disable-next-line no-console
            console.log('Dropped files', e.dataTransfer.files);
          }}
        >
          <div className="ant-upload-text">
            <img src={svgVideoIcon} alt="video icon" />
            Выберите видео
          </div>
        </Upload.Dragger>
      </div>
    );
  },
  (prevProps, nextProps) => JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data),
);

export default class Video {
  static get toolbox() {
    return {
      icon: `<img src="${svgVideoIcon}">`,
      title: 'Video',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  api: any;

  readOnly: boolean = false;

  data: VideoData = {
    title: 'Заголовок',
    link: null,
  };

  rootClassname: string = 'collapse-tool';

  holderNode: Element | undefined;

  onUpdate: () => void;

  constructor({
    data, api, readOnly, config,
  }: any) {
    this.onUpdate = config.onUpdate;
    this.api = api;
    this.readOnly = readOnly;
    this.data = data;
  }

  render() {
    const rootNode = document.createElement('div');
    rootNode.setAttribute('class', this.rootClassname);
    this.holderNode = rootNode;

    this.renderReact();

    return this.holderNode;
  }

  renderReact() {
    if (!this.holderNode) {
      return;
    }

    ReactDOM.render(
      <VideoPlayer
        onDataChange={(newData) => {
          this.data = newData;
          this.renderReact();
          this.onUpdate();
        }}
        readOnly={this.readOnly}
        data={this.data}
      />,
      this.holderNode,
    );
  }

  save() {
    return this.data;
  }

  validate(savedData: VideoData) {
    return savedData.link || savedData.title;
  }
}
