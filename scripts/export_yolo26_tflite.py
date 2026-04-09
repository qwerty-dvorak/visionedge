from pathlib import Path

from ultralytics import YOLO


MODEL_ORDER = ["yolo26n.pt", "yolo26s.pt", "yolo26m.pt", "yolo26x.pt"]


def export_model(weights_path: Path) -> None:
    output_path = weights_path.parent / f"{weights_path.stem}_saved_model" / f"{weights_path.stem}_float32.tflite"
    if output_path.exists():
        print(f"[export] skipping {weights_path}; found {output_path}")
        return

    print(f"[export] loading {weights_path}")
    model = YOLO(str(weights_path))
    result_path = model.export(format="tflite")
    print(f"[export] wrote {result_path}")


def main() -> None:
    models_dir = Path("models")
    indexed = [models_dir / name for name in MODEL_ORDER]
    weight_files = [path for path in indexed if path.exists()]

    if not weight_files:
        raise SystemExit("No yolo26*.pt files found under ./models")

    for weight_file in weight_files:
        export_model(weight_file)


if __name__ == "__main__":
    main()
