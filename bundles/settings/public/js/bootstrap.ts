
// require dependencies
import socket from 'socket/public/js/bootstrap';
import { EventEmitter } from 'events';

/**
 * create form store
 */
class SettingsStore extends EventEmitter {
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

    // bind update
    this.__update = this.__update.bind(this);

    // bind private methods
    this.onSetting = this.onSetting.bind(this);

    // listen to socket for setting
    socket.on('setting', this.onSetting);

    // On user socket
    socket.on('user', this.__update);
    this.__update();

    // set max listeners
    this.setMaxListeners(0);

    // building
    this.building = new Promise((resolve) => {
      this.__built = resolve;
    });
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
  set(name, value, force) {
    // get value
    const old = this.__data[name];

    // set setting
    this.__data[name] = value;

    // trigger update
    if (force || JSON.stringify(old) !== JSON.stringify(value)) {
      // trigger update
      this.emit('update');
      this.emit(name, value);

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
    if (old !== setting.value) {
      this.emit('update');
      this.emit(setting.name, setting.value);
    }
  }

  /**
   * update
   */
  __update() {
    // check window
    if (typeof window === 'undefined') return;

    // load
    const load = () => {
      // emit setting
      socket.call('setting.get', {}).then((settings) => {
        // settings
        settings.forEach((setting) => {
          // set name and value
          this.__data[setting.name] = setting.value;
          this.emit(setting.name, setting.value);
        });

        // update
        if (settings.length) {
          this.emit('update');
        }
        this.__built();
      });
    };

    // await ready
    (() => {
      // timeout
      load();
      setTimeout(load, 1000);
    })();
  }
}

// built settings
const builtSettings = new SettingsStore();

// build settings
window.eden.settings = builtSettings;

// export
export default builtSettings;