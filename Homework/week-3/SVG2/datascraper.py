"""
datascraper.py

Misha Paauw
10054154

Data Processing 
Minor Programmeren
Universiteit van Amsterdam
16 - 11 - 2016

scrapes european CO2 emission data from data.worldbank
returns a JSON object to be pasted into text area of svg2.html

"""

# imports
from pattern.web import URL, DOM, plaintext
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT
import json

# globals
target_url = "http://wdi.worldbank.org/table/3.8"
backup_html = "co2data.html"
output_JSON = "emission_data.json"

def scrape_emissions(dom):
	"""
	extracts CO2 emission data per country from a DOM (wdi databank)

	A list is created for every country
	"""

	data = []

	for i in dom.by_tag("div.scrollable"):
		for j in i.by_tag("tr"):
			row = []
			# get country name
			for k in j.by_tag("td.country"):
				row.append(plaintext(k.content))
			# get co2 emissions in 2013
			for k in j.by_tag("td")[10]:
				# handles missing values
				if k.content == "..":
					row.append(-1.0)
				else:
					row.append(float(unicode(k.content)))
			data.append(row)
	
	# write to JSON 
	with open(output_JSON, 'w') as outfile:
		json.dump(data, outfile, indent = 4)



if __name__ == '__main__':
   
    # Download the HTML file
    url = URL(target_url)
    html = url.download()

    # Save a copy to disk in the current directory for backup
    with open(backup_html, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the data
    scrape_emissions(dom)

  