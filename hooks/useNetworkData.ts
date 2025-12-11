import { useState, useEffect } from 'react';
import { DailyKPI, UserSession, GeoKPI } from '../types';
import { MOCK_DAILY_DATA, MOCK_SESSIONS, generateMockSubscriberData, generateMockGeoData } from '../constants';
import { fetchDailyKPIs, fetchUserSessions, fetchSubscriberKPIs, fetchGeoData } from '../services/clickhouse';

// Toggle this to true to attempt real database connections
const USE_LIVE_DATA = false;

export const useNetworkData = (imsi?: string, startDate?: string) => {
  const [dailyData, setDailyData] = useState<DailyKPI[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [geoData, setGeoData] = useState<GeoKPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      // --- LIVE DATA MODE ---
      if (USE_LIVE_DATA) {
        try {
          if (imsi) {
             // Fetch specific subscriber data
             const [kpiData, geo] = await Promise.all([
               fetchSubscriberKPIs(imsi, startDate),
               fetchGeoData(imsi)
             ]);
             setDailyData(kpiData);
             setSessions(MOCK_SESSIONS.filter(s => s.imsi === imsi));
             setGeoData(geo);
          } else {
             // Fetch aggregate network data
             const [kpiData, sessionData, geo] = await Promise.all([
               fetchDailyKPIs(),
               fetchUserSessions(),
               fetchGeoData()
             ]);
             setDailyData(kpiData);
             setSessions(sessionData);
             setGeoData(geo);
          }
        } catch (err) {
          console.error("Failed to load live data, falling back to mock:", err);
          setError("Failed to connect to ClickHouse. Showing cached data.");
          // Fallback logic
          if (imsi) {
            setDailyData(generateMockSubscriberData(imsi, startDate));
          } else {
            setDailyData(MOCK_DAILY_DATA);
          }
          setSessions(MOCK_SESSIONS);
          setGeoData(generateMockGeoData(150));
        }
      } 
      
      // --- MOCK DATA MODE ---
      else {
        // Simulate network delay for realistic feel
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (imsi) {
          // Generate deterministic mock data for this user
          setDailyData(generateMockSubscriberData(imsi, startDate));
        } else {
          setDailyData(MOCK_DAILY_DATA);
        }
        setSessions(MOCK_SESSIONS);
        setGeoData(generateMockGeoData(150));
      }
      
      setLoading(false);
    };

    loadData();
  }, [imsi, startDate]); // Reload when filters change

  return { dailyData, sessions, geoData, loading, error };
};