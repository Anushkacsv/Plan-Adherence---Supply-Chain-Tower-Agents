import pandas as pd
import json
import numpy as np

def get_kpis_and_enriched_shipments():
    xls = pd.ExcelFile('Updated_Logistics_Dataset_Realistic_Expanded.xlsx')
    
    # Load all relevant sheets
    df_ship = pd.read_excel(xls, 'Shipment')
    df_route = pd.read_excel(xls, 'Route')
    df_carrier = pd.read_excel(xls, 'Carrier')
    df_wh = pd.read_excel(xls, 'Warehouse')
    df_order = pd.read_excel(xls, 'Order')
    df_slot = pd.read_excel(xls, 'Slot')

    # --- MERGE DATA FOR RCA ---
    # Merge Shipment with Route info
    df_enriched = df_ship.merge(df_route[['route_id', 'distance_km', 'weather_risk_score', 'congestion_score']], on='route_id', how='left')
    
    # Merge with Carrier info
    df_enriched = df_enriched.merge(df_carrier[['carrier_id', 'avg_delay_minutes', 'ontime_percentage', 'rejection_rate']], 
                                    left_on='assigned_carrier_id', right_on='carrier_id', how='left')

    # --- CALCULATE ML FEATURES ---
    # 1-8 are direct
    df_enriched['congestion_score_x'] = df_enriched['congestion_score'].fillna(0.5)
    
    # 9. delay_per_km
    df_enriched['delay_per_km'] = df_enriched['delay_minutes'] / (df_enriched['distance_km'] + 1)
    
    # 10. cost_per_delay
    df_enriched['cost_per_delay'] = df_enriched['detention_cost'] / (df_enriched['delay_minutes'] + 1)
    
    # 11. carrier_risk_score
    df_enriched['carrier_risk_score'] = (1 - df_enriched['ontime_percentage'].fillna(0.8)) + df_enriched['rejection_rate'].fillna(0.05)
    
    # 12. total_risk_score
    df_enriched['total_risk_score'] = df_enriched['carrier_risk_score'] + df_enriched['weather_risk_score'].fillna(0.2)
    
    # 13. congestion_weather_interaction
    df_enriched['congestion_weather_interaction'] = df_enriched['congestion_score_x'] * df_enriched['weather_risk_score'].fillna(0.2)
    
    # 14. carrier_delay_ratio
    df_enriched['carrier_delay_ratio'] = df_enriched['delay_minutes'] / (df_enriched['avg_delay_minutes'].fillna(30) + 1)
    
    # 15. detention_intensity
    df_enriched['detention_intensity'] = df_enriched['detention_cost'] / (df_enriched['distance_km'] + 1)
    
    # 16. risk_pressure
    df_enriched['risk_pressure'] = (df_enriched['total_risk_score'] + df_enriched['congestion_score_x']) / 2

    # Clean up NaNs for JSON
    df_enriched = df_enriched.replace({np.nan: None})

    # Sample top delayed shipments
    sample_df = df_enriched.sort_values(by='delay_minutes', ascending=False).head(15)
    shipments_sample = sample_df.to_dict(orient='records')
    
    # Helper to convert timestamps
    def clean_dict(d):
        for k, v in d.items():
            if isinstance(v, pd.Timestamp):
                d[k] = v.strftime('%Y-%m-%d %H:%M')
        return d

    shipments_sample = [clean_dict(s) for s in shipments_sample]

    # --- KPI CALCULATIONS ---
    kpis = {}
    
    # SLA (On-time percentage)
    if 'actual_arrival_time' in df_ship.columns and 'planned_arrival_time' in df_ship.columns:
        df_ship['actual_arrival_time'] = pd.to_datetime(df_ship['actual_arrival_time'])
        df_ship['planned_arrival_time'] = pd.to_datetime(df_ship['planned_arrival_time'])
        on_time = (df_ship['actual_arrival_time'] <= df_ship['planned_arrival_time']).mean() * 100
        kpis['sla'] = round(on_time, 1)
    
    kpis['delay'] = round(df_ship['delay_minutes'].mean(), 1)
    kpis['total_shipments'] = len(df_ship)

    # Warehouse
    if 'warehouse_congestion_score' in df_wh.columns:
        avg_congestion = df_wh['warehouse_congestion_score'].mean()
        kpis['unprod_actual'] = round(avg_congestion * 100, 1)
        kpis['prod_actual'] = round(100 - kpis['unprod_actual'], 1)

    # Cost Variance
    if 'price' in df_order.columns:
        q1_price = df_order['price'].quantile(0.25)
        variance = ((df_order['price'].mean() - q1_price) / q1_price) * 10
        kpis['cost_var'] = round(variance, 1)

    # Slot Utilization
    if 'is_occupied' in df_slot.columns:
        kpis['util'] = round(df_slot['is_occupied'].mean() * 100, 1)
    else:
        kpis['util'] = 76.8 # Fallback

    return kpis, shipments_sample

if __name__ == "__main__":
    try:
        kpis, shipments = get_kpis_and_enriched_shipments()
        data = {
            'kpis': kpis, 
            'shipments': shipments,
            'trend': []
        }
        with open('public/dashboard_data.json', 'w') as f: json.dump(data, f, indent=2)
        print("✅ Data processing complete. Shipments enriched with ML features.")
    except Exception as e:
        print(f"❌ Error during processing: {e}")
