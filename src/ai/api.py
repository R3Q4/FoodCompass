import requests

url = "https://besttime.app/api/v1/forecasts"

params = {
    'api_key_private': 'pri_fd4b86700d5e49a2b7d337f1cf5bfadd',
    "venue_name": "Singapore Oceanarium",
    "venue_address": "24 Sentosa Gateway Sentosa Island Singapore 098137"
}

response = requests.request("POST", url, params=params)
data=response.json()
# Check if forecast data exists
if "analysis" not in data or len(data["analysis"]) == 0:
    raise ValueError("No forecast analysis found. Venue may not have hourly data.")

# Pick a day (0=Monday, 6=Sunday) — example: Wednesday
day_index = 2  # Wednesday (0=Monday)
day_data = data["analysis"][day_index]

# Define non-sleeping hours (6AM to 10PM)
hours_of_interest = list(range(6, 22))

# Extract hourly flow and ignore closed hours (assuming 0 or 999 means closed)
day_raw = day_data["day_raw"]
flow_values = [
    day_raw[h] if day_raw[h] != 0 and day_raw[h] != 999 else 0
    for h in hours_of_interest
]

# Compute average flow (ignore zero values if you want only open hours)
open_hours_flow = [v for v in flow_values if v > 0]
average_flow = sum(open_hours_flow) / len(open_hours_flow) if open_hours_flow else 0

# Identify peak and quiet hours
max_flow = max(flow_values)
min_flow = min(flow_values)

peak_hours = [hours_of_interest[i] for i, v in enumerate(flow_values) if v == max_flow]
quiet_hours = [hours_of_interest[i] for i, v in enumerate(flow_values) if v == min_flow]

# Convert 24-hour format to readable AM/PM
def hour_to_str(hour):
    suffix = "AM" if hour < 12 else "PM"
    hour_fmt = hour if 1 <= hour <= 12 else hour - 12 if hour > 12 else 12
    return f"{hour_fmt}{suffix}"

peak_hours_str = [hour_to_str(h) for h in peak_hours]
quiet_hours_str = [hour_to_str(h) for h in quiet_hours]

# Get surge hours if available
surge = day_data.get("surge_hours", {})
surge_come = hour_to_str(surge.get("most_people_come", None)) if surge.get("most_people_come") is not None else "N/A"
surge_leave = hour_to_str(surge.get("most_people_leave", None)) if surge.get("most_people_leave") is not None else "N/A"

# Print results
print(f"Average flow (6AM-10PM): {average_flow:.2f}")
print(f"Peak hour(s): {peak_hours_str} with flow {max_flow}")
print(f"Quiet hour(s): {quiet_hours_str} with flow {min_flow}")
print(f"Surge arrival hour: {surge_come}")
print(f"Surge departure hour: {surge_leave}")
