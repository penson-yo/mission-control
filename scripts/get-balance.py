#!/usr/bin/env python3
import sys
import json
import requests

def get_balance(address):
    response = requests.post(
        "https://api.hyperliquid.xyz/info",
        json={"type": "portfolio", "user": address},
        headers={"Content-Type": "application/json"}
    )
    data = response.json()
    
    all_time = None
    for item in data:
        if item[0] == "allTime":
            all_time = item
            break
    
    if not all_time:
        return 0.0
    
    history = all_time[1].get("accountValueHistory", [])
    if not history:
        return 0.0
    
    return float(history[-1][1])

if __name__ == "__main__":
    address = sys.argv[1]
    balance = get_balance(address)
    print(json.dumps({"balance": balance}))
