/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */

// get dotProp
const dotProp = require('dot-prop');

// Create mixin
module.exports = (toMix) => {
  // On mount update
  if (!toMix.eden.frontend) {
    // Set acl
    toMix.settings = {
      __data : toMix.eden.get('settings') || {},
    };

    // Add get method
    toMix.settings.get = (key) => {
      // Check key
      if (!key) return toMix.settings.__data;

      // Return id
      return dotProp.get(toMix.settings.__data, key) || d;
    };

    // Add set method
    toMix.settings.set = (key, value) => {
      // Return id
      dotProp.set(toMix.settings.__data, key, value);
    };
  } else {
    // Check user loaded
    toMix.settings = require('settings/public/js/bootstrap');

    // create unbound function
    const updated = () => {
      toMix.safeUpdate();
    };

    // On update
    toMix.settings.on('update', updated);

    // On unmount
    toMix.on('unmount', () => {
      // Remove on update
      toMix.settings.removeListener('update', updated);
    });
  }
};
