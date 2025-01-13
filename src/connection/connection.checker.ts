import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import { Connection } from './connection.interface';

@Injectable()
export class ConnectionChecker {
    async checkConnection(connection: Connection): Promise<{ isConnected: boolean; error?: string }> {
        const docker = new Docker({
            host: connection.host,
            port: connection.port,
        });

        try {
            await docker.ping();
            return { isConnected: true };
        } catch (error) {
            return {
                isConnected: false,
                error: `Docker connection failed: ${error.message}`
            };
        }
    }
}