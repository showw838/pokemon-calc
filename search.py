import urllib.request, urllib.parse, re
import sys

query = sys.argv[1]
url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query)
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html)
    for link in links:
        if 'http' in link and 'duckduckgo' not in link:
            print(link)
except Exception as e:
    print(e)
