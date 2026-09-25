type ErrorOptions = {
	cause?: unknown;
};

export class SlopbotError extends Error {
	readonly code: string;

	constructor(message: string, code: string, options?: ErrorOptions) {
		super(message, options);
		this.name = this.constructor.name;
		this.code = code;
	}
}

export class ConfigError extends SlopbotError {
	constructor(message: string, options?: ErrorOptions) {
		super(message, 'CONFIG', options);
	}
}

export class RuleError extends SlopbotError {
	readonly rulePath: string;

	constructor(rulePath: string, message: string, options?: ErrorOptions) {
		super(`${rulePath}: ${message}`, 'RULE', options);
		this.rulePath = rulePath;
	}
}

export class GitError extends SlopbotError {
	constructor(message: string, options?: ErrorOptions) {
		super(message, 'GIT', options);
	}
}
