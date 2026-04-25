from fuzzywuzzy import fuzz

def get_or_create_group(grouped, key):
    for existing_key in grouped:
        if fuzz.ratio(existing_key, key) >= 60:
            return existing_key
    return key