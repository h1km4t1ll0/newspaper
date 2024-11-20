// eslint-disable-next-line @typescript-eslint/no-unused-vars
import css from './index.scss';

export default class QuestionLinkTool {
  /**
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      title: 'QuestionLink',
      icon: '<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 395.001 395" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M322.852,0H72.15C32.366,0,0,32.367,0,72.15v250.7C0,362.634,32.367,395,72.15,395h250.701 c39.784,0,72.15-32.366,72.15-72.15V72.15C395.002,32.367,362.635,0,322.852,0z M370.002,322.85 c0,25.999-21.151,47.15-47.15,47.15H72.15C46.151,370,25,348.849,25,322.85V72.15C25,46.151,46.151,25,72.15,25h250.701 c25.999,0,47.15,21.151,47.15,47.15L370.002,322.85L370.002,322.85z"></path> <path d="M197.501,79.908c-33.775,0-61.253,27.479-61.253,61.254c0,6.903,5.596,12.5,12.5,12.5c6.904,0,12.5-5.597,12.5-12.5 c0-19.99,16.263-36.254,36.253-36.254s36.253,16.264,36.253,36.254c0,11.497-8.314,19.183-22.01,30.474 c-12.536,10.334-26.743,22.048-26.743,40.67v40.104c0,6.902,5.597,12.5,12.5,12.5c6.903,0,12.5-5.598,12.5-12.5v-40.104 c0-6.832,8.179-13.574,17.646-21.381c13.859-11.426,31.106-25.646,31.106-49.763C258.754,107.386,231.275,79.908,197.501,79.908z"></path> <path d="M197.501,283.024c-8.842,0-16.034,7.193-16.034,16.035c0,8.84,7.192,16.033,16.034,16.033 c8.841,0,16.034-7.193,16.034-16.033C213.535,290.217,206.342,283.024,197.501,283.024z"></path> </g> </g> </g></svg>',
    };
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
   * @param data
   */
  set data(data) {
    this._data = {
      questionIndex: data.questionIndex,
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
    if (Number.isNaN(Number(this._data.questionIndex))) {
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
      label: null,
      inputHolder: null,
      anyButtonHolder: null,
      linkInput: null,
      icon: null,
      anyButton: null,
      titleLink: null,
    };
    // css overwrite
    const _CSS = {
      baseClass: this.api.styles.block,
      hide: 'hide',
      btn: 'linkWrap',
      container: 'questionLinkContainer',
      input: 'questionLinkContainer__input',
      wrapperBlock: 'wrapperBlock',

      inputHolder: 'questionLinkContainer__inputHolder',
      inputText: 'questionLinkContainer__input--text',
      inputLink: 'questionLinkContainer__input--link',
      registButton: 'questionLinkContainer__registerButton',
      anyButtonHolder: 'youTubeLinkHolder',
      linkTitle: 'linkTitle',
      icon: 'iconSource',
      btnColor: 'default',
      toggleSwitch: 'toggle-switch',
      toggleInput: 'toggle-input',
      toggleLabel: 'toggle-label',
    };

    this.config = config;
    this.CSS = Object.assign(_CSS, config.css);

    this.data = data;
  }

  render() {
    this.nodes.wrapper = this.make('div', this.CSS.baseClass);
    this.nodes.container = this.make('div', this.CSS.container);

    this.nodes.label = this.make('span');
    this.nodes.label.append('Вопрос');
    // 入力用
    this.nodes.inputHolder = this.makeInputHolder();

    this.nodes.container.appendChild(this.nodes.label);
    this.nodes.container.appendChild(this.nodes.inputHolder);

    if (!Number.isNaN(Number(this._data.questionIndex))) {
      this.init(Number(this._data.questionIndex));
    }

    this.nodes.wrapper.appendChild(this.nodes.container);
    return this.nodes.wrapper;
  }

  makeInputHolder() {
    const inputHolder = this.make('div', [this.CSS.inputHolder]);

    this.nodes.linkInput = this.make('input', [this.api.styles.input, this.CSS.input, this.CSS.inputLink]);

    this.nodes.linkInput.addEventListener('input', (e) => {
      const number = Number(e.target.value);

      if (!Number.isNaN(number) && number > 0) {
        this.data = {
          questionIndex: number - 1,
        };
        this.save();
      }
    });

    this.nodes.linkInput.dataset.placeholder = this.api.i18n.t('Введите номер вопроса');

    inputHolder.appendChild(this.nodes.linkInput);
    return inputHolder;
  }

  init(value) {
    this.nodes.linkInput.value = value + 1;
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
