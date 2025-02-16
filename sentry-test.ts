import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { httpIntegration, fastifyIntegration, graphqlIntegration } from '@sentry/node'

async function testSentry() {
  // Wyłącz weryfikację SSL dla testów
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  Sentry.init({
    dsn: "",
    debug: true,
    environment: 'development',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    maxBreadcrumbs: 50,
    enabled: true,
    release: 'source-hub@1.81.7',
    integrations: [
      nodeProfilingIntegration(),
      httpIntegration({
        breadcrumbs: true,
      }),
      fastifyIntegration(),
      graphqlIntegration(),
    ],
    beforeSend(event) {
      console.log('Sending event:', {
        eventId: event.event_id,
        message: event.message,
        environment: event.environment
      });
      return event;
    }
  });

  try {
    throw new Error("Test Error from - New Project");
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        source: 'test-script',
        version: '1.81.7'
      }
    });
  }

  await Sentry.flush(10000);
}

testSentry().catch(console.error);

setTimeout(() => {
  process.exit(0);
}, 12000); 
