import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key = Buffer.from(process.env.ENCRYPTION_KEY || 'a-very-secret-key-of-at-least-32-chars', 'utf8').slice(0, 32);
    private readonly iv = crypto.randomBytes(16);

    encrypt(text: string): { encryptedData: string; iv: string } {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            encryptedData: encrypted,
            iv: this.iv.toString('hex'),
        };
    }

    decrypt(encryptedData: string, iv: string): string {

        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(iv, 'hex'),
        );
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');

        console.log(decrypted, "decrypted")

        decrypted += decipher.final('utf8');
        return decrypted;
    }
} 