export class Configuration {
    private host: string = "127.0.0.1";
    private port: number = 4444;

    public getPort(): number {
        return this.port;
    }

    public getFullServerConfiguration(): string {
        return `${this.host}:${this.port}`;
    }
}