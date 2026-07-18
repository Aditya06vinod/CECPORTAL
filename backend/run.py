"""
run.py — Development entry point for the CEC Portal Flask backend.

Usage:
    python run.py
"""

from app import app

if __name__ == "__main__":
    print("=" * 56)
    print("  CEC Student Portal — Flask Backend")
    print("  http://localhost:5000")
    print("  API:  http://localhost:5000/api/chat")
    print("  Health: http://localhost:5000/api/health")
    print("=" * 56)
    app.run(host="0.0.0.0", port=5000, debug=True)
