"use client";
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import EditorJS, { OutputData } from '@editorjs/editorjs';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Table from '@editorjs/table';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import NestedList from '@editorjs/nested-list';
// // @ts-ignore
// import Warning from '@editorjs/warning';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import LinkTool from '@editorjs/link';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Header from '@editorjs/header';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import Quote from '@editorjs/quote';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Marker from '@editorjs/marker';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Warning from "@editorjs/warning";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Paragraph from "@editorjs/paragraph";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CheckList from '@editorjs/checklist';
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import EditorJsColumns from "@calumk/editorjs-columns";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import Table from '@editorjs/table'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AttachesTool from '@editorjs/attaches';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Embed from '@editorjs/embed';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Button from 'editorjs-button';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Undo from 'editorjs-undo';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import DragDrop from 'editorjs-drag-drop';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import type { EditorConfig } from '@editorjs/editorjs/types/configs';
import MathEditor from './mathEditor';
import SimpleImage from './simpleImage';
import zoomImage from './zoomImage';
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
import EditorJsColumns from './columns/editorjs-columns';
import AudioTools from './audio';
import Collapse from './collapse';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Video from './video';
import LinkTool from './link/index';


import styles from './Editor.module.scss';
import additionalRequestHeaders from './additionalRequestHeaders';
import InlineImageTool from './inlineImage';
import QuestionLinkTool from './QuestionLink';

// eslint-disable-next-line no-console
console.log(styles); // не удалять эту строку - она подключает стили
export const getApiBase = () => 'http://localhost:1338';
const useStore = () => ({authStore: {auth: {token: 'eff'}}});

interface IEditorProps {
  readOnly?: boolean,
  value?: OutputData,
  onChange?: (value: OutputData) => void,
  disableUndo?: boolean,
  onReady?: () => void
}

