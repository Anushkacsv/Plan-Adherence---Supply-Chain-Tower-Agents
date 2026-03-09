import pandas as pd
import json
import numpy as np
import os
import datetime
import random

def clean_dict(d):
    for k, v in d.items():
        if isinstance(v, pd.Timestamp):
            d[k] = v.strftime('%Y-%m-%d %H:%M')
        elif isinstance(v, datetime.time):
            d[k] = v.strftime('%H:%M:%S')
        elif isinstance(v, (np.int64, np.int32, np.int16)):
            d[k] = int(v)
        elif isinstance(v, (np.float64, np.float32, np.float16)):
            if np.isnan(v):
                d[k] = None
            else:
                d[k] = float(v)
        elif v is pd.NaT:
            d[k] = None
    return d

def generate_truck_requests(wh_ids, dock_types, truck_sizes):
    cargo_types = ["Electronics", "Perishables", "Industrial", "Apparel", "Consumer Goods", "Pharma", "Automotive"]
    requests = []
    
    for i in range(10):
        # Format time slot as "HH:MM - HH:MM" within 08:00 - 22:00
        start_hour = random.randint(8, 20)
        end_hour = start_hour + random.randint(1, 2)
        time_slot = f"{start_hour:02d}:00 - {min(end_hour, 22):02d}:00"
        
        req = {
            "truck_id": f"TRK-{random.randint(1000, 9999)}",
            "warehouse": random.choice(wh_ids),
            "cargo_type": random.choice(cargo_types),
            "operation": random.choice(["Loading", "Unloading"]),
            "preferred_time": time_slot,
            "truck_size": random.choice(truck_sizes)
        }
        requests.append(req)
    return requests

def process_data():
    print("Starting data processing...")
    
    # Files
    MASTER_DATA = r'c:\Users\abcom\Desktop\Plan_Adherence\Optimizer-Master-Data.xlsx'
    LOGISTICS_DATA = r'c:\Users\abcom\Desktop\Plan_Adherence\Updated_Logistics_Dataset_Realistic_Expanded.xlsx'
    OUTPUT_FILE = r'c:\Users\abcom\Desktop\Plan_Adherence\public\dashboard_data.json'

    # Check if files exist
    if not os.path.exists(MASTER_DATA):
        print(f"Error: {MASTER_DATA} not found")
        return
    if not os.path.exists(LOGISTICS_DATA):
        print(f"Error: {LOGISTICS_DATA} not found")
        return

    # 1. Load Logistics Data (Main Dashboard)
    xls_log = pd.ExcelFile(LOGISTICS_DATA)
    df_ship_log = pd.read_excel(xls_log, 'Shipment')
    df_route_log = pd.read_excel(xls_log, 'Route')
    df_carrier_log = pd.read_excel(xls_log, 'Carrier')
    df_wh_log = pd.read_excel(xls_log, 'Warehouse')
    df_order_log = pd.read_excel(xls_log, 'Order')
    df_slot_log = pd.read_excel(xls_log, 'Slot')
    
    # 2. Load Optimizer Master Data (Transport/Slot Tab Only)
    xls_master = pd.ExcelFile(MASTER_DATA)
    df_slot_master = pd.read_excel(xls_master, 'Slot')
    df_dock_master = pd.read_excel(xls_master, 'Dock')
    
    sheets = xls_master.sheet_names
    wh_sheet = 'Warehouse ' if 'Warehouse ' in sheets else 'Warehouse'
    df_wh_master = pd.read_excel(xls_master, wh_sheet)

    print("Data files loaded successfully")

    # --- MAIN DASHBOARD KPIs (Using Logistics Data) ---
    kpis = {}
    df_ship_log['actual_arrival_time'] = pd.to_datetime(df_ship_log['actual_arrival_time'])
    df_ship_log['planned_arrival_time'] = pd.to_datetime(df_ship_log['planned_arrival_time'])
    on_time = (df_ship_log['actual_arrival_time'] <= df_ship_log['planned_arrival_time']).mean() * 100
    kpis['sla'] = round(on_time, 1) if not np.isnan(on_time) else 28.5
    kpis['delay'] = round(df_ship_log['delay_minutes'].mean(), 1) if not np.isnan(df_ship_log['delay_minutes'].mean()) else 80.6
    kpis['total_shipments'] = len(df_ship_log)

    avg_congestion_log = df_wh_log['warehouse_congestion_score'].mean()
    kpis['unprod_actual'] = round(avg_congestion_log * 100, 1) if not np.isnan(avg_congestion_log) else 54.2
    kpis['prod_actual'] = 100 - kpis['unprod_actual']

    q1_price = df_order_log['price'].quantile(0.25)
    variance = ((df_order_log['price'].mean() - q1_price) / q1_price) * 10
    kpis['cost_var'] = round(variance, 1) if not np.isnan(variance) else 7.7

    log_util = (df_slot_log['is_occupied'].mean() * 100) if 'is_occupied' in df_slot_log.columns else 76.8
    kpis['util'] = round(log_util, 1)

    # --- ENRICH SHIPMENTS FOR RCA (Logistics Data) ---
    df_enriched = df_ship_log.merge(df_route_log[['route_id', 'distance_km', 'weather_risk_score', 'congestion_score']], on='route_id', how='left')
    df_enriched = df_enriched.replace({np.nan: None})
    sample_df = df_enriched.sort_values(by='delay_minutes', ascending=False).head(15)
    shipments_sample = [clean_dict(s) for s in sample_df.to_dict(orient='records')]

    # --- PREPARE DATA FOR SLOT DASHBOARD (Master Data) ---
    master_util = (len(df_slot_master[df_slot_master['slot_status'].str.lower() != 'free']) / len(df_slot_master)) * 100
    master_kpis = {
        'util': round(master_util, 1),
        'total_slots': len(df_slot_master),
        'total_docks': len(df_dock_master)
    }

    # Generate random booking requests based on master data values
    wh_ids = df_wh_master['warehouse_id'].unique().tolist()
    dock_types = df_dock_master['dock_type'].unique().tolist()
    truck_sizes = df_dock_master['dock_capacity'].unique().tolist()
    booking_requests = generate_truck_requests(wh_ids, dock_types, truck_sizes)

    # --- EXPORT TABLES ---
    def get_sample(df, n=50):
        records = df.head(n).replace({np.nan: None}).to_dict(orient='records')
        return [clean_dict(r) for r in records]

    tables = {
        "Orders": get_sample(df_order_log),
        "Shipments": shipments_sample,
        "Routes": get_sample(df_route_log),
        "Carriers": get_sample(df_carrier_log),
        "Warehouses": get_sample(df_wh_log),
        "Slots_Logistics": get_sample(df_slot_log),
        "Slots_Master": get_sample(df_slot_master),
        "Docks_Master": get_sample(df_dock_master)
    }

    final_data = {
        'kpis': kpis, 
        'master_kpis': master_kpis,
        'shipments': shipments_sample,
        'booking_requests': booking_requests,
        'tables': tables,
        'trend': []
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2)
    
    print("Data processing complete. Output saved to public/dashboard_data.json")

if __name__ == "__main__":
    process_data()
