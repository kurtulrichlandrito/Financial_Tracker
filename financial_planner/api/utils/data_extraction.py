import csv
from datetime import datetime, date
import io

def data_extractor(file):
    """Extracts data from a csv file
    
    Args: 
        file(file): the csv file.
    
    Returns:
        data (list[dict]): extracted data in a form of list of 
        dictionary.
    """
    decoded = file.read().decode('utf-8-sig')
    records = csv.DictReader(io.StringIO(decoded))
    transaction_data = []
    for record in records:
        expense_date = datetime.strptime(record['Transaction Date'], "%Y%m%d").date()
        expense_amount = float(record['Transaction Amount'])
        expense_notes = str(record['Description'])
        transaction_data.append({'expense_date':expense_date,
                                'expense_amount': expense_amount,
                                'expense_notes': expense_notes})
    return transaction_data

