export interface PC {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  quality: "FHD" | "2K" | "4K";
  thumbnail: string;
  gallery: GalleryImage[];
  videoUrl?: string;
  specs: Spec[];
  configOptions: ConfigOptions;
  featured?: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface ConfigOptions {
  ram: ConfigOption[];
  ssd: ConfigOption[];
}

export interface ConfigOption {
  id: string;
  label: string;
  priceDelta: number; // positive or negative price change
  default?: boolean;
}

export interface PCListResponse {
  pcs: PC[];
  total: number;
}

export interface PCDetailResponse {
  pc: PC;
}
