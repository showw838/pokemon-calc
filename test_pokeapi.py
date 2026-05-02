import urllib.request
import json

def test_pokeapi():
    url = "https://pokeapi.co/api/v2/pokemon-species/1/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        ja_name = next(n['name'] for n in data['names'] if n['language']['name'] == 'ja')
        print(f"ID 1: {ja_name}")
    except Exception as e:
        print(f"Error: {e}")

test_pokeapi()
