#!/usr/bin/env python3
import http.server
import ssl

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    server_address = ('localhost', 8000)
    httpd = http.server.HTTPServer(server_address, MyHTTPRequestHandler)
    print("Server running at http://localhost:8000/")
    print("Open http://localhost:8000 in your browser")
    httpd.serve_forever()