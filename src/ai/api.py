import requests

url = "https://besttime.app/api/v1/keys/pri_a00de9e302662c0217a9cf08ab304122"

response = requests.request("GET", url)

print(response.json())
