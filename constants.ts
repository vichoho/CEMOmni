import { DailyKPI, UserSession, RcaData, ChartDataPoint, WeightConfig, GeoKPI } from './types';

export const KPIS = {
  QOE: ['Throughput', 'Latency', 'Jitter', 'Video Start Time'],
  RADIO: ['RSRP', 'RSRQ', 'SINR', 'CQI'],
  CONGESTION: ['PRB Utilization', 'CCE Utilization'],
  TRAFFIC: ['Payload DL', 'Payload UL'],
  INTEGRITY: ['Drop Rate', 'Setup Success Rate'],
};

export const DEFAULT_WEIGHTS: WeightConfig = {
  throughput: 30,
  latency: 20,
  reliability: 25,
  congestion: 15,
  signal: 10,
};

// Normalization Helpers
export const normalize = (val: number, min: number, max: number, inverse = false) => {
  let normalized = (val - min) / (max - min);
  if (inverse) normalized = 1 - normalized;
  return Math.max(0, Math.min(100, normalized * 100));
};

export const calculateQoEScore = (data: DailyKPI, weights: WeightConfig) => {
  // 1. Throughput: 0 to 100 Mbps target
  const sThroughput = normalize(data.throughputDL, 0, 100);
  
  // 2. Latency: 0 to 100 ms (lower is better)
  const sLatency = normalize(data.latency, 0, 100, true);
  
  // 3. Reliability: Drop Rate 0% to 2% (lower is better)
  const sDrop = normalize(data.dropRate, 0, 2, true);
  
  // 4. Congestion: PRB 0% to 100% (lower is better)
  const sCongestion = normalize(data.prbUtilization, 0, 100, true);
  
  // 5. Signal: RSRP -120 to -70 dBm (higher is better)
  const sSignal = normalize(data.rsrp, -120, -70);

  const total = 
    (sThroughput * weights.throughput) +
    (sLatency * weights.latency) +
    (sDrop * weights.reliability) +
    (sCongestion * weights.congestion) +
    (sSignal * weights.signal);
    
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  
  return Math.round(total / (weightSum || 1));
};

// --- Mock Data Generators ---

const getLast7Days = (startDateStr?: string) => {
  const dates = [];
  // If startDate is provided, start from there. Otherwise, end today (past 7 days).
  const end = startDateStr ? new Date(startDateStr) : new Date();
  
  // If startDate provided, we want [start, start+1, ... start+6]
  // If not provided, we want [today-6, ... today]
  let current = new Date(end);
  
  if (!startDateStr) {
    current.setDate(current.getDate() - 6);
  }

  for (let i = 0; i < 7; i++) {
    const d = new Date(current);
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Generate Global Network Data
export const MOCK_DAILY_DATA: DailyKPI[] = getLast7Days().map((date, i) => ({
  date,
  throughputDL: Math.round(45 + Math.random() * 15),
  throughputUL: Math.round(8 + Math.random() * 4),
  latency: Math.round(25 + Math.random() * 10),
  videoBuffering: Math.round(Math.random() * 0.5 * 100) / 100,
  rsrp: Math.round(-95 + Math.random() * 15),
  sinr: Math.round(12 + Math.random() * 8),
  prbUtilization: Math.round(60 + Math.random() * 20),
  trafficVolume: Math.round(800 + Math.random() * 200),
  setupSuccessRate: Math.round(98 + Math.random() * 1.5),
  dropRate: Math.round(Math.random() * 0.8 * 100) / 100,
  activeUsers: Math.round(12000 + Math.random() * 3000),
}));

// Generate Specific Subscriber Data
export const generateMockSubscriberData = (imsi: string, startDate?: string): DailyKPI[] => {
  // Use IMSI to seed the randomness so it feels consistent for the same user
  const seed = imsi.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  return getLast7Days(startDate).map((date, i) => {
    const isGoodUser = seed % 2 === 0; // Simple segmentation
    return {
      date,
      throughputDL: Math.round((isGoodUser ? 60 : 20) + pseudoRandom(i) * 20),
      throughputUL: Math.round((isGoodUser ? 15 : 2) + pseudoRandom(i + 100) * 5),
      latency: Math.round((isGoodUser ? 20 : 50) + pseudoRandom(i + 200) * 20),
      videoBuffering: Math.round(pseudoRandom(i + 300) * 100) / 100,
      rsrp: Math.round((isGoodUser ? -80 : -105) + pseudoRandom(i + 400) * 10),
      sinr: Math.round((isGoodUser ? 20 : 5) + pseudoRandom(i + 500) * 10),
      prbUtilization: Math.round(40 + pseudoRandom(i + 600) * 40), // User PRB usage (conceptually different but reusing field for view)
      trafficVolume: Math.round(0.5 + pseudoRandom(i + 700) * 2), // GB for user
      setupSuccessRate: Math.round(95 + pseudoRandom(i + 800) * 5),
      dropRate: Math.round(pseudoRandom(i + 900) * 2 * 100) / 100,
      activeUsers: 1, // Single user
    };
  });
};

export const MOCK_SESSIONS: UserSession[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `sess-${Math.random().toString(36).substr(2, 9)}`,
  imsi: `46000${Math.floor(Math.random() * 10000000000)}`,
  timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  duration: Math.floor(Math.random() * 3600),
  rat: Math.random() > 0.3 ? '5G' : '4G',
  service: ['Video', 'VoIP', 'Web', 'Gaming'][Math.floor(Math.random() * 4)] as any,
  qoeScore: Math.floor(Math.random() * 3) + 3,
  status: Math.random() > 0.8 ? 'Degraded' : Math.random() > 0.95 ? 'Failure' : 'Normal',
  failureReason: Math.random() > 0.9 ? 'Radio Link Failure' : undefined,
  location: ['Downtown', 'Suburb A', 'Highway 5', 'Mall', 'Stadium'][Math.floor(Math.random() * 5)]
}));

