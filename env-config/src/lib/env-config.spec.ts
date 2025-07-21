import { envConfig } from './env-config';

describe('envConfig', () => {
  it('should work', () => {
    expect(envConfig()).toEqual('env-config');
  });
});
