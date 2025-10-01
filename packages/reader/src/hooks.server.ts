import { dev } from '$app/environment';
import { EMAIL_ADDRESS } from '$env/static/private';
import { PUBLIC_READER_SENTRY_DSN } from '$env/static/public';
import { createCacheHandler } from '$lib/platform/cache';
import { createDB } from '@announcing/db';
import {
  handleErrorWithSentry,
  initCloudflareSentryHandle,
  sentryHandle,
  init as sentryInit,
} from '@sentry/sveltekit';
import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

let localBindings: App.Platform['env'];

if (dev) {
  localBindings = await (await import('$lib/local/localBinding')).createLocalBindings();
}

const cloudflareHandle: Handle = ({ resolve, event }) => {
  if (dev) {
    event.locals = {
      ...event.locals,
      db: createDB(localBindings),
      putToken: async (params) => {
        await localBindings.WK_PUT_TOKEN.putToken(params);
      },
      sendEmail: (subject, body) => {
        console.log(`sendEmail: ${subject}\n${body}`);
        return Promise.resolve();
      },
    };
  } else {
    if (!event.platform) {
      throw new Error('Missing platform');
    }
    const { env } = event.platform;
    event.locals = {
      ...event.locals,
      db: createDB(env),
      putToken: async (params) => {
        await env.WK_PUT_TOKEN.putToken(params);
      },
      sendEmail: (subject, body) => {
        const msg = createMimeMessage();
        msg.setSender({ addr: EMAIL_ADDRESS });
        msg.setRecipient(EMAIL_ADDRESS);
        msg.setSubject(subject);
        msg.addMessage({
          contentType: 'text/plain',
          data: body,
        });
        const message = new EmailMessage(EMAIL_ADDRESS, EMAIL_ADDRESS, msg.asRaw());
        return env.SEND_EMAIL.send(message);
      },
      cache: createCacheHandler(
        event.url,
        event.platform.caches.default as unknown as Cache,
        event.platform.context.waitUntil,
      ),
    };
  }
  return resolve(event);
};

const handlers = [];
if (PUBLIC_READER_SENTRY_DSN) {
  if (!dev) {
    handlers.push(
      initCloudflareSentryHandle({
        dsn: PUBLIC_READER_SENTRY_DSN,
        tracesSampleRate: 1.0,
      }),
    );
  } else {
    sentryInit({
      dsn: PUBLIC_READER_SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }
  handlers.push(sentryHandle());
}
handlers.push(cloudflareHandle);

export const handle = sequence(...handlers);

export const handleError = handleErrorWithSentry();
