// get dotProp
import { useState, useEffect } from 'react';

// create use dashup macro
const useSettings = (key, def) => {
  // use state
  const [setting, setSetting] = useState(typeof eden !== 'undefined' ? eden.settings.get(key) || def : def);

  // on settings
  const onSetting = (val) => {
    // set settings
    setSetting(val);
  };

  // set value
  const setValue = (val, force) => {
    // check settings
    if (typeof eden === 'undefined') return setSetting(val);

    // set to settings
    setSetting(val);
    eden.settings.set(key, val, force);
  };

  // get dashup
  useEffect(() => {
    // check settings
    if (typeof eden === 'undefined') return;

    // get dashup
    eden.settings.on(key, onSetting);

    // return done
    return () => {
      // remove lisetener
      eden.settings.removeListener(key, onSetting);
    };
  }, [typeof eden !== 'undefined' ? !!eden.settings : false]);
  
  // return dashup
  return [setting, setValue];
};

// export default
export default useSettings;