export interface DailyKPI {
  date: string;
  throughputDL: number; // Mbps
  throughputUL: number; // Mbps
  latency: number; // ms
  // videoBuffering: number; // %
  rsrp: number; // dBm
  sinr: number; // dB
  prbUtilization: number; // %
  trafficVolume: number; // TB
  setupSuccessRate: number; // %
  dropRate: number; // %
  activeUsers: number;
}

export interface UserSession {
  id: string;
  imsi: string;
  timestamp: string;
  duration: number; // seconds
  rat: '4G' | '5G' | 'Wi-Fi';
  service: 'Video' | 'VoIP' | 'Web' | 'Gaming';
  qoeScore: number; // 1-5
  status: 'Normal' | 'Degraded' | 'Failure';
  failureReason?: string;
  location: string;
}

export interface GeoKPI {
  id: string;
  lat: number;
  lng: number;
  value: number; // RSRP or other KPI
  imsi?: string;
  cellId?: string;
}

export interface RcaData {
  category: string;
  value: number;
  color: string;
}

export interface WeightConfig {
  throughput: number;
  latency: number;
  reliability: number; // Drop Rate & Setup Success
  congestion: number; // PRB
  signal: number; // RSRP/SINR
}

export type ViewState = 'dashboard' | 'rca' | 'users' | 'map' | 'settings';

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}