import urllib.request
import json
import time

POKEMON_MAPPING = [
    ("フシギバナ", "venusaur"), ("リザードン", "charizard"), ("カメックス", "blastoise"),
    ("スピアー", "beedrill"), ("ピジョット", "pidgeot"), ("アーボック", "arbok"),
    ("ピカチュウ", "pikachu"), ("ライチュウ", "raichu"), ("ピクシー", "clefable"),
    ("キュウコン", "ninetales"), ("ウツボット", "victreebel"), ("ゲンガー", "gengar"),
    ("ガルーラ", "kangaskhan"), ("スターミー", "starmie"), ("カイロス", "pinsir"),
    ("ケンタロス", "tauros"), ("ギャラドス", "gyarados"), ("メタモン", "ditto"),
    ("シャワーズ", "vaporeon"), ("サンダース", "jolteon"), ("ブースター", "flareon"),
    ("プテラ", "aerodactyl"), ("カビゴン", "snorlax"), ("カイリュー", "dragonite"),
    ("メガニウム", "meganium"), ("バクフーン", "typhlosion"), ("オーダイル", "feraligatr"),
    ("アリアドス", "ariados"), ("デンリュウ", "ampharos"), ("マリルリ", "azumarill"),
    ("ニョロトノ", "politoed"), ("エーフィ", "espeon"), ("ブラッキー", "umbreon"),
    ("ヤドキング", "slowking"), ("フォレトス", "forretress"), ("ハガネール", "steelix"),
    ("ハッサム", "scizor"), ("ヘラクロス", "heracross"), ("エアームド", "skarmory"),
    ("ヘルガー", "houndoom"), ("バンギラス", "tyranitar"), ("ペリッパー", "pelipper"),
    ("サーナイト", "gardevoir"), ("ヤミラミ", "sableye"), ("ボスゴドラ", "aggron"),
    ("チャーレム", "medicham"), ("ライボルト", "manectric"), ("サメハダー", "sharpedo"),
    ("バクーダ", "camerupt"), ("コータス", "torkoal"), ("チルタリス", "altaria"),
    ("ミロカロス", "milotic"), ("ポワルン", "castform"), ("ジュペッタ", "banette"),
    ("チリーン", "chimecho"), ("アブソル", "absol"), ("オニゴーリ", "glalie"),
    ("ドダイトス", "torterra"), ("ゴウカザル", "infernape"), ("エンペルト", "empoleon"),
    ("レントラー", "luxray"), ("ロズレイド", "roserade"), ("ラムパルド", "rampardos"),
    ("トリデプス", "bastiodon"), ("ミミロップ", "lopunny"), ("ミカルゲ", "spiritomb"),
    ("ガブリアス", "garchomp"), ("ルカリオ", "lucario"), ("カバルドン", "hippowdon"),
    ("ドクロッグ", "toxicroak"), ("ユキノオー", "abomasnow"), ("マニューラ", "weavile"),
    ("ドサイドン", "rhyperior"), ("リーフィア", "leafeon"), ("グレイシア", "glaceon"),
    ("グライオン", "gliscor"), ("マンムー", "mamoswine"), ("エルレイド", "gallade"),
    ("ユキメノコ", "froslass"), ("ロトム", "rotom"), ("ジャローダ", "serperior"),
    ("エンブオー", "emboar"), ("ダイケンキ", "samurott"), ("ミルホッグ", "watchog"),
    ("レパルダス", "liepard"), ("ヤナッキー", "simisage"), ("バオッキー", "simisear"),
    ("ヒヤッキー", "simipour"), ("ドリュウズ", "excadrill"), ("タブンネ", "audino"),
    ("ローブシン", "conkeldurr"), ("エルフーン", "whimsicott"), ("ワルビアル", "krookodile"),
    ("デスカーン", "cofagrigus"), ("ダストダス", "garbodor"), ("ゾロアーク", "zoroark"),
    ("ランクルス", "reuniclus"), ("バイバニラ", "vanilluxe"), ("エモンガ", "emolga"),
    ("シャンデラ", "chandelure"), ("ツンベアー", "beartic"), ("マッギョ", "stunfisk"),
    ("ゴルーグ", "golurk"), ("サザンドラ", "hydreigon"), ("ウルガモス", "volcarona"),
    ("ブリガロン", "chesnaught"), ("マフォクシー", "delphox"), ("ゲッコウガ", "greninja"),
    ("ホルード", "diggersby"), ("ファイアロー", "talonflame"), ("ビビヨン", "vivillon"),
    ("フラエッテ", "floette"), ("フラージェス", "florges"), ("ゴロンダ", "pangoro"),
    ("トリミアン", "furfrou"), ("ニャオニクス", "meowstic-male"), ("ギルガルド", "aegislash-shield"),
    ("フレフワン", "aromatisse"), ("ペロリーム", "slurpuff"), ("ブロスター", "clawitzer"),
    ("エレザード", "heliolisk"), ("ガチゴラス", "tyrantrum"), ("アマルルガ", "aurorus"),
    ("ニンフィア", "sylveon"), ("ルチャブル", "hawlucha"), ("デデンネ", "dedenne"),
    ("ヌメルゴン", "goodra"), ("クレッフィ", "klefki"), ("オーロット", "trevenant"),
    ("パンプジン", "gourgeist-average"), ("クレベース", "avalugg"), ("オンバーン", "noivern"),
    ("ジュナイパー", "decidueye"), ("ガオガエン", "incineroar"), ("アシレーヌ", "primarina"),
    ("ドデカバシ", "toucannon"), ("オニシズクモ", "araquanid"), ("ジャラランガ", "kommo-o"),
    ("マホイップ", "alcremie"), ("モルペコ", "morpeko-full-belly"), ("アヤシシ", "wyrdeer"),
    ("バサギリ", "kleavor"), ("イダイトゥ", "basculegion-male"), ("オオニューラ", "sneasler"),
    ("チャデス", "poltchageist"), ("ヤバソチャ", "sinistcha"), ("ブリジュラス", "archaludon"),
    ("カミツオロチ", "hydrapple"), ("マスカーニャ", "meowscarada"), ("ラウドボーン", "skeledirge"),
    ("ウェーニバル", "quaquaval"), ("ワッカネズミ", "tandemaus"), ("イッカネズミ", "maushold"),
    ("キョジオーン", "garganacl"), ("グレンアルマ", "armarouge"), ("ソウブレイズ", "ceruledge"),
    ("ハラバリー", "bellibolt"), ("スコヴィラン", "scovillain"), ("クエスパトラ", "espathra"),
    ("デカヌチャン", "tinkaton"), ("イルカマン", "palafin-zero"), ("ミミズズ", "orthworm"),
    ("キラフロル", "glimmora"), ("リキキリン", "farigiraf"), ("ドドゲザン", "kingambit"),
    ("ドラパルト", "dragapult"),
    # Classic Megas
    ("メガリザードンX", "charizard-mega-x"), ("メガリザードンY", "charizard-mega-y"),
    ("メガフシギバナ", "venusaur-mega"), ("メガカメックス", "blastoise-mega"),
    ("メガゲンガー", "gengar-mega"), ("メガフーディン", "alakazam-mega"),
    ("メガギャラドス", "gyarados-mega"), ("メガプテラ", "aerodactyl-mega"),
    ("メガミュウツーX", "mewtwo-mega-x"), ("メガミュウツーY", "mewtwo-mega-y"),
    ("メガデンリュウ", "ampharos-mega"), ("メガハッサム", "scizor-mega"),
    ("メガヘラクロス", "heracross-mega"), ("メガバンギラス", "tyranitar-mega"),
    ("メガバシャーモ", "blaziken-mega"), ("メガジュカイン", "sceptile-mega"),
    ("メガラグラージ", "swampert-mega"), ("メガサーナイト", "gardevoir-mega"),
    ("メガクチート", "mawile-mega"), ("メガボスゴドラ", "aggron-mega"),
    ("メガチャーレム", "medicham-mega"), ("メガライボルト", "manectric-mega"),
    ("メガサメハダー", "sharpedo-mega"), ("メガバクーダ", "camerupt-mega"),
    ("メガチルタリス", "altaria-mega"), ("メガジュペッタ", "banette-mega"),
    ("メガアブソル", "absol-mega"), ("メガオニゴーリ", "glalie-mega"),
    ("メガボーマンダ", "salamence-mega"), ("メガメタグロス", "metagross-mega"),
    ("メガラティアス", "latias-mega"), ("メガラティオス", "latios-mega"),
    ("メガレックウザ", "rayquaza-mega"), ("メガガブリアス", "garchomp-mega"),
    ("メガルカリオ", "lucario-mega"), ("メガエルレイド", "gallade-mega"),
    ("メガタブンネ", "audino-mega"), ("メガディアンシー", "diancie-mega"),
    # Forms
    ("アローラライチュウ", "raichu-alola"), ("アローラロコン", "vulpix-alola"),
    ("アローラキュウコン", "ninetales-alola"), ("アローラガラガラ", "marowak-alola"),
    ("アローラナッシー", "exeggutor-alola"), ("ガラルヤドキング", "slowking-galar"),
    ("ガラルサニゴーン", "cursola"), ("ガラルバリヤード", "mr-mime-galar"),
    ("ガラルマッギョ", "stunfisk-galar"), ("ヒスイバクフーン", "typhlosion-hisui"),
    ("ヒスイダイケンキ", "samurott-hisui"), ("ヒスイゾロアーク", "zoroark-hisui"),
    ("ヒスイヌメルゴン", "goodra-hisui"), ("ヒスイウィンディ", "arcanine-hisui"),
    ("パルデアケンタロス(格闘)", "tauros-paldea-combat-breed"),
    ("パルデアケンタロス(炎)", "tauros-paldea-blaze-breed"),
    ("パルデアケンタロス(水)", "tauros-paldea-aqua-breed"),
    ("ドオー", "clodsire")
]

