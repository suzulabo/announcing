/// <reference types="@sveltejs/kit" />

import type { CacheHandler } from '$lib/platform/cache';
import type { createDB } from '@announcing/db';
import type { PutTokenEntrypoint, PutTokenParams } from '@announcing/notification';
import type { CacheStorage } from '@cloudflare/workers-types';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: ReturnType<typeof createDB>;
      putToken: (params: PutTokenParams) => Promise<void>;
      sendEmail: (subject: string, body: string) => Promise<void>;
      cache: CacheHandler;
    }
    interface PageData {
      headerNotification?: {
        channelID: string;
      };
    }
    interface PageState {
      fromPage?: string;
    }
    interface Platform {
      env: {
        D1: D1Database;
        R2: R2Bucket;
        WK_PUT_TOKEN: PutTokenEntrypoint;
        SEND_EMAIL: SendEmail;
      };
      caches: CacheStorage;
      context: {
        waitUntil: (promise: Promise<unknown>) => void;
      };
    }
  }
}

export {};
