#!/usr/bin/env python
#
# Name: Misha Paauw
# Student number: 10054154
# Data Processing UvA
# 1 november 2016
#
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''

import csv

from pattern.web import URL, DOM

# allows printing of strange characters
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

# globals
TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''
    data = []

    for i in dom.by_tag("div.lister-item-content")[:1000]:
        row = []

        # get title 
        for j in i.by_tag("a")[:1]:
            row.append(str(j.content))  

        # get rating
        for j in i.by_tag("strong"):
            row.append(str(j.content)) 

        # get genres
        # TODO: clean content (\n and whitespace)
        for j in i.by_tag("span.genre"):
            genres = str(j.content[1:])
            genres = genres.rstrip()
            row.append(genres)

        # get actors
        actors = []
        for j in i.by_tag("p")[2]:
            for k in j.children:
                actors.append(str(k))
        row.append(", ".join(actors))

        # get runtime
        for j in i.by_tag("span.runtime"):
            row.append(str(filter(lambda x: x.isdigit(), j.content)))
        
        # add new row to data array (list of lists)
        data.append(row)  

    return data


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK

    for i in range(0, len(tvseries)):
        writer.writerow(tvseries[i])

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)