CUSTOM_MEGAS = [
    ("メガメガニウム", "meganium", [80,102,140,103,140,80], "grass", "fairy"),
    ("メガオーダイル", "feraligatr", [85,150,120,89,103,83], "water", "dragon"),
    ("メガバクフーン", "typhlosion", [78,84,78,159,115,120], "fire", "none"),
    ("メガジャローダ", "serperior", [75,85,115,115,115,123], "grass", "dragon"),
    ("メガエンブオー", "emboar", [110,150,85,120,85,78], "fire", "fighting"),
    ("メガダイケンキ", "samurott", [95,130,105,138,90,70], "water", "steel"),
    ("メガデカヌチャン", "tinkaton", [85,115,97,70,124,115], "fairy", "steel"),
    ("メガソウブレイズ", "ceruledge", [75,155,100,60,120,115], "fire", "ghost"),
    ("メガグレンアルマ", "armarouge", [85,60,120,155,100,105], "fire", "psychic"),
    ("メガドラパルト", "dragapult", [88,140,95,120,95,162], "dragon", "ghost"),
    ("メガセグレイブ", "baxcalibur", [115,185,112,75,106,107], "dragon", "ice"),
    ("メガフラエッテ", "floette", [54,45,47,105,128,72], "fairy", "none"), # floette eternal?
    ("メガマフォクシー", "delphox", [75,69,92,154,130,114], "fire", "psychic"),
]