const ContentEditor: FC<IEditorProps> = (
  {
    readOnly = false,
    value,
    onChange = () => {
    },
    disableUndo,
    onReady = () => {},
  },
) => {
  const editorElementRef = useRef<HTMLDivElement>(null);
  const editorCore = React.useRef<EditorJS>(null);
  const undoInstance = React.useRef<Undo>();
  const { authStore: { auth } } = useStore();
  const [isEditorReady, setIsEditorReady] = useState(false);

  const save = () => {
    if (!editorCore.current) {
      console.log('43434343344343344343434')
      return;
    }

    editorCore.current
      .save()
      .then((outputData) => {
        if (onChange) {
          console.log('jnsdgurdstugtrugtjdgtsjgtujurugt')
          onChange(outputData);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log('Saving failed: ', error);
      });
  };

  const f = useRef(0);

  const init = useCallback(async () => {
    if (editorCore.current) {
      console.log('Editor is already initialized');
      return; // Prevent re-initialization
    }
    // additionalRequestHeaders.Authorization = `Bearer ${auth.token}`;

    // @ts-ignore
    const tools: EditorConfig['tools'] = {
      marker: Marker,
      inlineImage: InlineImageTool,
      header: Header,
      list: {
        class: NestedList,
        inlineToolbar: true,
      },
      checklist: CheckList,
      table: Table,
      button: {
        class: Button,
        inlineToolbar: false,
        config: {
          css: {
            // "btnColor": "btn--gray",
          },
        },
      },
      delimiter: Delimiter,
      image: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        class: zoomImage,
        config: {
          additionalRequestHeaders,
          endpoints: {
            byFile: `${getApiBase()}/api/editorjs/uploadImage`,
            byUrl: `${getApiBase()}/api/editorjs/fetchUrl`,
          },
        },
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      simpleImage: SimpleImage,
      columns: {
        class: EditorJsColumns,
        config: {
          EditorJsLibrary: EditorJS,
          tools: {
            header: Header,
            paragraph: Paragraph,
          }
        }
      }
    };

    console.log('editorCore.current', editorCore.current)
    if (editorElementRef.current) {
      const config: EditorConfig = {
        readOnly,
        holder: editorElementRef.current,
        tools,
        placeholder: 'Начните печатать тут',
        data: value,
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  'Click to tune': 'Нажмите, чтобы настроить',
                  'or drag to move': 'или перетащите',
                },
              },
              inlineToolbar: {
                converter: {
                  'Convert to': 'Конвертировать в',
                },
              },
              toolbar: {
                toolbox: {
                  Add: 'Добавить',
                },
              },
            },
            toolNames: {
              Link: 'Ссылка',
              QuestionLink: 'Вопрос',
              Marker: 'Маркер',
              Bold: 'Полужирный',
              Italic: 'Курсив',
              Text: 'Параграф',
              Heading: 'Заголовок',
              List: 'Список',
              Warning: 'Примечание',
              Checklist: 'Чеклист',
              Quote: 'Цитата',
              Code: 'Код',
              Delimiter: 'Разделитель',
              'Raw HTML': 'HTML-фрагмент',
              Table: 'Таблица',
              InlineCode: 'Моноширинный',
              Image: 'Изображение',
              Attaches: 'Файл',
              Button: 'Кнопка',
              Collapse: 'Спойлер',
              Video: 'Видео',
              InlineImage: 'Картинка',
              Attachment: 'Файл',
            },
            blockTunes: {
              delete: {
                'Click to delete': 'Удалить',
                Delete: 'Удалить',
              },
              moveUp: {
                'Move up': 'Переместить вверх',
              },
              moveDown: {
                'Move down': 'Переместить вниз',
              },
            },
            tools: {
              button: {
                'Button Text': 'Текст кнопки',
                'Link Url': 'Ссылка',
                Set: 'Добавить',
                'Default Button': 'По умолчанию',
              },
              table: {
                'With headings': 'С заголовками',
                'Without headings': 'Без заголовков',
                Heading: 'Заголовок',
                'Add column to left': 'Добавить колонку слева',
                'Add column to right': 'Добавить колонку справа',
                'Delete column': 'Удалить колонку',
                'Add row above': 'Добавить строку сверху',
                'Add row below': 'Добавить строку снизу',
                'Delete row': 'Удалить строку',
              },
              list: {
                Unordered: 'С точками',
                Ordered: 'С цифрами',
              },
              warning: {
                Title: 'Название',
                Message: 'Сообщение',
              },
              linkTool: {
                Link: 'Ссылка',
              },
              image: {
                'With border': 'С границами',
                'With background': 'С фоном',
                'Stretch image': 'Растянуть изображение',
                Caption: 'Надпись',
                'Select an Image': 'Выберите изображение',
              },
              quote: {
                'Left alignment': 'Выровнять по левому краю',
                'Center alignment': 'Выровнять по центру',
                'Enter a quote': 'Введите цитату',
                'Enter a caption': 'Надпись',
              },
              attaches: {
                'Select file to upload': 'Выберите файл',
              },
            },
          },
        },
        onChange: (_, e) => {
          save();
          if (['block-added', 'block-removed'].includes(e.type)) {
            setTimeout(() => {
              // дополнительное асинхронное сохранение при добавлении или удалении блока,
              // фиксит несохранение разделителей
              save();
            }, 300);
          }
        },
        onReady: () => {
          setIsEditorReady(true);
          if (!readOnly && editorCore.current) {
            console.log(editorCore.current, 'eirkerkekr')
            if (!disableUndo) {
              const undo = new Undo({ editor: editorCore.current, maxLength: 100 });
              undoInstance.current = undo;

              if (value) {
                undo.initialize(value);
              }
            }
            // eslint-disable-next-line
            new DragDrop(editorCore.current);
          }

          if (readOnly) {
            // ссылки открываются в новой вкладке
            editorElementRef.current
              ?.querySelectorAll('.ce-paragraph.cdx-block a')
              .forEach((a) => a.setAttribute('target', '_blank'));
            editorElementRef.current
              ?.querySelectorAll('.codex-editor__redactor')
              .forEach((a) => {
                if (styles) {
                  a.classList.add('readOnly');
                }
              });
            editorElementRef.current
              ?.querySelectorAll('.ce-block__content')
              .forEach((a) => {
                if (styles) {
                  a.classList.add(styles.readOnly);
                }
              });
          }

          onReady();
        },
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      editorCore.current = new EditorJS(config);
      await editorCore.current.isReady;
      f.current++;
      console.log(`хуйня выполнилась ${f.current} раз`)
    }
  }, [editorCore.current, editorCore]);
  useEffect(() => {
    init()

    return () => {
      console.log('jjjjjjjjjjjjj')
      // https://www.walkthrough.so/pblc/snKICMzxzedr/codelab-integrating-editor-js-into-your-react-application?sn=2
      if (editorCore.current?.destroy) {
        editorCore.current?.destroy();
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // editorCore.current = null;
    };
    //  TODO: если сюда добавить save и data перестает работать контент и тесты
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, disableUndo, readOnly]);

  // чтобы работало на ctrl-я
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.ctrlKey && ['я', 'Я'].includes(e.key)) {
      undoInstance.current?.undo();
    }
    if (e.ctrlKey && e.code === 'KeyV') {
      setTimeout(() => {
        // дополнительное сохранение при вставке HTML,
        // фиксит баг невалидных данных в блоке из-за которых не сохраняются данные
        save();
      }, 300);
    }
  }

  return (
    <div className={styles.root}>
      {isEditorReady ? 'yes' : 'no'}
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label,jsx-a11y/interactive-supports-focus */}
      <div
        ref={editorElementRef}
        role="textbox"
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default ContentEditor;
