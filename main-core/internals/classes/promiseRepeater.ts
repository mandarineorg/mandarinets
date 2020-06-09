// Credits: https://github.com/jakedeichert/promise-repeater

/**
 * This class serves a promise repeater which will re-try your promise until they are successfully resolved or the max attempt limit has been reached.
 * 
 * `await new PromiseRepeater(promiseFunc).maxAttempts(5).start();`
 * `await new PromiseRepeater(promiseFunc).maxAttempts(5).delay(1000).start();`
 * `await new PromiseRepeater(promiseFunc).unlimitedAttempts().delay(1000).start();`
 */
export class PromiseRepeater {
    private config = {
        maxAttempts: 1,
        delayBetweenAttemptsMs: 0,
    };

    private state = {
        attempts: 0,
    };

    constructor(private readonly promiseFunc: () => Promise<any>) {

    }

    public maxAttempts(attempts: number): PromiseRepeater {
        this.config.maxAttempts = attempts;
        return this;
    }

    public unlimitedAttempts(): PromiseRepeater {
        this.config.maxAttempts = Infinity;
        return this;
    }

    public delay(delayBetweenAttemptsMs: number): PromiseRepeater {
        this.config.delayBetweenAttemptsMs = delayBetweenAttemptsMs;
        return this;
    }

    public start(): Promise<any> {
        return this.attempt();
    }

    public async attempt(): Promise<any> {
        this.state.attempts++;
        let result = undefined;
        try {
            result = await this.promiseFunc();
        } catch (error) {
            if (this.state.attempts === this.config.maxAttempts) {
                throw error;
            }
            // Failed attempt. Delay and then try again.
            if (this.config.delayBetweenAttemptsMs) {
                await this.sleep(this.config.delayBetweenAttemptsMs);
            }
            result = await this.attempt();
        }
        return result;
    }

    private sleep(timeoutMs: number): Promise<void> {
        return new Promise((resolve): void => {
            setTimeout(() => {
                resolve();
            }, timeoutMs);
        });
    }
}
