export interface Connection {
    id: number;
    uuid: string;
    name: string;
    host: string;
    port: number;
    tlsConfig?: any;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
}

//REFACTOR THIS
export interface DockerSetupResponse {
    isConnected: boolean;
    connection: Connection;
    dockerInfo?: any;
    error?: string;
}