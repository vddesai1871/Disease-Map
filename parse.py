import pandas as pd
import sqlite3

filename = "Book2"
con = sqlite3.connect(filename+".db")

wb = pd.read_excel(filename+".xlsx", sheet_name=None)
for sheet in wb:
    wb[sheet].to_sql(sheet, con, index=False)
con.commit()
con.close()
