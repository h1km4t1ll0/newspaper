// import React from 'react';
// import { Upload } from 'antd';
// import ReactDOM from 'react-dom';
// import styles from './inlineImage.module.scss';

import axios from 'axios';

import additionalRequestHeaders from '../additionalRequestHeaders';
import {getApiBase} from "@components/editor-js/ContentEditor";

class InlineImageTool {
  static get isInline() {
    return true;
  }

  button: HTMLButtonElement | null = null;

  state: boolean = false;

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = `
      <svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg">
        <path d="M291 150.242V79c0-18.778-15.222-34-34-34H79c-18.778 0-34 15.222-34 34v42.264l67.179-44.192 80.398 71.614 56.686-29.14L291 150.242zm-.345 51.622l-42.3-30.246-56.3 29.884-80.773-66.925L45 174.187V197c0 18.778 15.222 34 34 34h178c17.126 0 31.295-12.663 33.655-29.136zM79 0h178c43.63 0 79 35.37 79 79v118c0 43.63-35.37 79-79 79H79c-43.63 0-79-35.37-79-79V79C0 35.37 35.37 0 79 0z"></path>
      </svg>
    `;
    this.button.className = 'ce-inline-tool';

    return this.button;
  }

  surround(range: Range) {
    if (this.state) {
      return;
    }
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
    input.onchange = async () => {
      //@ts-ignore
      const [file] = input.files ?? [];

      try {
        const loadingSpan = document.createElement('span');
        loadingSpan.innerText = 'Загрузка...';
        range.insertNode(loadingSpan);

        const formData = new FormData();
        formData.append('image', file);

        const route = `${getApiBase()}/api/editorjs/uploadImage`;
        const req = await axios.post(route, formData, {
          headers: additionalRequestHeaders,
        });

        const img = document.createElement('img');
        img.setAttribute('src', req.data.file.url);
        img.style.maxWidth = '100%';
        img.style.pointerEvents = 'none';

        loadingSpan.replaceWith(img);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    };
  }

  checkState(selection: Selection) {
    const text = selection.anchorNode;

    if (!text) {
      return;
    }

    const anchorElement = text instanceof Element ? text : text.parentElement;
    this.state = !!anchorElement?.closest('IMG');
  }
}

export default InlineImageTool;
