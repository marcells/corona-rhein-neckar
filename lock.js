import { EventEmitter } from 'events';

export const lock = () => {
  let locked = {};
  const ee = new EventEmitter();
  ee.setMaxListeners(0);

  return {
    acquire: (key, isCached, onGet, onSet) =>
      new Promise(async resolve => {
        const tryAcquire = value => {
          if (!locked[key]) {
            ee.removeListener(key, tryAcquire);
            return resolve(value);
          }
        };

        const release = (key, value) => {
          delete locked[key];
          setImmediate(() => ee.emit(key, value));
        };

        if (isCached) {
          const data = await onGet();
          resolve(data);
          
          return;
        }

        ee.on(key, tryAcquire);

        if (!locked[key]) {
          locked[key] = true;

          const data = await onSet();
          release(key, data);
        }
      }),
    
  };
};