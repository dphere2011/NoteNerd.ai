#!/usr/bin/env python3

import subprocess

def install_requirements():
    subprocess.check_call(["pip", "install", "--upgrade", "pip"])
    subprocess.check_call(["pip", "install", "-r", "requirements.txt"])

def first_run():
    subprocess.run(["python", "run.py"])
    

install_requirements()
first_run()
