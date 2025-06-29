#!/usr/bin/env python3

import subprocess
from pathlib import Path

if not Path("setup_done.flag").exists():
    print("Setup has not been run. Please run 'init-setup.py' first.")
    exit(1)
    
def run():

    subprocess.run(["uvicorn", "main:app", "--reload"], cwd="backend")

run()