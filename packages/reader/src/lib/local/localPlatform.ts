import { createWorkerEntrypointLocal } from '@announcing/cloudflare-support/local';
import { createLocalPlatform } from '@announcing/cloudflare-support/localPlatform';
import { PutTokenEntrypoint } from '@announcing/notification';

export const localPlatform = await (async () => {
  const platform = await createLocalPlatform();

  const WK_PUT_TOKEN = createWorkerEntrypointLocal(PutTokenEntrypoint, platform.env);

  const env = { ...platform.env, WK_PUT_TOKEN };

  return {
    ...platform,
    env,
  };
})();
