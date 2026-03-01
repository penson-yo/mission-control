#!/usr/bin/env python3
import sys
import json
from hyperliquid.exchange import Exchange
from hyperliquid.utils import constants
import eth_account

def withdraw(private_key, source, amount):
    account = eth_account.Account.from_key(private_key)
    exchange = Exchange(account, constants.MAINNET_API_URL)
    
    # Transfer from agent back to Pepper (reverse direction)
    result = exchange.send_asset(
        destination=source,
        source_dex="spot",
        destination_dex="spot",
        token="USDC",
        amount=float(amount)
    )
    return result

if __name__ == "__main__":
    data = json.loads(sys.argv[1])
    result = withdraw(data["private_key"], data["source"], data["amount"])
    print(json.dumps(result))
