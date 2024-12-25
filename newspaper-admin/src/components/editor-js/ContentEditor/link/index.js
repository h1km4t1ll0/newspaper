import youtube from './youtube.svg';
import search from './globalSearch.svg';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import css from './index.scss';

export default class LinkTool {
  /**
     *
     * @returns {{icon: string, title: string}}
     */
  static get toolbox() {
    return {
      title: 'Link',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
                + '<path d="M7.69998 12.6L7.67896 12.62C6.53993 13.7048 6.52012 15.5155 7.63516 16.625V16.625C8.72293 17.7073 10.4799 17.7102 11.5712 16.6314L13.0263 15.193C14.0703 14.1609 14.2141 12.525 13.3662 11.3266L13.22 11.12" stroke="black" stroke-width="2" stroke-linecap="round"/>\n'
                + '<path d="M16.22 11.12L16.3564 10.9805C17.2895 10.0265 17.3478 8.5207 16.4914 7.49733V7.49733C15.5691 6.39509 13.9269 6.25143 12.8271 7.17675L11.3901 8.38588C10.0935 9.47674 9.95706 11.4241 11.0888 12.6852L11.12 12.72" stroke="black" stroke-width="2" stroke-linecap="round"/>\n'
                + '</svg>',
    };
  }

  get sourceIcon() {
    const wordsArray = ['youtube', 'youtu', 'www.you', 'https://www.youtube.com'];
    return (str) => {
      for (let i = 0; i < wordsArray.length; i++) {
        const regex = new RegExp(`\\b${wordsArray[i]}\\b`, 'i');
        if (str.match(regex)) {
          return youtube;
        }
      }
      return search;
    };
  }

  updateIcon() {
    this.nodes.iconSrc = this.sourceIcon(this._data.link);
  }

  /**
     * Returns true to notify the core that read-only mode is supported
     *
     * @return {boolean}
     */
  static get isReadOnlySupported() {
    return true;
  }

  /**
     *
     * @returns {boolean}
     */
  static get enableLineBreaks() {
    return false;
  }

  /**
     *
     * @returns {{EDIT: number, VIEW: number}}
     * @constructor
     */
  static get STATE() {
    return {
      EDIT: 0,
      VIEW: 1,
    };
  }

  /**
     *
     * @param data
     */
  set data(data) {
    this._data = {
      link: this.api.sanitizer.clean(data.link || '', LinkTool.sanitize),
      text: this.api.sanitizer.clean(data.text || '', LinkTool.sanitize),
    };
  }

  /**
     *
     * @returns {{text: string, link: string}}
     */
  get data() {
    return this._data;
  }

  /**
     * セーブ時のバリデーション
     * @param savedData
     * @returns {boolean}
     */
  validate() {
    if (this._data.link === '' || this._data.text === '') {
      return false;
    }

    return true;
  }

  /**
     *
     * @param block
     * @returns {{caption: string, text: string, alignment: string}}
     */
  save() {
    return this._data;
  }

  /**
     * タグを全部削除する
     * @returns {{link: boolean, text: boolean}}
     */
  static get sanitize() {
    return {
      text: false,
      link: false,
    };
  }

  /**
     *
     * @param data
     * @param config
     * @param api
     * @param readOnly
     */
  constructor({
    data, config, api, readOnly,
  }) {
    this.api = api;
    this.readOnly = readOnly;

    this.nodes = {
      wrapper: null,
      container: null,
      inputHolder: null,
      toggleHolder: null,
      anyButtonHolder: null,
      textInput: null,
      linkInput: null,
      icon: null,
      iconSrc: search,
      registButton: null,
      anyButton: null,
      titleLink: null,
    };
    // css overwrite
    const _CSS = {
      baseClass: this.api.styles.block,
      hide: 'hide',
      btn: 'linkWrap',
      container: 'anyButtonContainer',
      input: 'anyButtonContainer__input',
      wrapperBlock: 'wrapperBlock',

      inputHolder: 'anyButtonContainer__inputHolder',
      inputText: 'anyButtonContainer__input--text',
      inputLink: 'anyButtonContainer__input--link',
      registButton: 'anyButtonContainer__registerButton',
      anyButtonHolder: 'youTubeLinkHolder',
      linkTitle: 'linkTitle',
      icon: 'iconSource',
      btnColor: 'default',
      toggleSwitch: 'toggle-switch',
      toggleInput: 'toggle-input',
      toggleLabel: 'toggle-label',
    };

    this.CSS = Object.assign(_CSS, config.css);

    this.data = {
      link: '',
      text: '',
    };
    this.data = data;
  }

