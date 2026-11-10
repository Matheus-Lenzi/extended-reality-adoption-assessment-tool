"""Prove every question and flag text in source/ is verbatim from the workbook.

Each source text (whitespace-normalised) must be a substring of the workbook cell for the same
code: substring, because ECO8/ECO9 are split into their leader and follower halves, and MP1/MP2
end before the workbook's inline answer blanks.
"""
import json, re, subprocess, sys, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parent.parent
if len(sys.argv) < 2:
    print('Usage: python3 scripts/check.py <path to the assessment workbook .xlsx>')
    print('The workbook is not published with this repository.')
    sys.exit(2)
workbook = Path(sys.argv[1])
if not workbook.exists():
    print('Workbook not found: ' + str(workbook))
    sys.exit(2)
M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def normal(text):
    return re.sub(r'\s+', ' ', text or '').strip()


def sheet_rows(book, strings):
    relations = ET.fromstring(book.read('xl/_rels/workbook.xml.rels'))
    targets = {relation.get('Id'): relation.get('Target') for relation in relations}
    for sheet in ET.fromstring(book.read('xl/workbook.xml')).find(M + 'sheets'):
        path = 'xl/' + targets[sheet.get(R + 'id')].lstrip('/').replace('xl/', '')
        for row in ET.fromstring(book.read(path)).iter(M + 'row'):
            cells = {}
            for cell in row.iter(M + 'c'):
                value = cell.find(M + 'v')
                if value is None:
                    continue
                column = re.match(r'[A-Z]+', cell.get('r')).group()
                cells[column] = strings[int(value.text)] if cell.get('t') == 's' else value.text
            yield sheet.get('name'), cells


book = zipfile.ZipFile(workbook)
strings = [''.join(t.text or '' for t in item.iter(M + 't'))
           for item in ET.fromstring(book.read('xl/sharedStrings.xml')).findall(M + 'si')]

questions, flags, headers = {}, {}, {}
for name, cells in sheet_rows(book, strings):
    first = normal(cells.get('A'))
    if first in ('Code', 'Rule ID'):
        headers[name] = {normal(value): column for column, value in cells.items()}
        continue
    columns = headers.get(name, {})
    if 'Question' in columns and first:
        questions[first] = normal(cells.get(columns['Question']))
    if 'Flag text' in columns and first:
        flags[first] = normal(cells.get(columns['Flag text']))

sourceText = subprocess.run(
    ['node', '-e', "const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);"
     "for(const f of ['items','rules'])vm.runInContext(fs.readFileSync('source/'+f+'.js','utf8'),c);"
     "console.log(JSON.stringify(vm.runInContext('({items:items.map((i)=>({code:i.code,text:i.text,displayText:i.displayText})),rules:rules.map((r)=>({id:r.id,text:r.text}))})',c)))"],
    cwd=root, capture_output=True, text=True, check=True)
data = json.loads(sourceText.stdout)

failures = []
edited = [item['code'] for item in data['items'] if item.get('displayText')]
for item in data['items']:
    code = re.sub(r'(L|F)$', '', item['code']) if item['code'].startswith('ECO8') or item['code'].startswith('ECO9') else item['code']
    source = questions.get(code)
    if source is None or normal(item['text']).rstrip(':') not in source:
        failures.append(f"question {item['code']}: not found verbatim")
for rule in data['rules']:
    source = flags.get(rule['id'])
    if source is None or normal(rule['text']) != source:
        failures.append(f"flag {rule['id']}: not verbatim")

print(f"{len(data['items'])} questions, {len(data['rules'])} flag texts checked against {workbook.name}")
if edited:
    print(f"{len(edited)} questions show edited text pending a workbook update: " + ', '.join(edited))
print('\n'.join(failures) if failures else 'ALL VERBATIM')
sys.exit(1 if failures else 0)
