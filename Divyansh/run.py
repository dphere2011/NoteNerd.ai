#!/usr/bin/env python3

import subprocess

def run():
    subprocess.run(["uvicorn", "main:app", "--reload"])

run()