import re
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "components" / "Nav.tsx"
text = p.read_text(encoding="utf-8")

# Invalid tag name in file: m-o-t-i-o-n (6 chars)
bad = "".join(["m", "o", "t", "i", "o", "n"])
good = "".join(["d", "i", "v"])

text = text.replace(f"</{bad}>", f"</{good}>")
text = re.sub(rf"<{bad}(\s)", rf"<{good}\1", text)

p.write_text(text, encoding="utf-8")
print("ok", bad, "->", good)
