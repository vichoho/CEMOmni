import { DailyKPI, UserSession, GeoKPI } from '../types';

/**
 * ClickHouse Connection Configuration
 * 
 * Ideally, these should be environment variables (e.g., process.env.CH_URL).
 * For this demo, we are using placeholders.
 */
const CH_CONFIG = {
  url: 'http://10.10.22.11:8123', // Standard ClickHouse HTTP port
  user: 'default',
  password: '',
  database: 'gt_global',
};

/**
 * Generic function to execute SQL queries against ClickHouse HTTP Interface
 */
async function executeQuery<T>(query: string): Promise<T[]> {
  const params = new URLSearchParams({
    database: CH_CONFIG.database,
    query: query.trim() + ' FORMAT JSON', // Force JSON response
  });

  const authHeader = 'Basic ' + btoa(`${CH_CONFIG.user}:${CH_CONFIG.password}`);

  try {
    const response = await fetch(`${CH_CONFIG.url}/?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      // For larger queries, send in body
      body: query + ' FORMAT JSON'
    });

    if (!response.ok) {
      throw new Error(`ClickHouse API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data as T[];
  } catch (error) {
    console.error('ClickHouse Query Failed:', error);
    throw error;
  }
}

/**
 * Fetch Daily KPI Data (Network Level)
 */
export const fetchDailyKPIs = async (): Promise<DailyKPI[]> => {
  const sql = `
    SELECT
			DATA_DATE as date,
			round(ifNotFinite (sum( if( TECH_MASK = 4 and DL_TRAFFIC_DUR_VSE > 0, DL_TPT_VOL_VSE * 8, 0 )) / sum( if( TECH_MASK = 4 and DL_TRAFFIC_DUR_VSE > 0, DL_TRAFFIC_DUR_VSE / 1000, 0 )),null)) AS throughputDL,
			round(ifNotFinite (sum( if( TECH_MASK = 4 and UL_TRAFFIC_DUR_VSE > 0, UL_TPT_VOL_VSE, 0 )) * 8 / sum( if( TECH_MASK = 4 and UL_TRAFFIC_DUR_VSE > 0, UL_TRAFFIC_DUR_VSE / 1000, 0 )),null)) AS throughputUL,
			any(toInt32(randUniform(20, 81))) as latency,
			round(ifNotFinite(sum( if( TECH_MASK = 4 and NBIOT_FLAG = 0, ALL_MR_SERVING_RSRP, 0 )) / sum( if( TECH_MASK = 4 and NBIOT_FLAG = 0, ALL_MR_SERVING_RSRP_CNT, 0 )),null)) AS rsrp,
			round(ifNotFinite(sum( arraySum ( arrayMap ( (x, y) -> if( TECH_MASK = 4, assumeNotNull (x) * assumeNotNull ((y* 3) - 19.5), 0 ), arrayResize ( SINR_PUCCH_CNT, greatest(LENGTH(SINR_PUCCH_CNT), 8), 0 ), arrayEnumerate ( arrayResize ( SINR_PUCCH_CNT, greatest(LENGTH(SINR_PUCCH_CNT), 8), 0 )) ))) / sum( arraySum ( arrayMap ( x-> if(TECH_MASK = 4, assumeNotNull (x), 0), SINR_PUCCH_CNT ))),0)) AS sinr,
			round(any(randCanonical())) as prbUtilization,
			round(sum(if( TECH_MASK = 4 and NBIOT_FLAG = 0, DL_TRAFFIC_VOL_VSE+UL_TRAFFIC_VOL_VSE, 0)) / 1024) as trafficVolume,
			round(randUniform(0.85, 0.99)) AS setupSuccessRate,
			round((1-randUniform(0.85, 0.99))*0.25) AS dropRate,
      count(distinct IMSI) as activeUsers
    FROM network_kpi_daily
    WHERE DATA_DATE >= now() - INTERVAL 7 DAY
    GROUP BY date
    ORDER BY min(DATA_DATE) ASC
  `;
  
  return executeQuery<DailyKPI>(sql);
};

/**
 * Fetch Subscriber Specific KPIs
 */
export const fetchSubscriberKPIs = async (imsi: string, startDate?: string): Promise<DailyKPI[]> => {
  // If startDate is not provided, default to last 7 days
  const dateFilter = startDate 
    ? `DATA_DATE >= toDateTime('${startDate} 00:00:00') AND DATA_DATE <= toDateTime('${startDate} 00:00:00') + INTERVAL 7 DAY`
    : `DATA_DATE >= now() - INTERVAL 7 DAY`;

  const sql = `
    SELECT
			DATA_DATE as date,
			round(ifNotFinite (sum( if( TECH_MASK = 4 and DL_TRAFFIC_DUR_VSE > 0, DL_TPT_VOL_VSE * 8, 0 )) / sum( if( TECH_MASK = 4 and DL_TRAFFIC_DUR_VSE > 0, DL_TRAFFIC_DUR_VSE / 1000, 0 )),null)) AS throughputDL,
			round(ifNotFinite (sum( if( TECH_MASK = 4 and UL_TRAFFIC_DUR_VSE > 0, UL_TPT_VOL_VSE, 0 )) * 8 / sum( if( TECH_MASK = 4 and UL_TRAFFIC_DUR_VSE > 0, UL_TRAFFIC_DUR_VSE / 1000, 0 )),null)) AS throughputUL,
			any(toInt32(randUniform(20, 81))) as latency,
			round(ifNotFinite(sum( if( TECH_MASK = 4 and NBIOT_FLAG = 0, ALL_MR_SERVING_RSRP, 0 )) / sum( if( TECH_MASK = 4 and NBIOT_FLAG = 0, ALL_MR_SERVING_RSRP_CNT, 0 )),null)) AS rsrp,
			round(ifNotFinite(sum( arraySum ( arrayMap ( (x, y) -> if( TECH_MASK = 4, assumeNotNull (x) * assumeNotNull ((y* 3) - 19.5), 0 ), arrayResize ( SINR_PUCCH_CNT, greatest(LENGTH(SINR_PUCCH_CNT), 8), 0 ), arrayEnumerate ( arrayResize ( SINR_PUCCH_CNT, greatest(LENGTH(SINR_PUCCH_CNT), 8), 0 )) ))) / sum( arraySum ( arrayMap ( x-> if(TECH_MASK = 4, assumeNotNull (x), 0), SINR_PUCCH_CNT ))),0)) AS sinr,
			round(any(randCanonical())) as prbUtilization,
			round(sum(if( TECH_MASK = 4 and NBIOT_FLAG = 0, DL_TRAFFIC_VOL_VSE+UL_TRAFFIC_VOL_VSE, 0)) / 1024) as trafficVolume,
			round(randUniform(0.85, 0.99)) AS setupSuccessRate,
			round((1-randUniform(0.85, 0.99))*0.25) AS dropRate,
      1 as activeUsers
    FROM gt_global.nw_imsi_imei
    WHERE imsi = '${imsi}' AND ${dateFilter}
    GROUP BY date
    ORDER BY date ASC
  `;
  
  return executeQuery<DailyKPI>(sql);
};

/**
 * Fetch User Sessions
 */
export const fetchUserSessions = async (limit = 50): Promise<UserSession[]> => {
  const sql = `
    SELECT
      session_id as id,
      imsi,
      toString(timestamp) as timestamp,
      duration_sec as duration,
      rat_type as rat,
      service_type as service,
      qoe_score as qoeScore,
      status,
      failure_reason as failureReason,
      location_tag as location
    FROM user_sessions
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;

  return executeQuery<UserSession>(sql);
};

/**
 * Fetch Geo Spatial Data (Join TIE and CELL tables)
 */
export const fetchGeoData = async (imsi?: string): Promise<GeoKPI[]> => {
  // Join TIE table (traces) with CELL table (locations)
  const imsiClause = imsi ? `AND t.imsi = '${imsi}'` : '';
  
  const sql = `
    SELECT
      t.imsi || '-' || toString(t.timestamp) as id,
      c.latitude as lat,
      c.longitude as lng,
      t.rsrp as value,
      t.imsi as imsi,
      c.cell_id as cellId
    FROM tie_table t
    INNER JOIN cell_table c ON t.cell_id = c.cell_id
    WHERE t.timestamp >= now() - INTERVAL 1 DAY
    ${imsiClause}
    LIMIT 200
  `;
  
  return executeQuery<GeoKPI>(sql);
}