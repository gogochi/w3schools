#!/usr/bin/env python3
"""Local dev server for the practice site.

Replaces `python3 -m http.server` for local development:

- Serves static files from the repo root.
- Sends `Cache-Control: no-store` so ES module changes show up immediately
  without query-string cache busting.
- Adds `POST /api/submit` which appends student answers to `data/answers.csv`,
  acting as a stand-in for the Apps Script + Google Sheet backend.

No external dependencies. Run from anywhere:

    python3 scripts/dev-server.py            # port 8000
    python3 scripts/dev-server.py 9000       # custom port
"""

import csv
import json
import os
import re
import sys
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSV_PATH = os.path.join(ROOT, 'data', 'answers.csv')
HEADERS = ['timestamp', 'studentId', 'questionId', 'kind', 'questionEn',
           'selected', 'correct', 'meta']
STUDENT_RE = re.compile(r'^[A-Za-z0-9]{4,15}$')


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable HTTP cache during dev (ES module cache otherwise pins the
        # first version of a module for the lifetime of the page).
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        if self.path != '/api/submit':
            self.send_error(404, 'Unknown endpoint')
            return
        try:
            length = int(self.headers.get('Content-Length') or '0')
            raw = self.rfile.read(length).decode('utf-8') if length else ''
            payload = json.loads(raw)
            student_id = str(payload.get('studentId', '')).strip()
            answers = payload.get('answers') or []
            if not STUDENT_RE.match(student_id):
                return self._json({'ok': False,
                                   'error': 'bad studentId (need 4-15 alnum)'})
            if not isinstance(answers, list) or not answers:
                return self._json({'ok': False, 'error': 'no answers'})

            need_header = not os.path.exists(CSV_PATH)
            os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
            ts = datetime.now().isoformat(timespec='seconds')
            with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
                w = csv.writer(f)
                if need_header:
                    w.writerow(HEADERS)
                for a in answers:
                    sel = a.get('selected')
                    if not isinstance(sel, str):
                        sel = json.dumps(sel, ensure_ascii=False)
                    meta = a.get('meta')
                    if meta is None:
                        meta = ''
                    elif not isinstance(meta, str):
                        meta = json.dumps(meta, ensure_ascii=False)
                    w.writerow([
                        ts,
                        student_id,
                        a.get('id', ''),
                        a.get('kind', ''),
                        a.get('questionEn', ''),
                        sel,
                        '1' if a.get('correct') is True else '0',
                        meta,
                    ])
            self._json({'ok': True, 'count': len(answers)})
        except Exception as exc:  # noqa: BLE001
            self._json({'ok': False, 'error': f'{type(exc).__name__}: {exc}'})

    def _json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # quieter access log
    def log_message(self, fmt, *args):
        sys.stderr.write(f'[{self.log_date_time_string()}] {fmt % args}\n')


def main():
    os.chdir(ROOT)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    httpd = ThreadingHTTPServer(('', port), Handler)
    rel_csv = os.path.relpath(CSV_PATH, ROOT)
    print(f'Serving {ROOT}')
    print(f'  http://localhost:{port}/web/admin.html       老師端')
    print(f'  http://localhost:{port}/web/?q=...           學生端')
    print(f'  POST /api/submit -> {rel_csv}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nshutdown')


if __name__ == '__main__':
    main()
