interface ServiceConfig {
  image?: string;
  ports?: string[];
  environment?: Record<string, string> | string[];
  volumes?: string[];
  restart?: string;
  depends_on?: string[];
}

export interface ComposeConfig {
  version: string;
  services: Record<string, ServiceConfig>;
} 