  render() {
    this.nodes.wrapper = this.make('div', this.CSS.baseClass);
    this.nodes.container = this.make('div', this.CSS.container); // twitter-embed-tool

    // 入力用
    this.nodes.inputHolder = this.makeInputHolder();
    // toggle
    this.nodes.toggleHolder = this.makeToggle();
    // display button
    this.nodes.anyButtonHolder = this.makeLinkToolHolder();

    this.nodes.container.appendChild(this.nodes.toggleHolder);
    this.nodes.container.appendChild(this.nodes.inputHolder);
    this.nodes.container.appendChild(this.nodes.anyButtonHolder);

    this.nodes.anyButtonHolder.addEventListener('click', () => {
      if (this.readOnly && this._data.link !== '') {
        window.open(this._data.link, '_blank');
      }
    });

    if (this._data.link !== '') {
      this.init();
      this.show(LinkTool.STATE.VIEW);
    }

    this.nodes.wrapper.appendChild(this.nodes.container);
    this.updateIcon();
    return this.nodes.wrapper;
  }

  makeInputHolder() {
    const inputHolder = this.make('div', [this.CSS.inputHolder]);
    this.nodes.textInput = this.make('div', [this.api.styles.input, this.CSS.input, this.CSS.inputText], {
      contentEditable: !this.readOnly,
    });
    this.nodes.textInput.dataset.placeholder = this.api.i18n.t('Введите заголовок для ссылки');

    this.nodes.linkInput = this.make('div', [this.api.styles.input, this.CSS.input, this.CSS.inputLink], {
      contentEditable: !this.readOnly,
    });
    this.nodes.linkInput.dataset.placeholder = this.api.i18n.t('Вставьте ссылку на видео');

    this.nodes.registButton = this.make('button', [this.api.styles.button, this.CSS.registButton]);
    this.nodes.registButton.type = 'button';
    this.nodes.registButton.textContent = this.api.i18n.t('Готово');

    this.nodes.registButton.addEventListener('click', () => {
      this.data = {
        link: this.nodes.linkInput.textContent,
        text: this.nodes.textInput.textContent,
      };
      this.show(LinkTool.STATE.VIEW);
    });

    inputHolder.appendChild(this.nodes.textInput);
    inputHolder.appendChild(this.nodes.linkInput);
    inputHolder.appendChild(this.nodes.registButton);
    return inputHolder;
  }

  init() {
    this.nodes.textInput.textContent = this._data.text;
    this.nodes.linkInput.textContent = this._data.link;
    this.updateIcon();
  }

  show(state) {
    this.nodes.titleLink.textContent = this._data.text;
    this.nodes.anyButton.textContent = this._data.link;
    this.nodes.anyButton.setAttribute('href', this._data.link);
    this.updateIcon();
    this.changeState(state);
  }

  makeLinkToolHolder() {
    const wrap = this.make('div', [this.CSS.wrapperBlock]);
    const anyButtonHolder = this.make('div', [this.CSS.hide, this.CSS.anyButtonHolder]);
    this.nodes.icon = this.make('img', [this.CSS.icon], {
      src: this.nodes.iconSrc,
    });
    this.nodes.titleLink = this.make('p', [this.CSS.linkTitle]);
    this.nodes.anyButton = this.make('a', [this.CSS.btn, this.CSS.btnColor], {
      target: '_blank',
      rel: 'nofollow noindex noreferrer',
    });
    this.nodes.anyButton.textContent = this.api.i18n.t('Default Button');
    anyButtonHolder.appendChild(this.nodes.icon);

    wrap.appendChild(this.nodes.titleLink);
    wrap.appendChild(this.nodes.anyButton);
    anyButtonHolder.appendChild(wrap);
    return anyButtonHolder;
  }

  changeState(state) {
    this.updateIcon();
    switch (state) {
      case LinkTool.STATE.EDIT:
        this.nodes.inputHolder.classList.remove(this.CSS.hide);
        this.nodes.anyButtonHolder.classList.add(this.CSS.hide);
        this.nodes.toggleInput.checked = 0;

        break;
      case LinkTool.STATE.VIEW:
        this.nodes.inputHolder.classList.add(this.CSS.hide);
        this.nodes.anyButtonHolder.classList.remove(this.CSS.hide);
        this.nodes.toggleInput.checked = 1;
        break;
      default:
        break;
    }
  }

  makeToggle() {
    /**
         * <div class="toggle-switch">
         <input id="toggle" class="toggle-input" type='checkbox' />
         <label for="toggle" class="toggle-label"/>
         </div>
         */
    const toggleHolder = this.make('div', [this.CSS.toggleSwitch]);
    this.nodes.toggleInput = this.make(
      'input',
      [this.CSS.toggleInput],
      {
        type: 'checkbox',
        id: 'toggle',
      },
    );
    const label = this.make('label', [this.CSS.toggleLabel], { for: 'toggle' });

    this.nodes.toggleInput.addEventListener('change', () => {
      this.data = {
        link: this.nodes.linkInput.textContent,
        text: this.nodes.textInput.textContent,
      };
      this.show(Number(this.nodes.toggleInput.checked));
    });
    toggleHolder.appendChild(this.nodes.toggleInput);
    toggleHolder.appendChild(label);
    this.updateIcon();
    return toggleHolder;
  }

  /**
     * node 作成用
     * @param tagName
     * @param classNames
     * @param attributes
     * @returns {*}
     */
  make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    Object.keys(attributes).forEach((attrName) => {
      el[attrName] = attributes[attrName];
    });
    return el;
  }
}
