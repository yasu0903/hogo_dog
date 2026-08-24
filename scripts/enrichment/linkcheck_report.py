#!/usr/bin/env python3
"""月次リンクチェックのレビュー用サマリを生成する(CI専用の薄いスクリプト)。

out/url_status.json と linkcheck_apply.py のログから、
  - link_broken を付与した確定分(= 掲載リンクが画面から消える団体)
  - 判定不能で org JSON に触っていない分(blocked / unstable / review)
を Markdown にまとめ、PR本文($2)と GitHub Actions のジョブサマリに出力する。

usage: python3 scripts/enrichment/linkcheck_report.py <apply_log> <pr_body_out>
"""

import os
import sys
from collections import defaultdict
from pathlib import Path

from common import OUT_DIR, load_json

VERDICT_LABEL = {
    "blocked": "アクセス拒否(401/403/429)",
    "unstable": "一時障害(5xx/タイムアウト/接続エラー)",
    "review": "プラットフォーム都合の応答",
}


def main():
    apply_log = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    body_out = Path(sys.argv[2]) if len(sys.argv) > 2 else None

    status = load_json(OUT_DIR / "url_status.json")
    review_path = OUT_DIR / "linkcheck_review.json"
    review = load_json(review_path) if review_path.exists() else []

    counts = defaultdict(int)
    for v in status.values():
        counts[v.get("verdict", "ok")] += 1

    broken = sorted(
        (k, v) for k, v in status.items() if v.get("verdict") == "broken"
    )

    lines = [
        "`02_check_urls.py` の死活チェック結果を `linkcheck_apply.py` で反映しました。",
        "変更は各団体JSONの `link_broken` / `last_verified` の2値のみです。",
        "",
        "| 判定 | 件数 | org JSON への反映 |",
        "| --- | ---: | --- |",
        f"| ok 生存 | {counts['ok']} | `last_verified` 更新 / `link_broken` 削除 |",
        f"| broken 死亡確定 | {counts['broken']} | **`link_broken: true` 付与** |",
        f"| blocked 拒否 | {counts['blocked']} | 変更なし(要目視) |",
        f"| unstable 一時障害 | {counts['unstable']} | 変更なし(要目視) |",
        f"| review 要判断 | {counts['review']} | 変更なし(要目視) |",
        "",
        "⚠️ **リンク切れ→非掲載は編集判断です。マージ前に差分を必ずレビューしてください。**",
        "`link_broken: true` が付いた団体はサイトへのリンクが画面から消えます。",
        "",
    ]

    if broken:
        lines += [f"### link_broken を付与した {len(broken)}件", ""]
        lines += [f"- `{k}` {v['url']} ({v.get('reason')})" for k, v in broken]
        lines += [""]

    if review:
        lines += [
            f"### 判定不能 {len(review)}件(org JSON は未変更)",
            "",
            "ボット遮断やレート制限の可能性が高く、自動では判断していません。",
            "実際に死んでいる場合は `scripts/enrichment/manual_overrides.json` に",
            '`{"<pref>#<id>": {"link_broken": true}}` を追加して確定させてください。',
            "",
        ]
        by_verdict = defaultdict(list)
        for r in review:
            by_verdict[r["verdict"]].append(r)
        for verdict, rows in sorted(by_verdict.items()):
            lines += [f"**{VERDICT_LABEL.get(verdict, verdict)}** {len(rows)}件", ""]
            lines += [
                f"- `{r['key']}` {r['name']} — {r['url']} ({r['reason']})"
                for r in sorted(rows, key=lambda r: r["key"])
            ]
            lines += [""]

    lines += ["Actions ログの「Apply liveness results」ステップに全件の一覧が出ています。"]
    body = "\n".join(lines) + "\n"

    if body_out:
        body_out.write_text(body, encoding="utf-8")
        print(f"→ {body_out}")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(body)

    if apply_log and apply_log.exists():
        print(apply_log.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
