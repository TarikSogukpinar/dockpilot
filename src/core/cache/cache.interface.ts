export interface ICacheServiceInterface {
    setCache(key: string, value: string, ttl?: number): Promise<void>;
    getCache(key: string): Promise<string | null>;
    deleteCache(key: string): Promise<void>;
    publish(channel: string, message: string): Promise<number>;
    subscribe(channel: string, callback: (message: string) => void): void;
}