#!/usr/bin/env python

import xml.sax as sax
import sys
import base64,zlib,gzip,StringIO,json,csv

if len(sys.argv) < 2:
  sys.stderr.write("tmx2json.py file [outputfile] \n");
  sys.exit(-1)

output = sys.stdout

if len(sys.argv) > 2:
  output = open(sys.argv[2],"w")

class TMXHandler(sax.handler.ContentHandler):

  def __init__(self):
    self._tags = set(["tileset","image","layer","data","map"])
    self._pluraltags = ["tileset","image","layer"]
    self._content_tags = set()
    self._content_tags.add("data")
    self._last_tag = None
    self._attributes = {}
    self._stack = []
    self._propertiesState = False
    
  def startElement(self,name,attrs):
    if name in self._tags:
      self._stack.append(name)
      self._last_tag = name
      if name not in self._attributes:
        self._attributes[name] = []
      mydict = {}
      for k in attrs.keys():
        mydict[k] = attrs[k]
      self._attributes[name].append(mydict)
    elif name == 'properties':
      self._propertiesState = True
    elif name == 'property' and self._propertiesState:
      last = self._attributes[self._stack[-1]][-1]
      if "properties" not in last:
        last["properties"] = {}
      last["properties"][attrs["name"]] = attrs["value"]

  def endElement(self,name):
    if name in self._tags:  
      self._stack.pop()
    elif name == 'properties':
      self._propertiesState = False
    

  def characters(self,content):
    content = content.strip()
    if len(content) > 0 and self._last_tag in self._content_tags:
      if self._last_tag == 'data':
        data = self._attributes[self._last_tag][-1]
        if data["encoding"] == 'base64':
          data["content"] = base64.decodestring(content)
          compression = data.get("compression","")
          if compression == "gzip":
            stream = StringIO.StringIO(data["content"])
            gzipObj = gzip.GzipFile(fileobj=stream)
            data["content"] = gzipObj.read()
          elif compression == "zlib":
            data["content"] = zlib.decompress(data["content"])

          asList = []
          for i in xrange(0,len(data["content"]),4):
            asList.append(ord(data["content"][i]) | (ord(data["content"][i+1]) << 8 ) |
                          (ord(data["content"][i+2]) << 16) | (ord(data["content"][i+3]) << 24))
        elif data["encoding"] == 'csv':
          stream = StringIO.StringIO(content)
          reader = csv.reader(stream)
          asList = []
          for row in reader:     
            asList.extend([int(cell) for cell in row if len(cell)> 0])
        else:
          raise ValueError("Support only for CSV and base64 formats")
        if "data" not in self._attributes["layer"][-1]:
          self._attributes["layer"][-1]["data"] = []
        self._attributes["layer"][-1]["data"].extend(asList)

  def toJSON(self):
    for pluraltag in self._pluraltags:
      plural = pluraltag + "s";
      self._attributes[plural] = self._attributes[pluraltag]
      del self._attributes[pluraltag]
    self._attributes["map"] = self._attributes["map"][0]
    return json.dumps(self._attributes)

  def endDocument(self):
    del self._attributes["data"]

parser = sax.make_parser()
tmx_handler = TMXHandler()
parser.setContentHandler(tmx_handler)
parser.parse(sys.argv[1])
output.write(tmx_handler.toJSON())
output.close()
