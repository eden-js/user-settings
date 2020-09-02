
// Require dependencies
const Controller = require('controller');

// require local dependencies
const Setting = model('setting');

/**
 * Create settings controller
 */
class SettingsController extends Controller {
  /**
   * construct user controller
   */
  constructor() {
    // Run super
    super();

    // bind methods
    this.settingSetAction = this.settingSetAction.bind(this);
    this.settingGetAction = this.settingGetAction.bind(this);
  }

  /**
   * sets setting event
   *
   * @param {String} name
   * @param {*} value
   *
   * @call setting.get
   */
  async settingGetAction(data, { user, sessionID }) {
    // set settings
    return (await Setting.or({
      session : sessionID,
    }, {
      'user.id' : user ? user.get('_id').toString() : 'false',
    }).find()).map((setting) => {
      // return Object
      return {
        name  : setting.get('name'),
        value : setting.get('value'),
      };
    });
  }

  /**
   * sets setting event
   *
   * @param {String} name
   * @param {*} value
   *
   * @call setting.set
   */
  async settingSetAction(data, { user, sessionID, socket }) {
    // emit setting
    socket.emit('setting', data);

    // create lock
    const unlock = await this.eden.lock(`setting.${sessionID}`);

    // check setting exists
    const setting = await Setting.where({
      name    : data.name,
      session : sessionID,
    }).findOne() || await Setting.where({
      name      : data.name,
      'user.id' : user ? user.get('_id').toString() : 'false',
    }).findOne() || new Setting({
      name : data.name,
    });

    // check session/user
    setting.set('user', user);
    setting.set('session', sessionID);

    // set setting
    setting.set('value', data.value);

    // save setting
    await setting.save();

    // unlock
    unlock();
  }
}

/**
 * eport settings controller
 *
 * @type {SettingsController}
 */
module.exports = SettingsController;
