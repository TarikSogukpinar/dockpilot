export type GetConnectionsResponseDto = {
    id: number;
    uuid: string;
    name: string;
    host: string;
    port: number;
    tlsConfig: any;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}[]