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

//REFACTOR THIS
export interface DockerSetupResponse {
    isConnected: boolean;
    connection: Connection;
    dockerInfo?: any;
    error?: string;
}