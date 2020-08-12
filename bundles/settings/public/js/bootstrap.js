
// require dependencies
const Events = require('events');
const socket = require('socket/public/js/bootstrap');

/**
 * create form store
 */
class SettingsStore extends Events {
  /**
   * construct riot store
   */
  constructor(...args) {
    // set observable
    super(...args);

    // set data
    this.__data = {};

    // bind methods
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);

    // bind private methods
    this.onSetting = this.onSetting.bind(this);

    // listen to socket for setting
    socket.on('setting', this.onSetting);

    // On user socket
    socket.on('user', this.__update);
    this.__update();
  }

  /**
   * gets setting value
   *
   * @param  {String} name
   *
   * @return {*}
   */
  get(name) {
    // return value
    return this.__data[name];
  }

  /**
   * sets setting value
   *
   * @param  {String} name
   * @param  {*} value
   */
  set(name, value) {
    // get value
    const old = this.__data[name];

    // set setting
    this.__data[name] = value;

    // trigger update
    if (old !== value) {
      // trigger update
      this.emit('update');

      // emit setting
      socket.call('setting.set', {
        name,
        value,
      });
    }
  }

  /**
   * on socket setting change
   *
   * @param {Object} setting
   *
   * @private
   */
  onSetting(setting) {
    // get value
    const old = this.__data[setting.name];

    // set setting
    this.__data[setting.name] = setting.value;

    // update if different
    if (old !== setting.value) this.emit('update');
  }

  /**
   * update
   */
  __update() {
    // check window
    if (typeof window === 'undefined') return;

    // emit setting
    socket.call('setting.get', {}).then((settings) => {
      // settings
      settings.forEach((setting) => {
        // set name and value
        this.__data[setting.name] = setting.value;
      });

      // update
      if (settings.length) this.emit('update');
    });
  }
}

/**
 * export built settings store
 *
 * @type {SettingStore}
 */
module.exports = new SettingsStore();
