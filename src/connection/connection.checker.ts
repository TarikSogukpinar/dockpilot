import { Injectable, Logger } from '@nestjs/common';
import Docker from 'dockerode';
import { Connection } from './connection.interface';

@Injectable()
export class ConnectionChecker {
  private readonly logger = new Logger(ConnectionChecker.name);
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5; // Maksimum yeniden bağlanma denemesi

  async checkConnection(
    connection: Connection,
  ): Promise<{ isConnected: boolean; error?: string }> {
    const docker = new Docker({
      host: connection.host,
      port: connection.port,
      ...(connection.tlsConfig && {
        ca: connection.tlsConfig['ca'],
        cert: connection.tlsConfig['cert'],
        key: connection.tlsConfig['key'],
      }),
      timeout: connection.connectionTimeout || 30000, // Bağlantı zaman aşımı süresini kullan
    });

    try {
      await docker.ping();
      // Başarılı bağlantıda yeniden bağlanma sayacını sıfırla
      if (this.reconnectAttempts.has(connection.uuid)) {
        this.reconnectAttempts.delete(connection.uuid);
      }
      return { isConnected: true };
    } catch (error) {
      this.logger.error(`Docker connection failed: ${error.message}`, error.stack);
      
      // AutoReconnect özelliği etkinse yeniden bağlanmayı dene
      if (connection.autoReconnect) {
        return await this.handleAutoReconnect(connection, docker, error);
      }
      
      return {
        isConnected: false,
        error: `Docker connection failed: ${error.message}`,
      };
    }
  }

  private async handleAutoReconnect(
    connection: Connection, 
    docker: Docker, 
    originalError: any
  ): Promise<{ isConnected: boolean; error?: string }> {
    // Mevcut yeniden bağlanma denemesi sayısını al veya 0'dan başla
    const currentAttempts = this.reconnectAttempts.get(connection.uuid) || 0;
    
    // Maksimum deneme sayısını aşmadıysa yeniden dene
    if (currentAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(connection.uuid, currentAttempts + 1);
      this.logger.log(`Attempting to reconnect to ${connection.name} (${connection.host}:${connection.port}), attempt ${currentAttempts + 1}/${this.maxReconnectAttempts}`);
      
      // Kısa bir bekleme süresi ekle (üstel geri çekilme stratejisi)
      const delay = Math.min(1000 * Math.pow(2, currentAttempts), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await docker.ping();
        this.logger.log(`Successfully reconnected to ${connection.name} (${connection.host}:${connection.port})`);
        this.reconnectAttempts.delete(connection.uuid);
        return { isConnected: true };
      } catch (error) {
        // Yeniden bağlanma başarısız oldu, tekrar dene veya hata döndür
        if (currentAttempts + 1 >= this.maxReconnectAttempts) {
          this.logger.error(`Failed to reconnect to ${connection.name} after ${this.maxReconnectAttempts} attempts`);
          this.reconnectAttempts.delete(connection.uuid);
          return {
            isConnected: false,
            error: `Docker connection failed after ${this.maxReconnectAttempts} reconnect attempts: ${originalError.message}`,
          };
        }
        
        // Bir sonraki yeniden bağlanma denemesi için checkConnection'ı tekrar çağır
        return this.checkConnection(connection);
      }
    }
    
    // Maksimum deneme sayısı aşıldı
    return {
      isConnected: false,
      error: `Docker connection failed after ${this.maxReconnectAttempts} reconnect attempts: ${originalError.message}`,
    };
  }
}
