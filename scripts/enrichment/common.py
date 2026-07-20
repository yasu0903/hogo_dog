"""Phase 2.5 エンリッチメントパイプラインの共通処理。

パイプライン構成(各ステップは独立して再実行可能):
  01_inventory.py     species / city 不明の団体を棚卸し → out/targets.json
  02_check_urls.py    全団体URLの死活チェック           → out/url_status.json
  03_fetch_extract.py HTML取得+キーワード周辺抽出      → out/snippets.json
  04_judge_gemini.py  Gemini構造化出力で判定            → out/judgments.json
  05_apply.py         結果を public/data に反映(--write で書き込み)

中間成果物はすべて out/ 以下のJSON。key は "{都道府県english_name}#{団体id}"。
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT / "public" / "data"
ORG_DIR = DATA_DIR / "organizations"
OUT_DIR = Path(__file__).resolve().parent / "out"

USER_AGENT = (
    "Mozilla/5.0 (compatible; hogo-dog-checker/1.0; "
    "+https://github.com/yasu0903/hogo_dog)"
)


def org_key(pref_slug, org_id):
    return f"{pref_slug}#{org_id}"


def iter_org_files():
    """(都道府県slug, ファイルPath, パース済みデータ) を順に返す。"""
    for path in sorted(ORG_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        yield path.stem, path, data


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def save_json(path, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )
