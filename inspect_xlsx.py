import pandas as pd
import json
import datetime

def default_json(obj):
    if isinstance(obj, (datetime.date, datetime.datetime, pd.Timestamp)):
        return obj.isoformat()
    if isinstance(obj, datetime.time):
        return obj.strftime('%H:%M:%S')
    return str(obj)

def inspect_master_data():
    file_path = r'c:\Users\abcom\Desktop\Plan_Adherence\Optimizer-Master-Data.xlsx'
    xls = pd.ExcelFile(file_path)
    
    data_summary = {}
    for sheet in xls.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet)
        data_summary[sheet] = {
            "columns": df.columns.tolist(),
            "sample_values": {col: [default_json(x) for x in df[col].dropna().unique().tolist()[:10]] for col in df.columns}
        }
    
    with open(r'c:\Users\abcom\Desktop\Plan_Adherence\master_data_summary.json', 'w') as f:
        json.dump(data_summary, f, indent=2)
    print("Summary saved to master_data_summary.json")

if __name__ == "__main__":
    inspect_master_data()
