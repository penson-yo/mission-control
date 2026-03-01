#!/usr/bin/env python3
import sys
import json
from hyperliquid.exchange import Exchange
from hyperliquid.utils import constants
import eth_account

def transfer(private_key, destination, amount):
    account = eth_account.Account.from_key(private_key)
    exchange = Exchange(account, constants.MAINNET_API_URL)
    
    result = exchange.send_asset(
        destination=destination,
        source_dex="spot",
        destination_dex="spot",
        token="USDC",
        amount=float(amount)
    )
    return result

if __name__ == "__main__":
    data = json.loads(sys.argv[1])
    result = transfer(data["private_key"], data["destination"], data["amount"])
    print(json.dumps(result))
