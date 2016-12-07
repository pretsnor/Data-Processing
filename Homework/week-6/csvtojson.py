"""
csvtojson.py

Misha Paauw
10054154

Data Processing 
Minor Programmeren
Universiteit van Amsterdam
23 - 11 - 2016

converts a csv to a json file

"""
import csv
import json
import codecs

# filenames
in_csv = "maastricht.csv"
out_json = "maastricht.json"

# open files
csvfile = codecs.open(in_csv, 'r', encoding="utf-8-sig")
jsonfile = open(out_json, 'w')

# read csv
reader = csv.DictReader(csvfile)

# save as json row by row
out = json.dumps([row for row in reader]) 
jsonfile.write(out)

