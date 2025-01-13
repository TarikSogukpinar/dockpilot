export interface Connection {
    id: number;
    uuid: string;
    host: string;
    port: number;
    ownerId: number;
    tlsConfig?: any;
    createdAt: Date;
    updatedAt: Date;
}