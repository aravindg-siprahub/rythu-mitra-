import difflib

def fuzzy_match_crop(input_name, crop_database):
    """
    Finds the closest matching crop name from the database.
    """
    if not input_name:
        return None
        
    matches = difflib.get_close_matches(input_name, crop_database, n=1, cutoff=0.6)
    return matches[0] if matches else input_name # Return corrected or original

def sanitize_sensor_data(data):
    """
    Cleans and validates bulk sensor data.
    """
    cleaned = []
    for entry in data:
        # Simple validation: checks ranges
        try:
            if 0 <= entry.get('ph', 7) <= 14 and 0 <= entry.get('humidity', 50) <= 100:
                cleaned.append(entry)
        except Exception:
            continue
    return cleaned
