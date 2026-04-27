import csv
from datetime import datetime, date
import io

def data_extractor(file, account_type):
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
        transaction_date = datetime.strptime(record['Transaction Date'], "%Y%m%d").date()
        transaction_amount = float(record['Transaction Amount'])
        transaction_notes = str(record['Description'])
        transaction_type = (
            'income' if account_type != 'credit' and transaction_amount > 0 
            else 'expense')
        transaction_data.append({f'{transaction_type}_date':transaction_date,
                                f'{transaction_type}_amount': transaction_amount,
                                f'{transaction_type}_notes': transaction_notes.strip()})
    return transaction_data