// Mock Data for Map (Coverage Heatmap)
// Center around a generic city location (e.g., Taipei 101 approx)
const CENTER_LAT = 25.033964;
const CENTER_LNG = 121.564468;

export const generateMockGeoData = (count = 100): GeoKPI[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Random distribution around center ~5km radius
    const lat = CENTER_LAT + (Math.random() - 0.5) * 0.05;
    const lng = CENTER_LNG + (Math.random() - 0.5) * 0.05;
    
    // Simulate RSRP distribution (Bad signal at edges, good at center usually, but randomized)
    // Distance factor
    const dist = Math.sqrt(Math.pow(lat - CENTER_LAT, 2) + Math.pow(lng - CENTER_LNG, 2));
    const baseRsrp = -80 - (dist * 500); // Further away = worse signal
    const noise = (Math.random() * 20) - 10;
    
    return {
      id: `geo-${i}`,
      lat,
      lng,
      value: Math.round(Math.max(-130, Math.min(-60, baseRsrp + noise))), // Clamp between -130 and -60
      cellId: `CELL_${Math.floor(Math.random() * 100)}`,
    };
  });
};

// RCA Mock Data
export const RCA_DISTRIBUTION: RcaData[] = [
  { category: 'Weak Coverage', value: 45, color: '#f59e0b' }, // Amber
  { category: 'Congestion', value: 30, color: '#ef4444' },    // Red
  { category: 'Core Network', value: 10, color: '#8b5cf6' },  // Violet
  { category: 'Transport', value: 10, color: '#3b82f6' },     // Blue
  { category: 'User Device', value: 5, color: '#10b981' },    // Emerald
];

export const CHART_DATA_1_TREND = [
  { name: 'Mon', failures: 120 }, { name: 'Tue', failures: 132 },
  { name: 'Wed', failures: 101 }, { name: 'Thu', failures: 154 },
  { name: 'Fri', failures: 90 }, { name: 'Sat', failures: 230 },
  { name: 'Sun', failures: 210 },
];

export const CHART_DATA_2_CELLS = [
  { name: 'Cell_A1', value: 85 }, { name: 'Cell_B2', value: 78 },
  { name: 'Cell_C3', value: 72 }, { name: 'Cell_D4', value: 65 },
  { name: 'Cell_E5', value: 50 },
];

export const CHART_DATA_3_HO = [
  { name: 'Too Late', value: 400 },
  { name: 'Too Early', value: 300 },
  { name: 'Wrong Cell', value: 200 },
  { name: 'Ping Pong', value: 150 },
];

export const CHART_DATA_4_VOLTE = [
  { name: 'Jitter', value: 40 },
  { name: 'Packet Loss', value: 35 },
  { name: 'High Latency', value: 25 },
];