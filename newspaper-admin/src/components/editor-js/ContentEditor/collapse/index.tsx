import { Collapse, Input } from 'antd';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import React, {
  ChangeEventHandler,
  KeyboardEvent, KeyboardEventHandler, MouseEventHandler, useCallback, useEffect, useRef,
} from 'react';
import ReactDOM from 'react-dom';

import styles from './collapse.module.scss';

interface CollapseData {
  content?: string | null,
  title?: string,
}

interface CollapseComponentProps {
  data: CollapseData,
  onDataChange: (data: CollapseData) => void,
  readOnly: boolean,
}

const autoSize = { minRows: 1, maxRows: 6 };

const CollapseComponent = (
  {
    data: { title, content },
    onDataChange,
    readOnly,
  }: CollapseComponentProps,
) => {
  const editingDiv = useRef<HTMLDivElement | null>(null);

  function insertInnerHTML() {
    if (editingDiv.current) {
      editingDiv.current.innerHTML = content || '';
    }
  }

  // TODO: Почему это ломается если контет в зависимостях?
  // Возможно потому, что при установке innerHTML нового значения курсор устанавливается в начало строки на каждый чих, чтобы этого не происходило тут div с contentEditable некотролируемый, если я правильно понял идею)
  // не добавлять content в зависимости!
  // eslint-disable-next-line
  useEffect(insertInnerHTML, []);

  // вставка HTML
  const onPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.clipboardData.getData('text/html');
    const [, html = ''] = data.match(/.*<!--StartFragment-->(.*)<!--EndFragment-->.*/) ?? [];
    const newElement = document.createElement('div');
    const selection = document.getSelection();
    const range = selection?.getRangeAt(0);
    range?.deleteContents();
    const endContainer = range?.endContainer;
    if (
      endContainer instanceof Element
      && endContainer.tagName === 'BR'
    ) {
      endContainer.insertAdjacentElement('afterend', newElement);
    } else {
      range?.insertNode(newElement);
    }
    if (newElement?.nextSibling) {
      range?.setStart(newElement.nextSibling, 0);
      range?.setEnd(newElement.nextSibling, 0);
    } else {
      // eslint-disable-next-line
      if (newElement.parentElement) {
        range?.selectNode(newElement.parentElement);
        range?.collapse();
      }
    }
    newElement.outerHTML = html;
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (['Enter', 'NumpadEnter', 'KeyV'].includes(e.code)) {
      e.stopPropagation();
    }
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    onDataChange({ content: e.nativeEvent?.target?.innerHTML });
  }, [onDataChange]);

  useEffect(() => {
    // детектировать изменения DOM
    if (editingDiv.current) {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(() => {
          onDataChange({
            content: editingDiv.current?.innerHTML ?? '',
          });
        });
      });

      observer.observe(editingDiv.current, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
    return () => {
    };
    // не добавлять onDataChange в зависимости!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => onDataChange({ title: e.target.value }),
    [onDataChange],
  );

  const onClick: MouseEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => e.stopPropagation(),
    [],
  );

  const onKeyPress: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => e.stopPropagation(),
    [],
  );

  const onPressEnter: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => e.stopPropagation(),
    [],
  );

  return (
    <Collapse>
      <CollapsePanel
        key="1"
        forceRender
        header={
          readOnly
            ? (
              <div className={styles.header}>
                {title}
              </div>
            ) : (
              <Input.TextArea
                placeholder="Заголовок"
                className={styles.headerInput}
                autoSize={autoSize}
                value={title}
                onChange={onChange}
                onClick={onClick}
                onKeyPress={onKeyPress}
                onPressEnter={onPressEnter}
              />
            )
        }
      >
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label,jsx-a11y/interactive-supports-focus */}
        <div
          contentEditable={!readOnly}
          ref={editingDiv}
          role="textbox"
          className={styles.padding}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onPaste={onPaste}
        />
      </CollapsePanel>
    </Collapse>
  );
};

export default class CollapseTool {
  static get toolbox() {
    return {
      icon: `
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
        >
          <path
            d="M512 576l192 192H576v192H448v-192H320l192-192z m192-384H576V0H448v192H320l192 192 192-192z m256 128c0-35.2-28.8-64-64-64h-160l-64 64h192l-128 128h-448l-128-128h192l-64-64H128c-35.2 0-64 28.8-64 64l160 160L64 640c0 35.2 28.8 64 64 64h160l64-64h-192l128-128h448l128 128h-192l64 64H896c35.2 0 64-28.8 64-64l-160-160L960 320z"
          ></path>
        </svg>`,
      title: 'Collapse',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get sanitize() {
    return {
      title: false,
      content: {
        div: true,
        p: true,
        b: true,
        a: true,
        i: true,
        mark: true,
        br: true,
        img: true,
      },
    };
  }

  api: any;

  readOnly: boolean = false;

  data: CollapseData = {
    title: '',
    content: '',
  };

  rootClassname: string = styles.collapseTool;

  holderNode: HTMLElement | undefined;

  constructor(
    {
      data, api, readOnly,
    }: any,
  ) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = data || this.data;
  }

  render() {
    const rootNode = document.createElement('div');
    rootNode.setAttribute('class', this.rootClassname);
    this.holderNode = rootNode;

    this.renderReact();

    return this.holderNode;
  }

  onDataChange = (newData: CollapseData) => {
    this.data = { ...this.data, ...newData };
    this.renderReact();
  };

  renderReact() {
    if (!this.holderNode) {
      return;
    }

    ReactDOM.render(
      <CollapseComponent
        onDataChange={this.onDataChange}
        readOnly={this.readOnly}
        data={this.data}
      />,
      this.holderNode,
    );
  }

  save() {
    return this.data;
  }
}
