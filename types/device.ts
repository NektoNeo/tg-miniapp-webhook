export interface Device {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  category: DeviceCategory;
  thumbnail: string;
  featured?: boolean;
}

export type DeviceCategory =
  | "monitor"
  | "keyboard"
  | "mouse"
  | "headset"
  | "chair"
  | "other";

export interface DeviceListResponse {
  devices: Device[];
  categories: {
    id: DeviceCategory;
    label: string;
    count: number;
  }[];
  total: number;
}
