import pandas as pd
import json
import numpy as np

def get_kpis():
    xls = pd.ExcelFile('Updated_Logistics_Dataset_Realistic_Expanded.xlsx')
    
    kpis = {}
    shipments_sample = []
    
    # --- 1. SHIPMENT DATA ---
    if 'Shipment' in xls.sheet_names:
        df_ship = pd.read_excel(xls, 'Shipment')
        
        # Take a sample of shipments for the UI to suggest
        # We take ones with high delay to make RCA more interesting
        sample_df = df_ship.sort_values(by='delay_minutes', ascending=False).head(10)
        shipments_sample = sample_df.to_dict(orient='records')
        
        # Convert dates to strings for JSON
        for s in shipments_sample:
            for k, v in s.items():
                if isinstance(v, pd.Timestamp):
                    s[k] = v.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(v, float) and np.isnan(v):
                    s[k] = None

        if 'actual_arrival_time' in df_ship.columns and 'planned_arrival_time' in df_ship.columns:
            df_ship['actual_arrival_time'] = pd.to_datetime(df_ship['actual_arrival_time'])
            df_ship['planned_arrival_time'] = pd.to_datetime(df_ship['planned_arrival_time'])
            on_time = (df_ship['actual_arrival_time'] <= df_ship['planned_arrival_time']).mean() * 100
            kpis['sla'] = round(on_time, 1)
        
        if 'delay_minutes' in df_ship.columns:
            kpis['delay'] = round(df_ship['delay_minutes'].mean(), 1)
        kpis['total_shipments'] = len(df_ship)

    # --- 2. SLOT CAPACITY ---
    if 'Slot' in xls.sheet_names:
        df_slot = pd.read_excel(xls, 'Slot')
        if 'is_occupied' in df_slot.columns:
            occ_rate = df_slot['is_occupied'].astype(int).mean() * 100
            kpis['util'] = round(occ_rate, 1)

    # --- 3. WAREHOUSE PRODUCTIVITY ---
    if 'Warehouse' in xls.sheet_names:
        df_wh = pd.read_excel(xls, 'Warehouse')
        if 'warehouse_congestion_score' in df_wh.columns:
            avg_congestion = df_wh['warehouse_congestion_score'].mean()
            kpis['unprod_actual'] = round(avg_congestion * 100, 1)
            kpis['prod_actual'] = round(100 - kpis['unprod_actual'], 1)

    # --- 4. COST VARIANCE ---
    if 'Order' in xls.sheet_names:
        df_order = pd.read_excel(xls, 'Order')
        if 'price' in df_order.columns:
            q1_price = df_order['price'].quantile(0.25)
            variance = ((df_order['price'].mean() - q1_price) / q1_price) * 10
            kpis['cost_var'] = round(max(1.2, min(8.5, variance)), 1)

    return kpis, shipments_sample

if __name__ == "__main__":
    try:
        kpis, shipments = get_kpis()
        data = {
            'kpis': kpis, 
            'shipments': shipments,
            'trend': []
        }
        with open('dashboard_data.json', 'w') as f: json.dump(data, f, indent=2)
        print("Data processed with shipment samples.")
    except Exception as e:
        print(f"Error: {e}")