import os

def fetch_pokemon(name_ja, name_en):
    try:
        url = f"https://pokeapi.co/api/v2/pokemon/{name_en}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        
        types = [t['type']['name'] for t in data['types']]
        type1 = types[0]
        type2 = types[1] if len(types) > 1 else 'none'
        
        stats = {s['stat']['name']: s['base_stat'] for s in data['stats']}
        
        moves = []
        
        return {
            "name": name_ja,
            "type1": type1,
            "type2": type2,
            "base": {
                "hp": stats['hp'], "atk": stats['attack'], "def": stats['defense'],
                "spa": stats['special-attack'], "spd": stats['special-defense'], "spe": stats['speed']
            },
            "moves": moves,
            "abilities": []
        }
    except Exception as e:
        print(f"Failed to fetch {name_en}: {e}")
        return None

results = []
for ja, en in POKEMON_MAPPING:
    print(f"Fetching {ja}...")
    p = fetch_pokemon(ja, en)
    if p:
        results.append(p)
    time.sleep(0.2)

for ja, base_en, stats, t1, t2 in CUSTOM_MEGAS:
    results.append({
        "name": ja + " (仮)",
        "type1": t1,
        "type2": t2,
        "base": {
            "hp": stats[0], "atk": stats[1], "def": stats[2],
            "spa": stats[3], "spd": stats[4], "spe": stats[5]
        },
        "moves": [],
        "abilities": []
    })

with open("c:\\Users\\shows\\OneDrive\\デスクトップ\\ポケット\\pokemon_db.js", "w", encoding="utf-8") as f:
    f.write("const POKEMON_DB = [\n")
    for r in results:
        f.write("    " + json.dumps(r, ensure_ascii=False) + ",\n")
    f.write("];\n")

print("Done!")
