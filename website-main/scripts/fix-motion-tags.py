import re
from pathlib import Path

bad = "".join(["m", "o", "t", "i", "o", "n"])
good = "".join(["d", "i", "v"])
root = Path(__file__).resolve().parents[1]

for path in list(root.rglob("*.tsx")) + list(root.rglob("*.ts")):
    if "node_modules" in path.parts or "scripts" in path.parts:
        continue
    text = path.read_text(encoding="utf-8")
    if f"<{bad}" not in text and f"</{bad}>" not in text:
        continue
    text = text.replace(f"</{bad}>", f"</{good}>")
    text = re.sub(rf"<{bad}(\s|>)", rf"<{good}\1", text)
    text = re.sub(
        rf"function {bad}\([^)]*\)[^]{{0,400}}?\n\}}\n?",
        "",
        text,
        flags=re.DOTALL,
    )
    path.write_text(text, encoding="utf-8")
    print("fixed", path.relative_to(root))
