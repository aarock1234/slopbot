import pino from 'pino';

import { env } from './env.js';

const STDERR_FD = 2;

// logs go to stderr so stdout stays clean for machine-readable report output.
// pretty-print only when a human is watching.
export const logger = process.stderr.isTTY
	? pino({
			level: env.LOG_LEVEL,
			transport: {
				target: 'pino-pretty',
				options: {
					destination: STDERR_FD,
					translateTime: 'SYS:standard',
				},
			},
		})
	: pino({ level: env.LOG_LEVEL }, pino.destination(STDERR_FD));
