import sys
from pathlib import Path
import webview

APP_TITLE = "DARK CYBER PRO ULTRA"

def resource_path(filename: str) -> Path:
    """Resolve bundled assets in development and PyInstaller builds."""
    bundle_dir = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return bundle_dir / filename

def main() -> None:
    html_file = resource_path("index.html")
    if not html_file.is_file():
        raise FileNotFoundError(f"Application UI not found: {html_file}")

    webview.create_window(
        APP_TITLE,
        html_file.as_uri(),
        width=1440,
        height=900,
        min_size=(900, 620),
        background_color="#06030c",
        text_select=True,
    )
    # On Windows, pywebview uses the installed Microsoft Edge WebView2 runtime.
    webview.start(debug=False)

if __name__ == "__main__":
    main()
